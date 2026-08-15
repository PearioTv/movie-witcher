/**
 * DESIGN: أطلس السيلولويد — المشاهدة هي مركز الشاشة؛ تكشف البيانات والحلقات في أشرطة جانبية ذات إيقاع تحريري.
 */
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Film, Play, Star } from "lucide-react";
import { Link, useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { backdropUrl, recordWatchHistory, type Episode, type MediaItem, type MediaKind, getMeta, imageUrl } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocalizedDescription } from "@/hooks/useLocalizedDescription";

type WatchParams = { kind: MediaKind; id: string };

export default function WatchPage() {
  const { kind, id } = useParams<WatchParams>();
  const { dir, t } = useLocale();
  const [meta, setMeta] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const { value: localizedDescription, translating } = useLocalizedDescription(episode?.description || meta?.description);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getMeta(kind, id).then((data) => {
      if (!active) return;
      setMeta(data);
      const initial = data.videos?.find((value) => value.id === decodeURIComponent(id)) || data.videos?.[0] || null;
      setSeason(initial?.season || 1);
      setEpisode(initial);
      recordWatchHistory(data, kind, initial || undefined);
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : t("watch.failedGeneric"));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, id]);

  const seasons = useMemo(() => Array.from(new Set((meta?.videos || []).map((item) => item.season).filter((value) => value > 0))).sort((a, b) => a - b), [meta]);
  const episodes = useMemo(() => (meta?.videos || []).filter((item) => item.season === season).sort((a, b) => a.episode - b.episode), [meta, season]);
  const isSeries = kind === "series";
  const backdrop = meta ? backdropUrl(meta, "large") || "/assets/movie-witcher-watch.jpg" : "/assets/movie-witcher-watch.jpg";
  const playerUrl = isSeries && episode ? `https://vidfast.pro/tv/${encodeURIComponent(id.split(":")[0])}/${episode.season}/${episode.episode}?autoPlay=true&nextButton=true` : `https://vidfast.pro/movie/${encodeURIComponent(id.split(":")[0])}?autoPlay=true&nextButton=true`;

  function changeSeason(next: number) {
    setSeason(next);
    const nextEpisode = (meta?.videos || []).filter((value) => value.season === next).sort((a, b) => a.episode - b.episode)[0] || null;
    setEpisode(nextEpisode);
    if (meta) recordWatchHistory(meta, kind, nextEpisode || undefined);
  }

  function selectEpisode(next: Episode) {
    setEpisode(next);
    if (meta) recordWatchHistory(meta, kind, next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#10100f] text-[#f4f0e9]" dir={dir}>
      <SiteHeader />
      <main className="relative overflow-hidden pb-24">
        <div className="watch-backdrop" style={{ backgroundImage: `url(${backdrop})` }} aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1480px] px-5 pt-9 sm:px-8 lg:px-10 lg:pt-12">
          <Link href="/search" className="watch-back-link">{dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t("watch.back")}</Link>
          {loading && <div className="flex min-h-[65vh] items-center justify-center text-sm text-[#c0bcb4]"><span className="loading-orbit ml-3" /> {t("watch.preparing")}</div>}
          {!loading && error && <div className="search-empty mt-16"><Film size={22} className="text-[#e33b2f]" /><div><h1>{t("watch.failedTitle")}</h1><p>{error}</p></div></div>}
          {!loading && meta && (
            <div className="pt-8 lg:pt-12">
              <div className="player-prologue"><span>SCREEN / 01</span><i /><p>{isSeries ? t("watch.activeSeason", { season, episode: episode?.episode || 1 }) : t("watch.selectedMovie")}</p><b>MW / PLAYBACK</b></div>
              <section className="player-frame">
                <iframe key={playerUrl} src={playerUrl} title={meta.name} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
                <span className="player-frame__label">MOVIE WITCHER <i /> LIVE FRAME</span>
              </section>
              <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
                <div>
                  <p className="eyebrow">{isSeries ? `${t("watch.season")} ${season} · ${t("watch.episode")} ${episode?.episode || 1}` : t("watch.nowPlaying")}</p>
                  <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div><h1 className="font-display text-4xl font-bold tracking-[-0.07em] sm:text-6xl">{meta.name}</h1><div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-[#adaaa4]"><span className="inline-flex items-center gap-1.5"><Star size={13} className="text-[#e33b2f]" fill="currentColor" /> {meta.imdbRating || "—"}</span><span className="meta-divider" /> <span>{meta.releaseInfo || meta.year || "—"}</span>{meta.runtime && <><span className="meta-divider" /><span className="inline-flex items-center gap-1"><Clock3 size={13} />{meta.runtime}</span></>}{meta.genres?.slice(0, 3).map((genre) => <span key={genre} className="genre-chip">{genre}</span>)}</div></div>
                    <Button className="watch-action" onClick={() => document.querySelector("iframe")?.requestFullscreen?.()}><Play size={16} fill="currentColor" /> {t("watch.openScreen")}</Button>
                  </div>
                  <p className="mt-7 max-w-3xl text-sm leading-7 text-[#bbb7b0] sm:text-[0.95rem]">{translating ? t("detail.translating") : localizedDescription || t("watch.noSynopsis")}</p>
                </div>
                <aside className="watch-summary"><div className="watch-summary__head"><p className="eyebrow">{t("watch.pathDetails")}</p><span>R–01</span></div><dl><div><dt>{t("watch.type")}</dt><dd>{isSeries ? t("watch.series") : t("watch.movie")}</dd></div><div><dt>{t("watch.status")}</dt><dd>{t("watch.available")}</dd></div><div><dt>{t("watch.source")}</dt><dd>Vidfast</dd></div></dl><p className="watch-summary__note">{t("watch.pausedNote")}</p></aside>
              </section>
              {isSeries && seasons.length > 0 && (
                <section className="mt-14 border-t border-white/10 pt-9">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">{t("watch.chooseEpisode")}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.06em]">{t("watch.seasonsPath")}</h2></div><div className="season-nav">{seasons.map((value) => <button key={value} type="button" onClick={() => changeSeason(value)} className={season === value ? "season-nav__item season-nav__item--active" : "season-nav__item"}>{t("watch.seasonShort")} {value}</button>)}</div></div>
                  <div className="episode-list mt-7">{episodes.map((item) => <button key={item.id} type="button" onClick={() => selectEpisode(item)} className={episode?.id === item.id ? "episode-card episode-card--active" : "episode-card"}><span className="episode-card__number">{String(item.episode).padStart(2, "0")}</span><span className={dir === "rtl" ? "min-w-0 flex-1 text-right" : "min-w-0 flex-1 text-left"}><strong>{item.title || t("watch.episodeFallback", { n: item.episode })}</strong><small>{item.description || t("watch.episodeHint")}</small></span>{dir === "rtl" ? <ChevronLeft size={18} className="shrink-0 text-[#77746f]" /> : <ChevronRight size={18} className="shrink-0 text-[#77746f]" />}</button>)}</div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
