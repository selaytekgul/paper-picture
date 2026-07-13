import { redirect } from "next/navigation";
import { auth, type OAuthProvider } from "../auth";
import {
  chatGPTSignOutPath,
  getChatGPTUser,
  safeRelativeReturnPath,
} from "./chatgpt-auth";

export type AuthProvider = "chatgpt" | OAuthProvider;

export type AuthenticatedUser = {
  displayName: string;
  email: string;
  fullName: string | null;
  provider: AuthProvider;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  const sessionUser = session?.user as { email?: string | null; name?: string | null; provider?: OAuthProvider } | undefined;
  const email = sessionUser?.email?.trim();
  const provider = sessionUser?.provider;

  if (email && (provider === "google" || provider === "github")) {
    const fullName = sessionUser?.name?.trim() || null;
    return {
      displayName: fullName ?? email,
      email,
      fullName,
      provider,
    };
  }

  const chatGPTUser = await getChatGPTUser();
  return chatGPTUser ? { ...chatGPTUser, provider: "chatgpt" } : null;
}

export async function requireCurrentUser(returnTo: string): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(`/sign-in?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`);
}

export function signOutDestination(provider: AuthProvider, returnTo = "/") {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return provider === "chatgpt"
    ? chatGPTSignOutPath(safeReturnTo)
    : `/auth/finish-signout?return_to=${encodeURIComponent(safeReturnTo)}`;
}
