import type { Metadata } from "next";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { isAdminEmail } from "../profile-service";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "My profile — Paper Picture",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await requireChatGPTUser("/profile");
  return <ProfileClient suggestedName={user.fullName ?? "Researcher"} signOutPath={chatGPTSignOutPath("/")} isAdmin={isAdminEmail(user.email)} />;
}
