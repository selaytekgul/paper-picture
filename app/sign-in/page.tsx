import type { Metadata } from "next";
import Link from "next/link";
import { getConfiguredOAuthProviders } from "../../auth";
import { chatGPTSignInPath, safeRelativeReturnPath } from "../chatgpt-auth";
import SignInClient from "./sign-in-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in — Paper Picture",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; return_to?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(params.return_to);
  const configured = getConfiguredOAuthProviders();

  return (
    <main className="auth-shell">
      <a className="skip-link" href="#sign-in">Skip to sign in</a>
      <nav className="topbar profile-nav" aria-label="Primary navigation">
        <Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link>
        <div className="profile-nav-actions"><Link href="/privacy">Privacy</Link><Link href="/">Play anonymously</Link></div>
      </nav>
      <section className="auth-card" id="sign-in">
        <div className="eyebrow"><span /> Optional player profile</div>
        <h1>Keep your research trail.</h1>
        <p>Choose one provider to save games and send private feedback. Anonymous play remains available without an account.</p>
        {params.error && <p className="auth-error" role="alert">That sign-in could not be completed. Please try another provider.</p>}
        <SignInClient chatGPTPath={chatGPTSignInPath(returnTo)} configured={configured} returnTo={returnTo} />
        <p className="auth-privacy">Paper Picture uses your verified email only to derive the same private player key across supported providers. The gameplay database does not store the raw email or provider access tokens. <Link href="/privacy">Read the privacy notice.</Link></p>
      </section>
    </main>
  );
}
