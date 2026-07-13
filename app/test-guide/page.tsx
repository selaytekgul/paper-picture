import type { Metadata } from "next";
import Link from "next/link";
import { collectionCatalog, collectionStats, gameModes } from "../../data/papers";

export const metadata: Metadata = {
  title: "Tester guide — Paper Picture",
  description: "How to play, score, and give useful feedback on Paper Picture.",
  alternates: { canonical: "/test-guide" },
  openGraph: { url: "/test-guide" },
};

export default function TestGuidePage() {
  const totalPapers = collectionCatalog.reduce((total, collection) => total + collectionStats(collection.id).paperCount, 0);
  const totalFigures = collectionCatalog.reduce((total, collection) => total + collectionStats(collection.id).figureCount, 0);
  return (
    <main className="legal-shell">
      <a className="skip-link" href="#guide">Skip to test guide</a>
      <nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link><Link href="/feedback">Give feedback</Link></nav>
      <article id="guide">
        <div className="eyebrow"><span /> Tester guide</div><h1>Help us test the idea, not just the score.</h1>
        <p>Paper Picture has {collectionCatalog.length} separately frozen, rights-audited collections containing {totalPapers} papers and {totalFigures} figures. Each six-paper game has a perfect unassisted score of 600 points.</p>
        <h2>Choose a mode</h2><p>You can play {gameModes.map((mode) => mode.label.toLowerCase()).join(", ")}. Each mode uses verified publication metadata and deterministic distractors drawn from the real paper catalog.</p>
        <h2>How scoring works</h2><p>A correct answer is worth 100 points from the first figure, 70 after a second figure, and 40 after a third. Incorrect answers score zero. The server recalculates every saved score.</p>
        <h2>Assisted games</h2><p>Attribution stays visible at all times. Opening a figure’s source before answering marks that round assisted because the publication page can reveal the authors. Assisted games remain in your private history but are labeled separately.</p>
        <h2>What to examine</h2><p>Notice whether the images provide meaningful clues, the options feel plausible, the difficulty is enjoyable, citations are correct, keyboard and mobile use work, and the explanation after each answer is useful.</p>
        <h2>Test conduct</h2><p>Scores are casual educational results, not a secure competition. Please do not automate requests, submit personal or confidential information, or redistribute figures without retaining their displayed attribution and CC BY license information.</p>
        <h2>Success criteria</h2><p>The test is successful when players can finish and save a game, understand why answers are correct, find the experience enjoyable, and report no material metadata, accessibility, privacy, or rights problems.</p>
        <div className="guide-actions"><Link className="primary-button" href="/">Choose a game <span>→</span></Link><Link className="secondary-button" href="/feedback">Send feedback</Link></div>
      </article>
    </main>
  );
}
