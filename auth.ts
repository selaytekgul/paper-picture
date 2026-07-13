import { env } from "cloudflare:workers";
import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export type OAuthProvider = "google" | "github";

type AuthEnvironment = {
  AUTH_SECRET?: string;
  AUTH_GOOGLE_ID?: string;
  AUTH_GOOGLE_SECRET?: string;
  AUTH_GITHUB_ID?: string;
  AUTH_GITHUB_SECRET?: string;
};

function getAuthEnvironment(): AuthEnvironment {
  const runtime = env as unknown as AuthEnvironment;
  return {
    AUTH_SECRET: runtime.AUTH_SECRET ?? process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: runtime.AUTH_GOOGLE_ID ?? process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: runtime.AUTH_GOOGLE_SECRET ?? process.env.AUTH_GOOGLE_SECRET,
    AUTH_GITHUB_ID: runtime.AUTH_GITHUB_ID ?? process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: runtime.AUTH_GITHUB_SECRET ?? process.env.AUTH_GITHUB_SECRET,
  };
}

export function getConfiguredOAuthProviders() {
  const runtime = getAuthEnvironment();
  return {
    google: Boolean(runtime.AUTH_GOOGLE_ID && runtime.AUTH_GOOGLE_SECRET),
    github: Boolean(runtime.AUTH_GITHUB_ID && runtime.AUTH_GITHUB_SECRET),
  } satisfies Record<OAuthProvider, boolean>;
}

function buildAuthConfig(): NextAuthConfig {
  const runtime = getAuthEnvironment();
  const providers: NextAuthConfig["providers"] = [];

  if (runtime.AUTH_GOOGLE_ID && runtime.AUTH_GOOGLE_SECRET) {
    providers.push(Google({
      clientId: runtime.AUTH_GOOGLE_ID,
      clientSecret: runtime.AUTH_GOOGLE_SECRET,
    }));
  }

  if (runtime.AUTH_GITHUB_ID && runtime.AUTH_GITHUB_SECRET) {
    providers.push(GitHub({
      clientId: runtime.AUTH_GITHUB_ID,
      clientSecret: runtime.AUTH_GITHUB_SECRET,
    }));
  }

  return {
    secret: runtime.AUTH_SECRET,
    trustHost: true,
    providers,
    pages: {
      signIn: "/sign-in",
      error: "/sign-in",
    },
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
      async signIn({ account, profile, user }) {
        const email = user.email?.trim().toLowerCase();
        if (!email || !account) return false;

        if (account.provider === "google") {
          return (profile as { email_verified?: boolean } | undefined)?.email_verified === true;
        }

        if (account.provider === "github") {
          if (!account.access_token) return false;
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${account.access_token}`,
              "User-Agent": "paper-picture-auth",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          });
          if (!response.ok) return false;
          const emails = await response.json() as Array<{ email?: string; verified?: boolean }>;
          return emails.some((item) => item.verified === true && item.email?.trim().toLowerCase() === email);
        }

        return false;
      },
      async jwt({ account, token }) {
        if (account?.provider === "google" || account?.provider === "github") {
          token.authProvider = account.provider;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as typeof session.user & { provider?: OAuthProvider }).provider =
            token.authProvider === "google" || token.authProvider === "github"
              ? token.authProvider
              : undefined;
        }
        return session;
      },
    },
  };
}

export const { handlers, auth } = NextAuth(() => buildAuthConfig());
