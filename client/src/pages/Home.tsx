import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Layers3 } from "lucide-react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import { type MediaItem, getCatalog } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type CatalogRows = { movies: MediaItem[]; series: MediaItem[] };
type Translator = (key: string, vars?: Record<string, string | number>) => string;

type HomeGridSectionProps = {
  title: string;
  label: string;
  href: string;
  items: MediaItem[];
  kind: "movie" | "series" | "mixed";
  t: Translator;
  dir: "rtl" | "ltr";
  loading: boolean;
};

export default function Home() {
  const { dir, t } = useLocale();
  const [rows, setRows] = useState<CatalogRows>({ movies: [], series: [] });
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCatalog("movie"), getCatalog("series")])
      .then(([movies, series]) => {
        if (active) setRows({ movies, series });
      })
      .catch(() => {
        if (active) setCatalogError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const trending = useMemo(() => interleave(rows.movies.slice(0, 14), rows.series.slice(0, 14)).slice(0, 16), [rows]);
  const latestMovies = useMemo(() => rows.movies.slice(0, 24), [rows.movies]);
  const latestSeries = useMemo(() => rows.series.slice(0, 24), [rows.series]);

  return (
    <div className="home-library" dir={dir}>
      <SiteHeader />
      <main className="home-catalog-shell">
        <div className="home-catalog-inner">
          <div className="home-library-heading">
            <div>
              <p className="eyebrow">Movie Witcher / {t("home.catalogEyebrow")}</p>
              <h1>{t("home.libraryTitle")}</h1>
            </div>
            <Link href="/search" className="home-library-search">{t("home.openSearch")} <ArrowRight size={14} /></Link>
          </div>

          <HomeGridSection
            title={t("home.trendingMixed")}
            label={t("home.mixedLabel")}
            href="/discover/movies"
            items={trending}
            kind="mixed"
            t={t}
            dir={dir}
            loading={loading}
          />
          <HomeGridSection
            title={t("home.latestMovies")}
            label={t("hero.movie")}
            href="/discover/movies"
            items={latestMovies}
            kind="movie"
            t={t}
            dir={dir}
            loading={loading}
          />
          <HomeGridSection
            title={t("home.latestSeries")}
            label={t("hero.series")}
            href="/discover/series"
            items={latestSeries}
            kind="series"
            t={t}
            dir={dir}
            loading={loading}
          />
          {catalogError && <p className="home-catalog-error">{t("home.catalogError")}</p>}
        </div>
      </main>
      <footer className="home-footer"><strong>Movie Witcher</strong><p>{t("home.footerNote")}</p><span>◷ {t("home.legal")}</span></footer>
    </div>
  );
}

function interleave(movies: MediaItem[], series: MediaItem[]) {
  const mixed: MediaItem[] = [];
  const length = Math.max(movies.length, series.length);
  for (let index = 0; index < length; index += 1) {
    if (movies[index]) mixed.push(movies[index]);
    if (series[index]) mixed.push(series[index]);
  }
  return mixed;
}

function HomeGridSection({ title, label, href, items, kind, t, dir, loading }: HomeGridSectionProps) {
  return (
    <section className="home-grid-section">
      <div className="home-grid-heading">
        <div className="home-grid-heading__title">
          <span className="home-grid-heading__mark"><Layers3 size={13} /></span>
          <h2>{title}</h2>
          <span className="home-grid-heading__label">{label}</span>
        </div>
        <Link href={href} className="home-see-all">{t("home.all")} {dir === "rtl" ? <ArrowRight className="rotate-180" size={13} /> : <ArrowRight size={13} />}</Link>
      </div>
      {loading ? (
        <div className="home-grid home-grid--skeleton" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div>
      ) : items.length > 0 ? (
        <div className="home-grid">{items.map((item, index) => <MediaCard key={`${item.id}-${index}`} item={item} kind={kind === "mixed" ? (item.type === "series" ? "series" : "movie") : kind} priority={index < 8} />)}</div>
      ) : (
        <div className="home-grid-empty">{t("home.noTitles")}</div>
      )}
    </section>
  );
}
