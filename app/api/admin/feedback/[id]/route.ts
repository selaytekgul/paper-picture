import { apiError, json, updateFeedbackStatus } from "../../../../profile-service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return json(await updateFeedbackStatus(id, body?.status));
  } catch (error) {
    return apiError(error);
  }
}
