import { apiError, createGameSession, json, requireIdentity } from "../../profile-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    return json(await createGameSession(await requireIdentity(), body), 201);
  } catch (error) {
    return apiError(error);
  }
}
