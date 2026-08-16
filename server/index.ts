import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchImdbCast(imdbId: string) {
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
  });
  if (!response.ok) throw new Error(`IMDb responded with ${response.status}`);
  const payload = await response.json() as { data?: { title?: { credits?: { edges?: Array<{ node?: { name?: { nameText?: { text?: string }; primaryImage?: { url?: string } }; characters?: Array<{ name?: string }> } }> } } } };
  return (payload.data?.title?.credits?.edges || []).map(({ node }) => {
    const name = node?.name?.nameText?.text?.trim();
    if (!name) return null;
    return {
      name,
      character: node?.characters?.map((character) => character.name).filter(Boolean).join(", ") || undefined,
      photo: node?.name?.primaryImage?.url,
    };
  }).filter((entry): entry is { name: string; character: string | undefined; photo: string | undefined } => Boolean(entry));
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.get("/api/cast/:imdbId", async (req, res) => {
    const imdbId = String(req.params.imdbId || "");
    if (!/^tt\\d+$/.test(imdbId)) {
      res.status(400).json({ error: "Invalid IMDb id" });
      return;
    }
    try {
      const cast = await fetchImdbCast(imdbId);
      res.set("Cache-Control", "public, max-age=3600");
      res.json({ cast });
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : "IMDb unavailable" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
