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
  tmdb_id?: string;
  tmdbId?: string;
  name: string;
  type?: MediaKind;
  poster?: string;
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  year?: number | string;
  runtime?: string;
  genres?: string[];
  genre?: string[];
  country?: string;
  originalLanguage?: string;
  originCountry?: string[];
  inProduction?: boolean;
  status?: string;
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

export type WatchHistoryEntry = {
  id: string;
  kind: MediaKind;
  name: string;
  poster?: string;
  background?: string;
  releaseInfo?: string;
  year?: number | string;
  imdbRating?: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  updatedAt: number;
};

const WATCH_HISTORY_KEY = "mw-watch-history";

const CINEMETA_URL = "https://v3-cinemeta.strem.io";
const translationCache = new Map<string, string>();
const castPhotoCache = new Map<string, string | undefined>();

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${CINEMETA_URL}${path}`);
  if (!response.ok) throw new Error("تعذر الوصول إلى كتالوج المحتوى الآن.");
  return response.json() as Promise<T>;
}

function normalizeCatalogItem(item: MediaItem): MediaItem {
  const normalizedId = String(item.imdb_id || item.id || "");
  const genres = item.genres?.length ? item.genres : item.genre;
  return {
    ...item,
    id: normalizedId,
    imdb_id: item.imdb_id || (normalizedId.startsWith("tt") ? normalizedId : undefined),
    genres,
  };
}

export function isUsableMediaItem(item?: Partial<MediaItem>): item is MediaItem {
  return Boolean(item?.name?.trim() && (item.imdb_id || item.id) && imageUrl(item.poster));
}

export async function getCatalog(kind: MediaKind, options: { skip?: number; genre?: string } = {}): Promise<MediaItem[]> {
  const extras = [
    options.genre ? `genre=${encodeURIComponent(options.genre)}` : "",
    options.skip ? `skip=${options.skip}` : "",
  ].filter(Boolean);
  const data = await request<{ metas?: MediaItem[] }>(`/catalog/${kind}/top${extras.length ? `/${extras.join("/")}` : ""}.json`);
  return (data.metas ?? []).map(normalizeCatalogItem).filter(isUsableMediaItem);
}

export async function searchCatalog(kind: MediaKind, query: string): Promise<MediaItem[]> {
  const encoded = encodeURIComponent(query.trim());
  if (!encoded) return [];
  const data = await request<{ metas?: MediaItem[] }>(`/catalog/${kind}/top/search=${encoded}.json`);
  return (data.metas ?? []).map(normalizeCatalogItem).filter(isUsableMediaItem);
}

export async function getKDramaCatalog(): Promise<MediaItem[]> {
  const queries = ["Korean drama", "K-drama", "Korean series", "Korean", "Squid Game", "The Glory", "Moving"];
  const batches = await Promise.all(queries.map((query) => searchCatalog("series", query).catch(() => [])));
  const seen = new Set<string>();
  const candidates: MediaItem[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      const key = item.imdb_id || item.id;
      if (!seen.has(key) && item.type === "series" && isUsableMediaItem(item)) {
        seen.add(key);
        candidates.push(item);
      }
    }
  }

  const enriched = await Promise.all(candidates.slice(0, 28).map(async (item) => {
    try {
      return { ...item, ...await getMeta("series", item.imdb_id || item.id) };
    } catch {
      return item;
    }
  }));
  return enriched.filter((item) => {
    const country = `${item.country || ""} ${(item.originCountry || []).join(" ")}`;
    return isUsableMediaItem(item) && (item.originalLanguage === "ko" || /south korea|korea|\bkr\b/i.test(country));
  }).slice(0, 14);
}

export async function getAnimeCatalog(): Promise<MediaItem[]> {
  const animationCatalog = await getCatalog("series", { genre: "Animation" }).catch(() => []);
  return animationCatalog
    .filter((item) => isUsableMediaItem(item) && item.type === "series" && item.genres?.some((genre) => genre.toLowerCase() === "animation") && /japan/i.test(item.country || ""))
    .slice(0, 14);
}

async function getTmdbMeta(kind: MediaKind, imdbId: string): Promise<Partial<MediaItem> | null> {
  try {
    const response = await fetch(`/api/tmdb/${kind}/${encodeURIComponent(imdbId)}`);
    if (!response.ok) return null;
    const payload = await response.json() as { title?: Partial<MediaItem> };
    return payload.title || null;
  } catch {
    return null;
  }
}

export async function getMeta(kind: MediaKind, id: string): Promise<MediaItem> {
  const [metaId] = decodeURIComponent(id).split(":");
  const [data, tmdb] = await Promise.all([
    request<{ meta?: MediaItem }>(`/meta/${kind}/${metaId}.json`).catch(() => ({ meta: undefined })),
    getTmdbMeta(kind, metaId),
  ]);
  const cinemeta = data?.meta;
  if (!cinemeta && !tmdb) throw new Error("لم يتم العثور على بيانات هذا العنوان.");
  if (!tmdb) return cinemeta as MediaItem;
  return {
    ...cinemeta,
    ...tmdb,
    id: cinemeta?.id || tmdb.id || metaId,
    name: cinemeta?.name || tmdb.name || metaId,
    imdb_id: cinemeta?.imdb_id || tmdb.imdb_id || (metaId.startsWith("tt") ? metaId : undefined),
    type: cinemeta?.type || kind,
    videos: cinemeta?.videos,
    cast: tmdb.cast?.length ? tmdb.cast : cinemeta?.cast,
    genres: tmdb.genres?.length ? tmdb.genres : cinemeta?.genres,
  };
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

export async function getFullCast(imdbId: string): Promise<CastMember[]> {
  const normalizedId = imdbId.trim();
  if (!/^tt\d+$/.test(normalizedId)) return [];
  try {
    const response = await fetch(`/api/cast/${encodeURIComponent(normalizedId)}`);
    if (!response.ok) return [];
    const payload = await response.json() as { cast?: CastMember[] };
    return Array.isArray(payload.cast) ? payload.cast : [];
  } catch {
    return [];
  }
}

export async function enrichCastWithPhotos(cast: Array<CastMember | string>): Promise<CastMember[]> {
  return Promise.all(cast.slice(0, 24).map(async (entry) => {
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

export function playerId(item: MediaItem): string {
  return item.tmdb_id || item.tmdbId || item.id;
}

export function imageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith("http") ? value : undefined;
}

export function logoCandidates(item: MediaItem): string[] {
  const id = item.imdb_id || item.id;
  const candidates = [
    imageUrl(item.logo),
    id ? `https://images.metahub.space/logo/large/${id}/img` : undefined,
    id ? `https://images.metahub.space/logo/medium/${id}/img` : undefined,
    id ? `https://images.metahub.space/logo/small/${id}/img` : undefined,
  ].filter((value): value is string => Boolean(value));
  return Array.from(new Set(candidates));
}

