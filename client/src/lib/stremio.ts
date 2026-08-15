export type MediaKind = "movie" | "series";

export type CastMember = {
  name: string;
  character?: string;
  photo?: string;
};

export type MediaLink = {
  name?: string;
  category?: string;
  url?: string;
};

export type MediaItem = {
  id: string;
  imdb_id?: string;
  name: string;
  type?: MediaKind;
  poster?: string;
  background?: string;
  description?: string;
  releaseInfo?: string;
  year?: number | string;
  runtime?: string;
  genres?: string[];
  imdbRating?: string;
  cast?: Array<CastMember | string>;
  links?: MediaLink[];
  videos?: Episode[];
};

export type Episode = {
  id: string;
  season: number;
  episode: number;
  title?: string;
  description?: string;
  thumbnail?: string;
  released?: string;
};

const CINEMETA_URL = "https://v3-cinemeta.strem.io";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${CINEMETA_URL}${path}`);
  if (!response.ok) throw new Error("تعذر الوصول إلى كتالوج المحتوى الآن.");
  return response.json() as Promise<T>;
}

export async function getCatalog(kind: MediaKind, options: { skip?: number; genre?: string } = {}): Promise<MediaItem[]> {
  const extras = [
    options.genre ? `genre=${encodeURIComponent(options.genre)}` : "",
    options.skip ? `skip=${options.skip}` : "",
  ].filter(Boolean);
  const data = await request<{ metas?: MediaItem[] }>(`/catalog/${kind}/top${extras.length ? `/${extras.join("/")}` : ""}.json`);
  return data.metas ?? [];
}

export async function searchCatalog(kind: MediaKind, query: string): Promise<MediaItem[]> {
  const encoded = encodeURIComponent(query.trim());
  if (!encoded) return [];
  const data = await request<{ metas?: MediaItem[] }>(`/catalog/${kind}/top/search=${encoded}.json`);
  return data.metas ?? [];
}

export async function getMeta(kind: MediaKind, id: string): Promise<MediaItem> {
  const [metaId] = decodeURIComponent(id).split(":");
  const data = await request<{ meta: MediaItem }>(`/meta/${kind}/${metaId}.json`);
  return data.meta;
}

export function detailPath(item: MediaItem, fallbackKind: MediaKind = "movie"): string {
  const kind = item.type === "series" ? "series" : fallbackKind;
  const id = item.imdb_id || item.id;
  return `/title/${kind}/${encodeURIComponent(id)}`;
}

export function mediaPath(item: MediaItem, fallbackKind: MediaKind = "movie"): string {
  const kind = item.type === "series" ? "series" : fallbackKind;
  const id = item.imdb_id || item.id;
  return `/watch/${kind}/${encodeURIComponent(id)}`;
}

export function imageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith("http") ? value : undefined;
}

export function backdropUrl(item: MediaItem, size: "medium" | "large" = "medium"): string | undefined {
  const direct = imageUrl(item.background);
  if (direct) return direct;
  const id = item.imdb_id || item.id;
  if (id) return `https://images.metahub.space/background/${size}/${id}/img`;
  return imageUrl(item.poster);
}
