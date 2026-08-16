import fs from "node:fs";
import path from "node:path";

export type TmdbKind = "movie" | "series";

type TmdbTitle = {
  id: number;
  imdb_id?: string;
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  vote_average?: number;
  genres?: Array<{ id: number; name: string }>;
  poster_path?: string | null;
  backdrop_path?: string | null;
  credits?: {
    cast?: Array<{
      id: number;
      name?: string;
      character?: string;
      profile_path?: string | null;
      order?: number;
    }>;
  };
};

type TmdbFindResponse = {
  movie_results?: TmdbTitle[];
  tv_results?: TmdbTitle[];
};

type TmdbImagesResponse = {
  logos?: Array<{ file_path?: string | null; iso_639_1?: string | null; vote_average?: number }>;
};

function readEnvFile(fileName: string): Record<string, string> {
  try {
    const filePath = path.resolve(process.cwd(), fileName);
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    return Object.fromEntries(lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, "")];
      }));
  } catch {
    return {};
  }
}

export function getTmdbApiKey(): string {
  return process.env.TMDB_API_KEY || readEnvFile(".env.local").TMDB_API_KEY || readEnvFile(".env").TMDB_API_KEY || "";
}

function imageUrl(filePath?: string | null, size = "original"): string | undefined {
  return filePath ? `https://image.tmdb.org/t/p/${size}${filePath}` : undefined;
}

async function tmdbRequest<T>(endpoint: string, apiKey: string): Promise<T> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const response = await fetch(`https://api.themoviedb.org/3${endpoint}${separator}api_key=${encodeURIComponent(apiKey)}&language=en-US`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`TMDB responded with ${response.status}`);
  return response.json() as Promise<T>;
}

export async function resolveTmdbTitle(kind: TmdbKind, imdbId: string) {
  const apiKey = getTmdbApiKey();
  if (!apiKey || !/^tt\d+$/.test(imdbId)) return null;
  const source = kind === "series" ? "tv_results" : "movie_results";
  const findResult = await tmdbRequest<TmdbFindResponse>(`/find/${encodeURIComponent(imdbId)}?external_source=imdb_id`, apiKey);
  const found = findResult[source]?.[0];
  if (!found) return null;

  const details = await tmdbRequest<TmdbTitle>(`/${kind === "series" ? "tv" : "movie"}/${found.id}?append_to_response=credits`, apiKey);
  const images = await tmdbRequest<TmdbImagesResponse>(`/${kind === "series" ? "tv" : "movie"}/${found.id}/images?include_image_language=en,null`, apiKey).catch(() => ({ logos: [] }));
  const preferredLogo = (images.logos || [])
    .filter((logo) => logo.file_path)
    .sort((a, b) => (Number(b.iso_639_1 === "en") - Number(a.iso_639_1 === "en")) || ((b.vote_average || 0) - (a.vote_average || 0)))[0];
  const releaseDate = details.release_date || details.first_air_date || "";
  const cast = (details.credits?.cast || []).slice(0, 50).map((member) => ({
    name: member.name || "",
    character: member.character || undefined,
    photo: imageUrl(member.profile_path, "w342"),
  })).filter((member) => member.name);

  return {
    id: imdbId,
    imdb_id: imdbId,
    tmdb_id: String(details.id),
    tmdbId: String(details.id),
    name: details.title || details.name || found.title || found.name || imdbId,
    poster: imageUrl(details.poster_path, "w500"),
    background: imageUrl(details.backdrop_path, "w1280"),
    logo: imageUrl(preferredLogo?.file_path, "w500"),
    description: details.overview || undefined,
    releaseInfo: releaseDate ? (kind === "series" ? `${releaseDate.slice(0, 4)}–` : releaseDate.slice(0, 4)) : undefined,
    year: releaseDate ? Number(releaseDate.slice(0, 4)) : undefined,
    runtime: details.runtime || details.episode_run_time?.[0] ? `${details.runtime || details.episode_run_time?.[0]} min` : undefined,
    genres: details.genres?.map((genre) => genre.name) || [],
    imdbRating: typeof details.vote_average === "number" ? details.vote_average.toFixed(1) : undefined,
    cast,
  };
}
