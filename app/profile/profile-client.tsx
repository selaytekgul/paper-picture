"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type ProfileData = {
  profile: { displayName: string; createdAt: number };
  stats: {
    gamesPlayed: number;
    bestScore: number;
    correctAnswers: number;
    totalAnswers: number;
    accuracy: number;
    figuresRevealed: number;
    assistedAnswers: number;
  };
  recent: Array<{
    id: string;
    score: number;
    maximumScore: number;
    correctCount: number;
    roundCount: number;
    figuresRevealed: number;
    assistedCount: number;
    scoreClass: "casual" | "assisted";
    collectionLabel: string;
    completedAt: number;
  }>;
};

export default function ProfileClient({ suggestedName, signOutPath }: { suggestedName: string; signOutPath: string }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [name, setName] = useState(suggestedName);
  const [status, setStatus] = useState("Loading your private profile…");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = await response.json() as ProfileData & { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not load your profile.");
        setData(result);
        setName(result.profile.displayName);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load your profile.");
      }
    })();
  }, []);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      const result = await response.json() as ProfileData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update your name.");
      setData(result);
      setName(result.profile.displayName);
      setStatus("Display name updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update your name.");
    } finally {
      setSaving(false);
    }
  }

  async function eraseProfile() {
    if (!window.confirm("Permanently delete your Paper Picture profile and all saved games? This cannot be undone.")) return;
    setDeleting(true);
    setStatus("");
    try {
      const response = await fetch("/api/profile", { method: "DELETE" });
      const result = await response.json() as { deleted?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not delete your profile.");
      window.location.assign("/?profile=deleted");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not delete your profile.");
      setDeleting(false);
    }
  }

  return (
    <main className="profile-shell">
      <nav className="topbar profile-nav">
        <Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link>
        <div className="profile-nav-actions"><Link href="/feedback">Feedback</Link><Link href="/">Play</Link><a href={signOutPath}>Sign out</a></div>
      </nav>

      <section className="profile-heading">
        <div><div className="eyebrow"><span /> Private player profile</div><h1>{data?.profile.displayName ?? name}</h1><p>Your saved games are visible only to you. Scores are casual and are not a public ranking.</p></div>
        <form onSubmit={saveName} className="name-form"><label htmlFor="display-name">Display name</label><div><input id="display-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={40} /><button disabled={saving}>{saving ? "Saving…" : "Save"}</button></div></form>
      </section>

      {status && <p className="profile-status" role="status">{status}</p>}

      <section className="stat-grid" aria-label="Player statistics">
        <article><span>Games played</span><strong>{data?.stats.gamesPlayed ?? "—"}</strong></article>
        <article><span>Best score</span><strong>{data?.stats.bestScore ?? "—"}<small> points</small></strong></article>
        <article><span>Answer accuracy</span><strong>{data ? `${data.stats.accuracy}%` : "—"}</strong></article>
        <article><span>Figures studied</span><strong>{data?.stats.figuresRevealed ?? "—"}</strong></article>
      </section>

      <section className="history-section">
        <div className="section-title"><div><div className="eyebrow"><span /> Recent activity</div><h2>Saved games</h2></div><Link className="primary-button" href="/">Play a new game <span>→</span></Link></div>
        {!data ? <p className="empty-history">Your game history is loading.</p> : data.recent.length === 0 ? <p className="empty-history">No completed games yet. Finish the collection and your score will appear here.</p> : (
          <div className="history-list">
            {data.recent.map((game) => <article key={game.id}><div><b>{new Date(game.completedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</b><span>{game.collectionLabel}</span></div><div><span className={`history-class ${game.scoreClass}`}>{game.scoreClass}{game.assistedCount ? ` · ${game.assistedCount}` : ""}</span><span>{game.correctCount}/{game.roundCount} correct</span><span>{game.figuresRevealed} figures</span><strong>{game.score}<small> / {game.maximumScore}</small></strong></div></article>)}
          </div>
        )}
      </section>

      <section className="danger-zone"><div><h2>Delete profile</h2><p>Erase your display name, game history, attempts, feedback, and request counters permanently.</p></div><button onClick={eraseProfile} disabled={deleting}>{deleting ? "Deleting…" : "Delete all my data"}</button></section>
      <footer className="profile-footer"><span>Private by default · Casual and assisted scores</span><span><Link href="/feedback">Contact</Link> · <Link href="/privacy">Privacy & data</Link></span></footer>
    </main>
  );
}
