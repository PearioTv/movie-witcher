/**
 * DESIGN: أطلس السيلولويد — بطل بصري بانورامي ومسارات اكتشاف تحريرية تتجنب تخطيط الشبكة المتماثل.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import HeroCarousel from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import { type MediaItem, getCatalog } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type CatalogRows = { movies: MediaItem[]; series: MediaItem[] };

export default function Home() {
  const [, setLocation] = useLocation();
  const { dir, t } = useLocale();
  const [rows, setRows] = useState<CatalogRows>({ movies: [], series: [] });
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCatalog("movie"), getCatalog("series")]).then(([movies, series]) => {
      if (active) setRows({ movies, series });
    }).catch(() => { if (active) setCatalogError(true); });
    return () => { active = false; };
  }, []);

  // Interleave trending movies and series so the hero rotates through a mix,
  // the same way Cineby's featured banner cycles across both.
  const trending = useMemo(() => {
    const mixed: MediaItem[] = [];
    const max = Math.max(rows.movies.length, rows.series.length);
    for (let i = 0; i < max && mixed.length < 8; i++) {
      if (rows.movies[i]) mixed.push(rows.movies[i]);
      if (rows.series[i] && mixed.length < 8) mixed.push(rows.series[i]);
    }
    return mixed;
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#10100f] text-[#f4f0e9]" dir={dir}>
      <SiteHeader />
      <main>
        <HeroCarousel items={trending} />

        <section className="relative z-10 -mt-8 rounded-t-[2rem] bg-[#10100f] pt-12 sm:-mt-12 sm:rounded-t-[3rem] sm:pt-16">
          <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-10">
            <div className="intro-ribbon">
              <div className="intro-ribbon__mark"><Sparkles size={19} /></div><p>{t("home.catalogTagline")}</p><Link href="/search" className="intro-ribbon__link">{t("home.openSearch")} {dir === "rtl" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</Link>
            </div>
          </div>
          <ContentRail label={t("home.railMostViewed")} title={t("home.railStartHere")} items={rows.movies.slice(0, 10)} kind="movie" />
          <section className="explore-banner mx-auto mt-7 max-w-[1480px] overflow-hidden sm:mt-12"><div className="explore-banner__image" /><div className="explore-banner__content"><p className="eyebrow">{t("home.exploreEyebrow")}</p><h2>{t("home.exploreTitle1")}<br /><em>{t("home.exploreTitle2")}</em></h2><p>{t("home.exploreDesc")}</p><Button variant="ghost" className="mt-5 h-10 gap-2 rounded-full border border-white/20 px-4 text-xs font-bold text-white hover:bg-white/10" onClick={() => setLocation("/search?type=series")}>{t("home.exploreCta")} <ArrowUpLeft size={15} /></Button></div></section>
          <ContentRail label={t("home.railSeasonLong")} title={t("home.railSeriesWaiting")} items={rows.series.slice(0, 10)} kind="series" />
          {catalogError && <p className="mx-auto max-w-[1480px] px-5 pb-16 text-center text-xs leading-6 text-[#8f8d88] sm:px-8 lg:px-10">{t("home.catalogError")}</p>}
        </section>
      </main>
    </div>
  );
}

function ContentRail({ label, title, items, kind }: { label: string; title: string; items: MediaItem[]; kind: "movie" | "series" }) {
  const { dir, t } = useLocale();
  return (
    <section className="mx-auto max-w-[1480px] px-5 pb-10 pt-16 sm:px-8 sm:pt-20 lg:px-10">
      <div className="rail-heading mb-6"><div><p className="eyebrow">{label}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.065em] sm:text-4xl">{title}</h2></div><div className="rail-heading__route"><span>PATH {kind === "movie" ? "01" : "02"}</span><i /> <em>{kind === "movie" ? t("home.pathMovie") : t("home.pathSeries")}</em><Link href={`/search?type=${kind === "series" ? "series" : "movie"}`}>{t("home.trackPath")} {dir === "rtl" ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}</Link></div></div>
      {items.length > 0 ? <div className="media-rail">{items.map((item, index) => <MediaCard key={item.id} item={item} kind={kind} priority={index < 2} sequence={index + 1} />)}</div> : <div className="catalog-skeleton"><span /><span /><span /><span /><span /></div>}
    </section>
  );
}