export function logoUrl(item: MediaItem, size: "small" | "medium" | "large" = "medium"): string | undefined {
  return logoCandidates(item).find((value) => value.includes(`/logo/${size}/`)) || logoCandidates(item)[0];
}

export function readWatchHistory(): WatchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_KEY);
    const entries = raw ? JSON.parse(raw) as WatchHistoryEntry[] : [];
    return Array.isArray(entries) ? entries.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

function writeWatchHistory(entries: WatchHistoryEntry[]) {
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(entries.slice(0, 100)));
  window.dispatchEvent(new CustomEvent("mw-watch-history-change"));
}

export function recordWatchHistory(item: MediaItem, kind: MediaKind, episode?: Episode) {
  const id = item.imdb_id || item.id;
  const current = readWatchHistory();
  const entry: WatchHistoryEntry = {
    id,
    kind,
    name: item.name,
    poster: item.poster,
    background: item.background,
    releaseInfo: item.releaseInfo,
    year: item.year,
    imdbRating: item.imdbRating,
    season: episode?.season,
    episode: episode?.episode,
    episodeTitle: episode?.title,
    updatedAt: Date.now(),
  };
  writeWatchHistory([entry, ...current.filter((value) => !(value.id === id && value.kind === kind))]);
}

export function removeWatchHistory(id: string, kind?: MediaKind) {
  writeWatchHistory(readWatchHistory().filter((entry) => entry.id !== id || (kind && entry.kind !== kind)));
}

export function clearWatchHistory() {
  writeWatchHistory([]);
}

export function backdropUrl(item: MediaItem, size: "medium" | "large" = "medium"): string | undefined {
  const direct = imageUrl(item.background);
  if (direct) return direct;
  const id = item.imdb_id || item.id;
  if (id) return `https://images.metahub.space/background/${size}/${id}/img`;
  return imageUrl(item.poster);
}
