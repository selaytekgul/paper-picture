import { notFound } from "next/navigation";
import { chatGPTSignOutPath, requireChatGPTUser } from "../../chatgpt-auth";
import { isAdminEmail } from "../../profile-service";
import FeedbackAdminClient from "./feedback-admin-client";

export const dynamic = "force-dynamic";

export default async function FeedbackAdminPage() {
  const user = await requireChatGPTUser("/admin/feedback");
  if (!isAdminEmail(user.email)) notFound();
  return <FeedbackAdminClient signOutPath={chatGPTSignOutPath("/")} />;
}
