import { apiError, createGameSession, json, requireIdentity } from "../../profile-service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return json(await createGameSession(await requireIdentity()), 201);
  } catch (error) {
    return apiError(error);
  }
}
