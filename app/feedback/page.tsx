import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import FeedbackClient from "./feedback-client";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  await requireChatGPTUser("/feedback");
  return <FeedbackClient signOutPath={chatGPTSignOutPath("/")} />;
}
