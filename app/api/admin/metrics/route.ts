import { apiError, getOperationalMetrics, json } from "../../../profile-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json(await getOperationalMetrics());
  } catch (error) {
    return apiError(error);
  }
}
