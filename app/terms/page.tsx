import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of use — Paper Picture",
  description: "The terms that apply when playing Paper Picture or using an optional private player profile.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="legal-shell">
      <a className="skip-link" href="#terms">Skip to terms of use</a>
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link>
        <div className="profile-nav-actions"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link></div>
      </nav>
      <article id="terms">
        <div className="eyebrow"><span /> Terms of use</div>
        <h1>A small research game, used responsibly.</h1>
        <p>These terms apply when you access or use Paper Picture. By using the service, you agree to use it lawfully and in a way that does not interfere with the service or other people. If you do not agree, do not use the service.</p>

        <h2>What Paper Picture provides</h2>
        <p>Paper Picture is an independent visual guessing game for exploring computer graphics and digital geometry research. It is provided for education, discovery, and informal entertainment. It is not an official service of a conference, publisher, university, or the authors whose work appears in the game.</p>

        <h2>Accounts and acceptable use</h2>
        <p>You may play without signing in. If you use an optional private profile, you are responsible for access to the sign-in provider account you choose. Do not attempt to disrupt the service, bypass access controls, submit unlawful material, automate abusive traffic, impersonate another person, or use Paper Picture to infringe another person&apos;s rights.</p>

        <h2>Research information</h2>
        <p>Paper titles, authors, affiliations, venues, dates, topics, and answers are prepared carefully, but research metadata can change or contain mistakes. Paper Picture does not guarantee that every item is complete or error-free. Please report a factual correction through the <Link href="/feedback">feedback form</Link>.</p>

        <h2>Figures and third-party rights</h2>
        <p>Research figures remain subject to the rights and licences identified with each figure. Source and licence links are provided in the game. Paper Picture does not claim ownership of third-party papers, figures, institutional names, conference names, or publisher materials. Rights questions and takedown requests can be submitted through the <Link href="/feedback">feedback form</Link>.</p>

        <h2>Privacy and sign-in providers</h2>
        <p>The <Link href="/privacy">privacy notice</Link> explains how optional profiles, saved games, feedback, aggregate operational counters, and Google, GitHub, or ChatGPT sign-in are handled. Third-party sign-in providers and linked websites operate under their own terms and policies.</p>

        <h2>Availability and changes</h2>
        <p>The service is provided as available and may be changed, interrupted, or discontinued. Features, collections, and these terms may be updated as the project develops. Material changes will be reflected by the revision date below.</p>

        <h2>Contact</h2>
        <p>Use the <Link href="/feedback">feedback and contact form</Link> for questions about these terms, accessibility, privacy, factual corrections, or rights concerns.</p>
        <p className="legal-version">Terms version: 14 July 2026 · revision 1</p>
      </article>
    </main>
  );
}
