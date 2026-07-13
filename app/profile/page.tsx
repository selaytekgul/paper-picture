import type { Metadata } from "next";
import { requireCurrentUser, signOutDestination } from "../auth-service";
import { isAdminEmail } from "../profile-service";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "My profile — Paper Picture",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await requireCurrentUser("/profile");
  return <ProfileClient suggestedName={user.fullName ?? "Researcher"} authProvider={user.provider} signOutDestination={signOutDestination(user.provider)} isAdmin={isAdminEmail(user.email)} />;
}
