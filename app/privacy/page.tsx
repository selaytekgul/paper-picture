import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <a className="skip-link" href="#privacy">Skip to privacy notice</a>
      <nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link><div className="profile-nav-actions"><Link href="/feedback">Contact</Link><Link href="/profile">My profile</Link></div></nav>
      <article id="privacy">
        <div className="eyebrow"><span /> Privacy & data</div>
        <h1>A small, private player record.</h1>
        <p>Paper Picture uses the site’s ChatGPT sign-in to recognize you. Your profile and saved games are private: there is no public profile, leaderboard, social graph, or advertising tracker in this MVP.</p>
        <h2>What is stored</h2>
        <p>We store a display name, a one-way keyed identifier derived from your normalized sign-in email, collection version, randomized paper order, game timestamps, selected answer indexes, figures viewed, correctness, assisted-round status, and scores. Feedback may include its category, rating, related paper, and the text you submit. We do not store your raw sign-in email or ChatGPT access tokens in the gameplay database.</p>
        <h2>Why it is stored</h2>
        <p>This information powers your private history and aggregate test measures such as starts, completions, accuracy, and assisted play. Submitted feedback is available to the project owner for review, follow-up, and CSV export; it is not shown to other players. There is no advertising analytics or cross-site tracking. Scores are casual educational results rather than a secure competition.</p>
        <h2>Retention</h2>
        <p>Unfinished game sessions are removed after 7 days. Submitted feedback is removed after 365 days. Completed games and your display name remain until you delete the profile so your history stays available. Short-lived rate-limit counters are removed after approximately 2 days.</p>
        <h2>Your controls</h2>
        <p>You can change your display name or permanently delete the profile, completed games, attempts, feedback, and request counters from <Link href="/profile">My profile</Link>. Signing out ends your authenticated site session but does not delete saved data.</p>
        <h2>Contact and corrections</h2>
        <p>The Paper Picture project operates this test. Use the authenticated <Link href="/feedback">feedback and contact form</Link> for privacy questions, factual corrections, accessibility issues, or copyright and takedown requests. Select the relevant category so it can be triaged appropriately.</p>
        <h2>Research figures</h2>
        <p>The figures in the current collection are publisher-provided images from openly licensed research articles. Each game answer links to the paper, figure source, and license evidence.</p>
        <p className="legal-version">Privacy notice version: 12 July 2026 · revision 3</p>
      </article>
    </main>
  );
}
