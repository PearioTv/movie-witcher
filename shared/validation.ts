const IMDB_ID_PATTERN = /^tt\d+$/;

export function isImdbId(value: string): boolean {
  return IMDB_ID_PATTERN.test(value.trim());
}
