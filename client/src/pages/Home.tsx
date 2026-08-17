import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Play, Search, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import { backdropUrl, detailPath, imageUrl, type MediaItem, type WatchHistoryEntry, getCatalog, readWatchHistory } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type CatalogRows = { movies: MediaItem[]; series: MediaItem[] };
type Translator = (key: string, vars?: Record<string, string | number>) => string;

export default function Home() {
  const { dir, t } = useLocale();
  const [rows, setRows] = useState<CatalogRows>({ movies: [], series: [] });
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    let active = true;
    const syncHistory = () => setHistory(readWatchHistory().slice(0, 4));
    syncHistory();
    window.addEventListener("mw-watch-history-change", syncHistory);
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
      window.removeEventListener("mw-watch-history-change", syncHistory);
    };
  }, []);

  const trending = useMemo(() => interleave(rows.movies.slice(0, 14), rows.series.slice(0, 14)).slice(0, 16), [rows]);
  const latestMovies = useMemo(() => rows.movies.slice(0, 12), [rows.movies]);
  const latestSeries = useMemo(() => rows.series.slice(0, 12), [rows.series]);
  const featured = trending[0] || rows.movies[0] || rows.series[0];
  const featuredKind = featured?.type === "series" ? "series" : "movie";

  return (
    <div className="home-library" dir={dir}>
      <SiteHeader />
      <main className="home-catalog-shell">
        <div className="home-catalog-inner">
          <section className="home-hero" aria-label={t("hero.eyebrowGuide")}>
            <div className="home-hero__copy">
              <p className="home-hero__eyebrow"><Sparkles size={13} /> {t("home.catalogEyebrow")}</p>
              <h1>{featured?.name || t("home.libraryTitle")}</h1>
              <div className="home-hero__meta"><span>{featured?.year || "2026"}</span><i /> <span>{featuredKind === "series" ? t("hero.series") : t("hero.movie")}</span><i /> <span>{featured?.runtime || "2h 08m"}</span></div>
              <p className="home-hero__desc">{featured?.description || t("home.catalogTagline")}</p>
              <div className="home-hero__actions">
                {featured ? <Link href={watchHref(featured, featuredKind)} className="home-action home-action--primary"><Play size={15} fill="currentColor" /> {t("hero.play")}</Link> : <Link href="/search" className="home-action home-action--primary"><Search size={15} /> {t("home.openSearch")}</Link>}
                {featured && <Link href={detailPath(featured, featuredKind)} className="home-action home-action--secondary">{t("hero.seeMore")} <ArrowRight size={14} /></Link>}
              </div>
              <div className="home-hero__dots" aria-hidden="true"><b /><span /><span /><span /><span /></div>
            </div>
            <div className="home-hero__art">
              {featured && (backdropUrl(featured, "large") || imageUrl(featured.poster)) ? <img src={backdropUrl(featured, "large") || imageUrl(featured.poster)} alt="" /> : <div className="home-hero__art-fallback">MW</div>}
              <div className="home-hero__art-shade" />
              <div className="home-hero__rating"><Star size={14} fill="currentColor" /> <strong>{featured?.imdbRating || "—"}</strong><small>IMDb</small></div>
            </div>
          </section>

          {history.length > 0 && <ContinueSection entries={history} t={t} />}

          <HomeGridSection title={t("home.trendingMixed")} label={t("home.mixedLabel")} href="/discover/movies" items={trending.slice(0, 6)} kind="mixed" t={t} dir={dir} loading={loading} />

          {!loading && trending.length > 6 && <section className="home-editorial">
            <div className="home-editorial__feature">
              <div className="home-editorial__image">{trending[6] && <img src={imageUrl(trending[6].background || trending[6].poster)} alt="" loading="lazy" />}</div>
              <div className="home-editorial__body"><p>{t("home.exploreEyebrow")}</p><h2>{trending[6]?.name || t("home.exploreTitle1")}</h2><span>{trending[6]?.description || t("home.exploreDesc")}</span><Link href={trending[6] ? detailPath(trending[6], trending[6].type === "series" ? "series" : "movie") : "/discover/movies"} className="home-action home-action--primary">{t("home.exploreCta")} <ArrowRight size={14} /></Link></div>
            </div>
            <div className="home-editorial__list"><p>{t("home.newArrivals")}</p>{trending.slice(7, 10).map((item, index) => <Link key={`${item.id}-${index}`} href={detailPath(item, item.type === "series" ? "series" : "movie")} className="home-editorial__item"><img src={imageUrl(item.poster)} alt="" loading="lazy" /><span><strong>{item.name}</strong><small>{item.year || item.releaseInfo || "—"} <i /> {item.imdbRating || "—"}</small></span><ArrowRight size={14} /></Link>)}</div>
          </section>}

          <HomeGridSection title={t("home.latestMovies")} label={t("hero.movie")} href="/discover/movies" items={latestMovies} kind="movie" t={t} dir={dir} loading={loading} />
          <HomeGridSection title={t("home.latestSeries")} label={t("hero.series")} href="/discover/series" items={latestSeries} kind="series" t={t} dir={dir} loading={loading} />
          <section className="home-discovery-strip"><div><span className="home-discovery-strip__icon"><Search size={20} /></span><div><strong>{t("home.exploreTitle1")} {t("home.exploreTitle2")}</strong><p>{t("home.exploreDesc")}</p></div></div><Link href="/search" className="home-action home-action--primary">{t("home.exploreCta")} <ArrowRight size={14} /></Link></section>
          {catalogError && <p className="home-catalog-error">{t("home.catalogError")}</p>}
        </div>
      </main>
      <footer className="home-footer"><div><strong>Movie Witcher</strong><p>{t("home.footerNote")}</p></div><div className="home-footer__links"><span>{t("nav.movies")}</span><span>{t("nav.series")}</span><span>{t("nav.history")}</span><span>{t("home.legal")}</span></div><span>◷ {t("home.legal")}</span></footer>
    </div>
  );
}

