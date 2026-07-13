import { collectionCatalog, collectionStats } from "../../../data/papers";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    collections: collectionCatalog.map((collection) => ({
      id: collection.id,
      version: collection.version,
      ...collectionStats(collection.id),
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
