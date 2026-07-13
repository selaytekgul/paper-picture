import type { Metadata } from "next";
import { requireCurrentUser, signOutDestination } from "../auth-service";
import FeedbackClient from "./feedback-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Feedback — Paper Picture",
  robots: { index: false, follow: false },
};

export default async function FeedbackPage() {
  const user = await requireCurrentUser("/feedback");
  return <FeedbackClient authProvider={user.provider} signOutDestination={signOutDestination(user.provider)} />;
}
