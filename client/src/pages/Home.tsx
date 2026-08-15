import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Play } from "lucide-react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import HeroCarousel from "@/components/HeroCarousel";
import { type MediaItem, type WatchHistoryEntry, getCatalog, getKDramaCatalog, imageUrl, readWatchHistory } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type CatalogRows = { movies: MediaItem[]; series: MediaItem[] };
type Translator = (key: string, vars?: Record<string, string | number>) => string;

export default function Home() {
  const { dir, t } = useLocale();
  const [rows, setRows] = useState<CatalogRows>({ movies: [], series: [] });
  const [kDramas, setKDramas] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCatalog("movie"), getCatalog("series")]).then(([movies, series]) => {
      if (active) setRows({ movies, series });
    }).catch(() => { if (active) setCatalogError(true); });
    getKDramaCatalog().then((items) => { if (active) setKDramas(items); }).catch(() => undefined);
    const syncHistory = () => setHistory(readWatchHistory());
    syncHistory();
    window.addEventListener("mw-watch-history-change", syncHistory);
    return () => { active = false; window.removeEventListener("mw-watch-history-change", syncHistory); };
  }, []);

  const featured = useMemo(() => {
    const candidates = [...rows.movies, ...rows.series];
    const avengers = candidates.find((item) => item.name.toLowerCase().includes("avengers"));
    const mixed: MediaItem[] = [];
    if (avengers) mixed.push(avengers);
    for (const item of candidates) {
      if (mixed.length >= 8) break;
      if (!mixed.some((current) => current.id === item.id)) mixed.push(item);
    }
    return mixed;
  }, [rows]);

  const trending = useMemo(() => [...rows.series.slice(0, 6), ...rows.movies.slice(0, 8)].slice(0, 14), [rows]);
  const anime = useMemo(() => {
    const animated = [...rows.series, ...rows.movies].filter((item) => item.genres?.some((genre) => /animation|anime|fantasy/i.test(genre)));
    return (animated.length >= 8 ? animated : rows.series).slice(0, 14);
  }, [rows]);
  const upcoming = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const future = rows.movies.filter((item) => Number(String(item.year || item.releaseInfo || "").slice(0, 4)) >= currentYear);
    return (future.length >= 8 ? future : rows.movies).slice(0, 14);
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f4f0e9]" dir={dir}>
      <SiteHeader />
      <main>
        <HeroCarousel items={featured} />
        <section className="home-catalog-shell">
          <div className="home-catalog-inner">
            <ContinueWatching items={history.slice(0, 3)} t={t} />
            <HomeRail title={t("home.trendingToday")} items={trending} kind="mixed" href="/discover/movies" t={t} dir={dir} />
            <HomeRail title={t("home.kdramas")} items={kDramas} kind="series" href="/discover/series" t={t} dir={dir} />
            <HomeRail title={t("home.tvAiring")} items={rows.series.slice(0, 14)} kind="series" href="/discover/series" t={t} dir={dir} />
            <HomeRail title={t("home.popularAnime")} items={anime} kind="mixed" href="/discover/series" t={t} dir={dir} />
            <HomeRail title={t("home.upcomingMovies")} items={upcoming} kind="movie" href="/discover/movies" t={t} dir={dir} />
            {catalogError && <p className="home-catalog-error">{t("home.catalogError")}</p>}
          </div>
        </section>
      </main>
      <footer className="home-footer"><strong>Movie Witcher</strong><p>{t("home.footerNote")}</p><span>◷ {t("home.legal")}</span></footer>
    </div>
  );
}

function historyWatchPath(entry: WatchHistoryEntry) {
  const id = entry.kind === "series" && entry.season && entry.episode ? `${entry.id}:${entry.season}:${entry.episode}` : entry.id;
  return `/watch/${entry.kind}/${encodeURIComponent(id)}`;
}

function ContinueWatching({ items, t }: { items: WatchHistoryEntry[]; t: Translator }) {
  return <section className="continue-section"><div className="home-section-heading"><h2><span className="section-play-mark"><Play size={10} fill="currentColor" /></span>{t("home.continueWatching")}</h2><Link href="/history" className="home-see-all">{t("home.seeAll")} <ChevronRight size={12} /></Link></div>{items.length > 0 ? <div className="continue-grid">{items.map((item, index) => <Link key={`${item.kind}-${item.id}`} href={historyWatchPath(item)} className="continue-card group"><div className="continue-card__image">{imageUrl(item.background || item.poster) && <img src={imageUrl(item.background || item.poster)} alt="" />}</div><div className="continue-card__veil" /><div className="continue-card__body"><span className="continue-card__kind">{item.kind === "series" ? t("hero.series") : t("hero.movie")}</span><strong>{item.name}</strong><small>{item.kind === "series" && item.season && item.episode ? `${t("watch.seasonShort")} ${item.season} · ${t("watch.episode")} ${item.episode}` : t("home.resume")}</small><div className="continue-progress"><i style={{ width: `${[42, 68, 26][index % 3]}%` }} /></div></div><span className="continue-card__play"><Play size={13} fill="currentColor" /></span></Link>)}</div> : <div className="continue-empty"><Play size={15} /><span>{t("home.historyEmpty")}</span><Link href="/discover/movies">{t("home.startDiscover")}</Link></div>}</section>;
}

function HomeRail({ title, items, kind, href, t, dir }: { title: string; items: MediaItem[]; kind: "movie" | "series" | "mixed"; href: string; t: Translator; dir: "rtl" | "ltr" }) {
  return <section className="home-rail-section"><div className="home-section-heading"><h2><span className="section-red-line" />{title}</h2><Link href={href} className="home-see-all">{t("home.seeAll")} {dir === "rtl" ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}</Link></div>{items.length > 0 ? <div className="media-rail home-media-rail">{items.map((item, index) => <MediaCard key={`${item.id}-${index}`} item={item} kind={kind === "mixed" ? (item.type === "series" ? "series" : "movie") : kind} priority={index < 5} />)}</div> : <div className="home-rail-skeleton"><span /><span /><span /><span /><span /></div>}</section>;
}
