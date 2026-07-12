import { apiError, json, listFeedback } from "../../../profile-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json(await listFeedback());
  } catch (error) {
    return apiError(error);
  }
}
