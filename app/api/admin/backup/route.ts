import { apiError, exportPrivateBackup } from "../../../profile-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backup = await exportPrivateBackup();
    const timestamp = backup.generatedAt.replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
    return Response.json(backup, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="paper-picture-private-backup-${timestamp}.json"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
