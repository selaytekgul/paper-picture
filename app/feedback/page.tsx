import type { Metadata } from "next";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import FeedbackClient from "./feedback-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Feedback — Paper Picture",
  robots: { index: false, follow: false },
};

export default async function FeedbackPage() {
  await requireChatGPTUser("/feedback");
  return <FeedbackClient signOutPath={chatGPTSignOutPath("/")} />;
}
