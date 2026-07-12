import { apiError, deleteProfile, getProfile, json, requireIdentity, updateProfile } from "../../profile-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json(await getProfile(await requireIdentity()));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    return json(await updateProfile(await requireIdentity(), body?.displayName));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE() {
  try {
    await deleteProfile(await requireIdentity());
    return json({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
