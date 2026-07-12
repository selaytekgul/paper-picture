import { collection, collectionFigureCount, collectionPaperCount } from "../../../data/papers";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    collectionId: collection.id,
    version: collection.version,
    papers: collectionPaperCount,
    figures: collectionFigureCount,
  }, { headers: { "Cache-Control": "no-store" } });
}
