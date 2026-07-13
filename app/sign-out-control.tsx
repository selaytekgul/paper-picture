"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import type { AuthProvider } from "./auth-service";

export default function SignOutControl({
  destination,
  provider,
}: {
  destination: string;
  provider: AuthProvider;
}) {
  const [working, setWorking] = useState(false);

  if (provider === "chatgpt") return <a href={destination}>Sign out</a>;

  return (
    <button
      className="nav-link-button"
      disabled={working}
      onClick={() => {
        setWorking(true);
        void signOut({ redirectTo: destination });
      }}
      type="button"
    >
      {working ? "Signing out…" : "Sign out"}
    </button>
  );
}
