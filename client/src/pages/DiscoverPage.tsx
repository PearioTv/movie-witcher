import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { Link, useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { type MediaItem, type MediaKind, getCatalog } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type SortMode = "popular" | "rating" | "recent";

export default function DiscoverPage() {
  const { mode } = useParams<{ mode?: string }>();
  const { dir, t } = useLocale();
  const queryKind = new URLSearchParams(window.location.search).get("type");
  const kind: MediaKind = mode === "series" || queryKind === "series" ? "series" : "movie";
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortMode>("popular");
  const [genre, setGenre] = useState("all");
  const [year, setYear] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setItems([]);
    setGenre("all");
    getCatalog(kind).then((data) => {
      if (active) setItems(data);
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : t("discover.failed"));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [kind]);

  const genres = useMemo(() => {
    const values = new Set(items.flatMap((item) => item.genres || []));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const years = useMemo(() => {
    const values = new Set(items.map((item) => String(item.year || item.releaseInfo || "").slice(0, 4)).filter((value) => /^\d{4}$/.test(value)));
    return Array.from(values).sort((a, b) => Number(b) - Number(a));
  }, [items]);

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesGenre = genre === "all" || item.genres?.includes(genre);
      const itemYear = String(item.year || item.releaseInfo || "").slice(0, 4);
      const matchesYear = year === "all" || itemYear === year;
      return matchesGenre && matchesYear;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "rating") return Number(b.imdbRating || 0) - Number(a.imdbRating || 0);
      if (sort === "recent") return Number(String(b.year || b.releaseInfo || 0).slice(0, 4)) - Number(String(a.year || a.releaseInfo || 0).slice(0, 4));
      return 0;
    });
  }, [items, genre, sort, year]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await getCatalog(kind, { skip: items.length });
      setItems((current) => {
        const existing = new Set(current.map((item) => item.id));
        return [...current, ...next.filter((item) => !existing.has(item.id))];
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("discover.failed"));
    } finally {
      setLoadingMore(false);
    }
  }

  const title = kind === "series" ? t("discover.seriesTitle") : t("discover.moviesTitle");
  const label = kind === "series" ? t("nav.series") : t("nav.movies");

  return (
    <div className="min-h-screen bg-[#10100f] text-[#f4f0e9]" dir={dir}>
      <SiteHeader />
      <main className="discover-page">
        <div className="discover-page__backdrop" aria-hidden="true" />
        <section className="relative z-10 mx-auto max-w-[1480px] px-5 pb-9 pt-16 sm:px-8 lg:px-10 lg:pt-24">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow">{t("discover.eyebrow")}</p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.075em] text-[#f6f0e8] sm:text-6xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aaa7a0] sm:text-base">{t("discover.desc")}</p>
            </div>
            <Link href="/search" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#b7b3ad] transition hover:text-[#e33b2f]"><Search size={15} /> {t("discover.searchLink")}</Link>
          </div>
          <div className="discover-filters mt-9">
            <FilterSelect label={t("discover.sort")} value={sort} onChange={(value) => setSort(value as SortMode)} options={[{ value: "popular", label: t("discover.popular") }, { value: "rating", label: t("discover.highestRated") }, { value: "recent", label: t("discover.recent") }]} />
            <FilterSelect label={t("discover.genre")} value={genre} onChange={setGenre} options={[{ value: "all", label: t("discover.allGenres") }, ...genres.map((value) => ({ value, label: value }))]} />
            <FilterSelect label={t("discover.country")} value="all" onChange={() => undefined} options={[{ value: "all", label: t("discover.allCountries") }]} />
            <FilterSelect label={t("discover.year")} value={year} onChange={setYear} options={[{ value: "all", label: t("discover.allYears") }, ...years.map((value) => ({ value, label: value }))]} />
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-[1480px] px-5 pb-24 sm:px-8 lg:px-10">
          <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-4"><div><p className="eyebrow">{t("discover.catalogEyebrow")}</p><h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.06em]">{visibleItems.length} {label}</h2></div><span className="text-xs text-[#77746f]">{t("discover.liveCatalog")}</span></div>
          {loading && <div className="flex min-h-64 items-center justify-center text-sm text-[#b8b4ac]"><span className="loading-orbit ml-3" /> {t("discover.loading")}</div>}
          {!loading && error && <div className="search-empty"><div><p className="search-empty__index">{t("discover.errorEyebrow")}</p><h2>{t("discover.failedTitle")}</h2><p>{error}</p></div></div>}
          {!loading && !error && !visibleItems.length && <div className="search-empty"><div><p className="search-empty__index">{t("discover.emptyEyebrow")}</p><h2>{t("discover.emptyTitle")}</h2><p>{t("discover.emptyDesc")}</p></div></div>}
          {!loading && visibleItems.length > 0 && <div className="media-grid">{visibleItems.map((item, index) => <MediaCard key={`${item.id}-${index}`} item={item} kind={kind} priority={index < 6} />)}</div>}
          {!loading && !error && items.length > 0 && <div className="mt-12 flex justify-center"><Button type="button" variant="ghost" onClick={loadMore} disabled={loadingMore} className="load-more-button">{loadingMore ? <Loader2 size={15} className="animate-spin" /> : null}{loadingMore ? t("discover.loadingMore") : t("discover.loadMore")} <ChevronDown size={15} /></Button></div>}
        </section>
      </main>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <label className="discover-filter"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={13} /></label>;
}
