"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { collectionCatalog, getPlayablePapers } from "../../data/papers";
import type { AuthProvider } from "../auth-service";
import SignOutControl from "../sign-out-control";

export default function FeedbackClient({ authProvider, signOutDestination }: { authProvider: AuthProvider; signOutDestination: string }) {
  const [category, setCategory] = useState("gameplay");
  const [collectionId, setCollectionId] = useState<string>(collectionCatalog[1]?.id ?? collectionCatalog[0].id);
  const [paperId, setPaperId] = useState("");
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, collectionId, paperId: paperId || null, rating: rating ? Number(rating) : null, message }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Feedback could not be sent.");
      setMessage("");
      setRating("");
      setStatus("Thank you. Your feedback was recorded for this test collection.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Feedback could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="form-shell">
      <a className="skip-link" href="#feedback-form">Skip to feedback form</a>
      <nav className="topbar profile-nav" aria-label="Primary navigation"><Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link><div className="profile-nav-actions"><Link href="/test-guide">Test guide</Link><SignOutControl provider={authProvider} destination={signOutDestination} /></div></nav>
      <section className="form-heading"><div className="eyebrow"><span /> Public-test preparation</div><h1>Tell us what you noticed.</h1><p>Use this form for gameplay feedback, factual corrections, accessibility problems, bugs, privacy questions, or copyright and takedown requests.</p></section>
      <form id="feedback-form" className="feedback-form" onSubmit={submit}>
        <div className="form-grid feedback-form-grid">
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="gameplay">Gameplay</option><option value="difficulty">Difficulty</option><option value="metadata">Paper or affiliation correction</option><option value="copyright">Copyright or takedown</option><option value="accessibility">Accessibility</option><option value="bug">Bug</option><option value="privacy">Privacy</option><option value="other">Other</option></select></label>
          <label>Collection<select value={collectionId} onChange={(event) => { setCollectionId(event.target.value); setPaperId(""); }}>{collectionCatalog.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>Related paper<select value={paperId} onChange={(event) => setPaperId(event.target.value)}><option value="">Whole collection / not applicable</option>{getPlayablePapers(collectionId).map((paper) => <option key={paper.id} value={paper.id}>{paper.title}</option>)}</select></label>
          <label>Overall rating <span>(optional)</span><select value={rating} onChange={(event) => setRating(event.target.value)}><option value="">No rating</option><option value="5">5 — excellent</option><option value="4">4 — good</option><option value="3">3 — neutral</option><option value="2">2 — difficult</option><option value="1">1 — poor</option></select></label>
        </div>
        <label>Details<textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={2000} required rows={8} placeholder="What happened, what did you expect, and which round or device were you using?" /><small>{message.length}/2000 characters</small></label>
        <div className="form-submit"><button className="primary-button" disabled={sending}>{sending ? "Sending…" : "Send feedback"}<span>→</span></button><p>Attached to {collectionCatalog.find((item) => item.id === collectionId)?.label}. Stored privately for up to 365 days.</p></div>
        {status && <p className="profile-status" role="status" aria-live="polite">{status}</p>}
      </form>
    </main>
  );
}
