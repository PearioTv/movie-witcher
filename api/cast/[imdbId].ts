import { isImdbId } from "../../shared/validation";

type Request = { method?: string; query?: Record<string, string | string[] | undefined> };
type Response = { status: (code: number) => Response; setHeader: (name: string, value: string) => Response; json: (body: unknown) => void };
type CastMember = { name: string; character?: string; photo?: string };
type Payload = {
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

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

async function fetchCast(imdbId: string): Promise<CastMember[]> {
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
  const payload = await response.json() as Payload;
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

export default async function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET").json({ error: "Method not allowed" });
    return;
  }
  const imdbId = queryValue(req.query?.imdbId).trim();
  if (!isImdbId(imdbId)) {
    res.status(400).json({ error: "Invalid IMDb id" });
    return;
  }
  try {
    const cast = await fetchCast(imdbId);
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=300");
    res.status(200).json({ cast });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "IMDb unavailable" });
  }
}
