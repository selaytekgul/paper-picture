import { apiError, completeGameSession, json, requireIdentity } from "../../../../profile-service";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return json(await completeGameSession(await requireIdentity(), id));
  } catch (error) {
    return apiError(error);
  }
}
