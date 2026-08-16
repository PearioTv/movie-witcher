import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { resolveTmdbTitle } from "./tmdb";
import { isImdbId } from "../shared/validation";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_HEADER = "public, max-age=3600, stale-while-revalidate=300";

type CastMember = { name: string; character?: string; photo?: string };

type ImdbCastPayload = {
  data?: {
    title?: {
      credits?: {
        edges?: Array<{
          node?: {
            name?: { nameText?: { text?: string }; primaryImage?: { url?: string } };
            characters?: Array<{ name?: string }>;
          };
        }>;
      };
    };
  };
};

async function fetchImdbCast(imdbId: string): Promise<CastMember[]> {
  const query = `query { title(id: "${imdbId}") { credits(first: 50, filter: { categories: ["actor", "actress"] }) { edges { node { name { nameText { text } primaryImage { url } } ... on Cast { characters { name } } } } } } }`;
  const response = await fetch("https://api.graphql.imdb.com/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "origin": "https://www.imdb.com",
      "referer": "https://www.imdb.com/",
      "user-agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`IMDb responded with ${response.status}`);
  const payload = await response.json() as ImdbCastPayload;
  return (payload.data?.title?.credits?.edges || []).flatMap(({ node }) => {
    const name = node?.name?.nameText?.text?.trim();
    if (!name) return [];
    return [{
      name,
      character: node?.characters?.map((character) => character.name).filter(Boolean).join(", ") || undefined,
      photo: node?.name?.primaryImage?.url,
    }];
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.disable("x-powered-by");

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "movie-witcher" });
  });

  app.get("/api/tmdb/:kind/:imdbId", async (req, res) => {
    const kind = req.params.kind === "series" ? "series" : req.params.kind === "movie" ? "movie" : null;
    const imdbId = String(req.params.imdbId || "").trim();
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
      res.set("Cache-Control", CACHE_HEADER);
      res.json({ title });
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : "TMDB unavailable" });
    }
  });

  app.get("/api/cast/:imdbId", async (req, res) => {
    const imdbId = String(req.params.imdbId || "").trim();
    if (!isImdbId(imdbId)) {
      res.status(400).json({ error: "Invalid IMDb id" });
      return;
    }
    try {
      const cast = await fetchImdbCast(imdbId);
      res.set("Cache-Control", CACHE_HEADER);
      res.json({ cast });
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : "IMDb unavailable" });
    }
  });

  const staticPath = process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath, { maxAge: process.env.NODE_ENV === "production" ? "1d" : 0 }));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Movie Witcher server", error);
  process.exitCode = 1;
});
