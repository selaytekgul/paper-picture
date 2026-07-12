import { apiError, json, recordAttempt, requireIdentity } from "../../../../profile-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return json(await recordAttempt(await requireIdentity(), id, await request.json()), 201);
  } catch (error) {
    return apiError(error);
  }
}
