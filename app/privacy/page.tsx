import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link><Link href="/profile">My profile</Link></nav>
      <article>
        <div className="eyebrow"><span /> Privacy & data</div>
        <h1>A small, private player record.</h1>
        <p>Paper Picture uses the site’s ChatGPT sign-in to recognize you. Your profile and saved games are private: there is no public profile, leaderboard, social graph, or advertising tracker in this MVP.</p>
        <h2>What is stored</h2>
        <p>We store a display name, a one-way keyed identifier derived from your normalized sign-in email, game session timestamps, selected answer indexes, figures revealed, correctness, and scores. We do not store your raw sign-in email or ChatGPT access tokens in the gameplay database.</p>
        <h2>Why it is stored</h2>
        <p>This information powers your game history, best score, accuracy, and figures-studied totals. All scores are labeled casual because this first version is designed for learning, not secure competition.</p>
        <h2>Your controls</h2>
        <p>You can change your display name or permanently delete the profile and all associated games from <Link href="/profile">My profile</Link>. Signing out ends your authenticated site session but does not delete saved data.</p>
        <h2>Research figures</h2>
        <p>The figures in the current collection are publisher-provided images from openly licensed research articles. Each game answer links to the paper, figure source, and license evidence.</p>
        <p className="legal-version">Privacy notice version: 12 July 2026</p>
      </article>
    </main>
  );
}
