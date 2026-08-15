export type MediaKind = "movie" | "series";

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

export async function getCatalog(kind: MediaKind): Promise<MediaItem[]> {
  const data = await request<{ metas?: MediaItem[] }>(`/catalog/${kind}/top.json`);
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

export function mediaPath(item: MediaItem, fallbackKind: MediaKind = "movie"): string {
  const kind = item.type === "series" ? "series" : fallbackKind;
  const id = item.imdb_id || item.id;
  return `/watch/${kind}/${encodeURIComponent(id)}`;
}

export function imageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith("http") ? value : undefined;
}
