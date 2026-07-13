"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AuthProvider } from "../../auth-service";
import SignOutControl from "../../sign-out-control";

type FeedbackStatus = "new" | "reviewing" | "resolved";
type FeedbackItem = {
  id: string;
  collectionId: string;
  paperId: string | null;
  paperTitle: string | null;
  category: string;
  message: string;
  rating: number | null;
  createdAt: number;
  status: FeedbackStatus;
  displayName: string;
};

type FeedbackResponse = {
  feedback: FeedbackItem[];
  collections: Array<{ id: string; label: string }>;
  error?: string;
};

type MetricsResponse = {
  windowDays: number;
  totals: Record<string, number>;
  privacy: string;
  error?: string;
};

const statuses: Array<FeedbackStatus | "all"> = ["all", "new", "reviewing", "resolved"];

export default function FeedbackAdminClient({ authProvider, signOutDestination }: { authProvider: AuthProvider; signOutDestination: string }) {
  const [data, setData] = useState<FeedbackResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    void loadFeedback();
  }, []);

  async function loadFeedback() {
    setError("");
    try {
      const [feedbackResponse, metricsResponse] = await Promise.all([
        fetch("/api/admin/feedback", { cache: "no-store" }),
        fetch("/api/admin/metrics", { cache: "no-store" }),
      ]);
      const result = await feedbackResponse.json() as FeedbackResponse;
      const metricResult = await metricsResponse.json() as MetricsResponse;
      if (!feedbackResponse.ok) throw new Error(result.error ?? "Could not load feedback.");
      if (!metricsResponse.ok) throw new Error(metricResult.error ?? "Could not load operational totals.");
      setData(result);
      setMetrics(metricResult);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load feedback.");
    }
  }

  const categories = useMemo(() => ["all", ...new Set((data?.feedback ?? []).map((item) => item.category))], [data]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.feedback ?? []).filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!needle) return true;
      return [item.message, item.displayName, item.paperTitle ?? "", item.category].some((value) => value.toLowerCase().includes(needle));
    });
  }, [categoryFilter, data, query, statusFilter]);

  const counts = useMemo(() => Object.fromEntries(statuses.map((status) => [status, status === "all" ? (data?.feedback.length ?? 0) : (data?.feedback.filter((item) => item.status === status).length ?? 0)])), [data]);
  const ratings = (data?.feedback ?? []).flatMap((item) => item.rating === null ? [] : [item.rating]);
  const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : "—";

  async function changeStatus(item: FeedbackItem, status: FeedbackStatus) {
    const previous = item.status;
    setUpdating(item.id);
    setError("");
    setData((current) => current ? { ...current, feedback: current.feedback.map((entry) => entry.id === item.id ? { ...entry, status } : entry) } : current);
    try {
      const response = await fetch(`/api/admin/feedback/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update feedback.");
    } catch (updateError) {
      setData((current) => current ? { ...current, feedback: current.feedback.map((entry) => entry.id === item.id ? { ...entry, status: previous } : entry) } : current);
      setError(updateError instanceof Error ? updateError.message : "Could not update feedback.");
    } finally {
      setUpdating(null);
    }
  }

  function downloadCsv() {
    const header = ["date", "status", "category", "rating", "paper", "display_name", "message"];
    const rows = visible.map((item) => [new Date(item.createdAt).toISOString(), item.status, item.category, item.rating ?? "", item.paperTitle ?? "", item.displayName, item.message]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `paper-picture-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-shell">
      <nav className="topbar profile-nav">
        <Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link>
        <div className="profile-nav-actions"><Link href="/profile">My profile</Link><Link href="/">Play</Link><SignOutControl provider={authProvider} destination={signOutDestination} /></div>
      </nav>

      <header className="admin-heading">
        <div><div className="eyebrow"><span /> Owner workspace</div><h1>Feedback inbox</h1><p>Review submitted test comments without exposing account emails or internal player identifiers.</p></div>
        <div className="admin-heading-actions"><button className="secondary-button" onClick={() => void loadFeedback()}>Refresh</button><a className="secondary-button" href="/api/admin/backup" download>Private backup <span>↓</span></a><button className="primary-button" onClick={downloadCsv} disabled={!visible.length}>Download CSV <span>↓</span></button></div>
      </header>

      <section className="admin-summary" aria-label="Feedback summary">
        <article><span>Total</span><strong>{counts.all}</strong></article>
        <article><span>New</span><strong>{counts.new}</strong></article>
        <article><span>Reviewing</span><strong>{counts.reviewing}</strong></article>
        <article><span>Resolved</span><strong>{counts.resolved}</strong></article>
        <article><span>Average rating</span><strong>{averageRating}<small>{ratings.length ? " / 5" : ""}</small></strong></article>
      </section>

      <section className="admin-summary operations-summary" aria-label="Operational totals for the last seven days">
        <article><span>Games started · 7d</span><strong>{metrics?.totals.game_started ?? "—"}</strong></article>
        <article><span>Games completed · 7d</span><strong>{metrics?.totals.game_completed ?? "—"}</strong></article>
        <article><span>Answers saved · 7d</span><strong>{metrics?.totals.attempt_saved ?? "—"}</strong></article>
        <article><span>API errors · 7d</span><strong>{metrics?.totals.api_error ?? "—"}</strong></article>
        <article><span>Completion rate</span><strong>{metrics && metrics.totals.game_started ? `${Math.round(((metrics.totals.game_completed ?? 0) / metrics.totals.game_started) * 100)}%` : "—"}</strong></article>
      </section>
      <p className="operations-privacy">{metrics?.privacy ?? "Loading privacy-safe operational totals…"}</p>

      <section className="admin-controls" aria-label="Feedback filters">
        <label>Search<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Message, paper, player…" /></label>
        <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as FeedbackStatus | "all")}>{statuses.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : `${status} (${counts[status]})`}</option>)}</select></label>
        <label>Category<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>{categories.map((category) => <option key={category} value={category}>{category === "all" ? "All categories" : category}</option>)}</select></label>
        <span>{visible.length} of {data?.feedback.length ?? 0} shown</span>
      </section>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {!data && !error ? <p className="admin-empty">Loading submitted feedback…</p> : visible.length === 0 ? <p className="admin-empty">No feedback matches these filters.</p> : (
        <section className="feedback-inbox" aria-live="polite">
          {visible.map((item) => (
            <article className="feedback-entry" key={item.id}>
              <div className="feedback-entry-meta"><time dateTime={new Date(item.createdAt).toISOString()}>{new Date(item.createdAt).toLocaleString()}</time><span>{item.category}</span>{item.rating && <span>{item.rating} / 5</span>}</div>
              <p>{item.message}</p>
              <div className="feedback-entry-footer"><div><b>{item.displayName}</b><span>{item.paperTitle ?? "General collection feedback"}</span></div><label>Status<select value={item.status} disabled={updating === item.id} onChange={(event) => void changeStatus(item, event.target.value as FeedbackStatus)}>{statuses.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>
            </article>
          ))}
        </section>
      )}
      <footer className="profile-footer"><span>{data?.collections.length ?? 2} collections · Owner-only</span><span>Up to 500 newest entries · <Link href="/privacy">Privacy & data</Link></span></footer>
    </main>
  );
}

function csvCell(value: string | number) {
  const stringValue = String(value);
  return /[",\r\n]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue;
}
