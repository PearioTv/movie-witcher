import { resolveTmdbTitle } from "../../../server/tmdb";
import { isImdbId } from "../../../shared/validation";

type Request = { method?: string; query?: Record<string, string | string[] | undefined> };
type Response = { status: (code: number) => Response; setHeader: (name: string, value: string) => Response; json: (body: unknown) => void };

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET").json({ error: "Method not allowed" });
    return;
  }
  const kindValue = queryValue(req.query?.kind);
  const imdbId = queryValue(req.query?.imdbId).trim();
  const kind = kindValue === "series" ? "series" : kindValue === "movie" ? "movie" : null;
  if (!kind || !isImdbId(imdbId)) {
    res.status(400).json({ error: "Invalid TMDB title request" });
    return;
  }
  try {
    const title = await resolveTmdbTitle(kind, imdbId);
    if (!title) {
      res.status(404).json({ error: "TMDB title not found or API key is not configured" });
      return;
    }
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=300");
    res.status(200).json({ title });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "TMDB unavailable" });
  }
}
