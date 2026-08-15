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
const translationCache = new Map<string, string>();
const castPhotoCache = new Map<string, string | undefined>();

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

export async function translateText(text: string, target: "ar" | "en"): Promise<string> {
  const source = text.trim();
  if (!source || target !== "ar") return text;
  const cacheKey = `${target}:${source}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;
  const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en%7C${target}`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("Translation unavailable");
  const payload = await response.json() as { responseStatus?: number; responseData?: { translatedText?: string } };
  const translated = payload.responseStatus === 200 ? payload.responseData?.translatedText || source : source;
  translationCache.set(cacheKey, translated || source);
  return translated || source;
}

async function wikipediaPhoto(name: string): Promise<string | undefined> {
  const cached = castPhotoCache.get(name);
  if (cached !== undefined || castPhotoCache.has(name)) return cached;
  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=320&titles=${encodeURIComponent(name)}`;
    const response = await fetch(endpoint);
    if (!response.ok) return undefined;
    const payload = await response.json() as { query?: { pages?: Record<string, { thumbnail?: { source?: string } }> } };
    const page = Object.values(payload.query?.pages || {})[0];
    const photo = page?.thumbnail?.source;
    castPhotoCache.set(name, photo);
    return photo;
  } catch {
    castPhotoCache.set(name, undefined);
    return undefined;
  }
}

export async function enrichCastWithPhotos(cast: Array<CastMember | string>): Promise<CastMember[]> {
  return Promise.all(cast.slice(0, 12).map(async (entry) => {
    const member = typeof entry === "string" ? { name: entry } : entry;
    if (member.photo) return member;
    const photo = await wikipediaPhoto(member.name);
    return photo ? { ...member, photo } : member;
  }));
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
