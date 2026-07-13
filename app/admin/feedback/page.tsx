import { notFound } from "next/navigation";
import { requireCurrentUser, signOutDestination } from "../../auth-service";
import { isAdminEmail } from "../../profile-service";
import FeedbackAdminClient from "./feedback-admin-client";

export const dynamic = "force-dynamic";

export default async function FeedbackAdminPage() {
  const user = await requireCurrentUser("/admin/feedback");
  if (!isAdminEmail(user.email)) notFound();
  return <FeedbackAdminClient authProvider={user.provider} signOutDestination={signOutDestination(user.provider)} />;
}
