import { describe, expect, it } from "vitest";
import { isImdbId } from "@shared/validation";

describe("isImdbId", () => {
  it("accepts valid IMDb identifiers with surrounding whitespace", () => {
    expect(isImdbId(" tt1234567 ")).toBe(true);
  });

  it("rejects empty, malformed, and non-IMDb values", () => {
    expect(isImdbId("")).toBe(false);
    expect(isImdbId("tt")).toBe(false);
    expect(isImdbId("tmdb-123")).toBe(false);
    expect(isImdbId("TT1234567")).toBe(false);
  });
});