function watchHref(item: MediaItem, kind: "movie" | "series") {
  return `/watch/${kind}/${encodeURIComponent(item.imdb_id || item.id)}`;
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

function ContinueSection({ entries, t }: { entries: WatchHistoryEntry[]; t: Translator }) {
  return <section className="home-continue"><div className="home-section-heading"><div><p className="home-section-heading__eyebrow">{t("home.resume")}</p><h2>{t("home.continueWatching")}</h2></div><Link href="/history" className="home-see-all">{t("home.seeAll")} <ArrowRight size={13} /></Link></div><div className="home-continue__grid">{entries.map((entry) => { const progress = entry.durationSeconds && entry.positionSeconds ? Math.min(100, Math.round((entry.positionSeconds / entry.durationSeconds) * 100)) : 0; const id = entry.kind === "series" && entry.season && entry.episode ? `${entry.id}:${entry.season}:${entry.episode}` : entry.id; return <Link key={`${entry.kind}-${entry.id}-${entry.season || 0}-${entry.episode || 0}`} href={`/watch/${entry.kind}/${encodeURIComponent(id)}`} className="home-continue__card"><div className="home-continue__visual"><img src={imageUrl(entry.background || entry.poster)} alt="" loading="lazy" /><span><Play size={14} fill="currentColor" /></span></div><div className="home-continue__info"><strong>{entry.name}</strong><small>{entry.kind === "series" && entry.season && entry.episode ? `S${entry.season} E${entry.episode}` : t("history.movie")} <i /> {progress}%</small><div><b style={{ width: `${progress}%` }} /></div></div></Link>; })}</div></section>;
}

function HomeGridSection({ title, label, href, items, kind, t, dir, loading }: { title: string; label: string; href: string; items: MediaItem[]; kind: "movie" | "series" | "mixed"; t: Translator; dir: "rtl" | "ltr"; loading: boolean }) {
  return <section className="home-grid-section"><div className="home-grid-heading"><div className="home-grid-heading__title"><span className="home-grid-heading__mark"><Sparkles size={13} /></span><h2>{title}</h2><span className="home-grid-heading__label">{label}</span></div><Link href={href} className="home-see-all">{t("home.all")} {dir === "rtl" ? <ArrowRight className="rotate-180" size={13} /> : <ArrowRight size={13} />}</Link></div>{loading ? <div className="home-grid home-grid--skeleton" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <span key={index} />)}</div> : items.length > 0 ? <div className="home-grid">{items.map((item, index) => <MediaCard key={`${item.id}-${index}`} item={item} kind={kind === "mixed" ? (item.type === "series" ? "series" : "movie") : kind} priority={index < 6} />)}</div> : <div className="home-grid-empty">{t("home.noTitles")}</div>}</section>;
}
