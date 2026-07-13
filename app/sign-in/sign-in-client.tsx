"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import type { OAuthProvider } from "../../auth";

export default function SignInClient({
  chatGPTPath,
  configured,
  returnTo,
}: {
  chatGPTPath: string;
  configured: Record<OAuthProvider, boolean>;
  returnTo: string;
}) {
  const [working, setWorking] = useState<OAuthProvider | null>(null);

  function start(provider: OAuthProvider) {
    setWorking(provider);
    void signIn(provider, { redirectTo: returnTo });
  }

  return (
    <div className="auth-options" aria-label="Sign-in options">
      <a className="auth-option chatgpt" href={chatGPTPath}>
        <span>OpenAI</span><b>Continue with ChatGPT</b><i aria-hidden="true">→</i>
      </a>
      <button className="auth-option google" disabled={!configured.google || working !== null} onClick={() => start("google")} type="button">
        <span>Google</span><b>{working === "google" ? "Opening Google…" : "Continue with Google"}</b><i aria-hidden="true">→</i>
      </button>
      <button className="auth-option github" disabled={!configured.github || working !== null} onClick={() => start("github")} type="button">
        <span>GitHub</span><b>{working === "github" ? "Opening GitHub…" : "Continue with GitHub"}</b><i aria-hidden="true">→</i>
      </button>
      {(!configured.google || !configured.github) && <p className="auth-setup-note" role="status">Additional providers are being configured. ChatGPT sign-in remains available.</p>}
    </div>
  );
}
