import { apiError, json, requireIdentity, submitFeedback } from "../../profile-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    return json(await submitFeedback(await requireIdentity(), await request.json()), 201);
  } catch (error) {
    return apiError(error);
  }
}
