import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Film, Play, Star } from "lucide-react";
import { Link, useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import { enrichCastWithPhotos, getFullCast, type CastMember, type Episode, type MediaItem, type MediaKind, backdropUrl, getCatalog, getMeta, imageUrl, mediaPath } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocalizedDescription } from "@/hooks/useLocalizedDescription";

export default function DetailPage() {
  const { kind = "movie", id = "" } = useParams<{ kind: MediaKind; id: string }>();
  const { dir, t } = useLocale();
  const [meta, setMeta] = useState<MediaItem | null>(null);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [season, setSeason] = useState(1);
  const { value: localizedDescription, translating } = useLocalizedDescription(meta?.description);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getMeta(kind, id).then((data) => {
      if (!active) return;
      setMeta(data);
      setLoading(false);
      const imdbId = data.imdb_id || data.id;
      getFullCast(imdbId).then((fullCast) => {
        if (fullCast.length > 0) return fullCast;
        return enrichCastWithPhotos(data.cast || []);
      }).catch(() => enrichCastWithPhotos(data.cast || [])).then((cast) => {
        if (active && cast.length > 0) setMeta((current) => current ? { ...current, cast } : current);
      }).catch(() => undefined);
      const firstSeason = data.videos?.find((video) => video.season > 0)?.season;
      setSeason(firstSeason || 1);
      getCatalog(kind).then((catalog) => {
        if (!active) return;
        const currentId = data.imdb_id || data.id;
        const preferredGenre = data.genres?.[0];
        const suggestions = catalog.filter((item) => item.id !== currentId && item.imdb_id !== currentId && (!preferredGenre || item.genres?.includes(preferredGenre))).slice(0, 12);
        setRelated(suggestions.length >= 4 ? suggestions : catalog.filter((item) => item.id !== currentId && item.imdb_id !== currentId).slice(0, 12));
      }).catch(() => undefined);
    }).catch((reason) => {
      if (active) {
        setError(reason instanceof Error ? reason.message : t("detail.failedGeneric"));
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [kind, id]);

  const isSeries = kind === "series";
  const seasons = useMemo(() => Array.from(new Set((meta?.videos || []).map((item) => item.season).filter((value) => value > 0))).sort((a, b) => a - b), [meta]);
  const episodes = useMemo(() => (meta?.videos || []).filter((item) => item.season === season).sort((a, b) => a.episode - b.episode), [meta, season]);
  const backdrop = meta ? backdropUrl(meta, "large") : undefined;

  return (
    <div className="min-h-screen bg-[#10100f] text-[#f4f0e9]" dir={dir}>
      <SiteHeader />
      <main className="detail-page">
        {backdrop && <div className="detail-page__backdrop" style={{ backgroundImage: `url(${backdrop})` }} aria-hidden="true" />}
        <div className="relative z-10 mx-auto max-w-[1480px] px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pt-12">
          <Link href={kind === "series" ? "/discover/series" : "/discover/movies"} className="watch-back-link">{dir === "rtl" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t("detail.back")}</Link>
          {loading && <div className="flex min-h-[70vh] items-center justify-center text-sm text-[#c0bcb4]"><span className="loading-orbit ml-3" /> {t("detail.loading")}</div>}
          {!loading && error && <div className="search-empty mt-16"><Film size={22} className="text-[#e33b2f]" /><div><h1>{t("detail.failedTitle")}</h1><p>{error}</p></div></div>}
          {!loading && meta && (
            <>
              <section className="detail-hero mt-9 lg:mt-14">
                <div className="detail-hero__poster">{imageUrl(meta.poster) ? <img src={imageUrl(meta.poster)} alt={meta.name} /> : <span>MW</span>}</div>
                <div className="detail-hero__copy">
                  <p className="eyebrow">{isSeries ? t("detail.seriesEyebrow") : t("detail.movieEyebrow")}</p>
                  <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.08em] text-[#f8f3ed] sm:text-7xl">{meta.name}</h1>
                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-[#b6b1aa]"><span className="inline-flex items-center gap-1.5 text-[#f2ece4]"><Star size={13} className="text-[#e33b2f]" fill="currentColor" /> {meta.imdbRating || "—"}</span><span className="meta-divider" /><span>{meta.releaseInfo || meta.year || "—"}</span>{meta.runtime && <><span className="meta-divider" /><span className="inline-flex items-center gap-1"><Clock3 size={13} />{meta.runtime}</span></>}{meta.genres?.slice(0, 4).map((genreName) => <span className="genre-chip" key={genreName}>{genreName}</span>)}</div>
                  <p className="mt-7 max-w-3xl text-sm leading-7 text-[#c0bbb4] sm:text-[0.96rem]">{translating ? t("detail.translating") : localizedDescription || t("detail.noSynopsis")}</p>
                  <div className="mt-8 flex flex-wrap gap-3"><Link href={mediaPath(meta, kind)} className="watch-action inline-flex items-center"><Play size={16} fill="currentColor" /> {t("detail.play")}</Link>{isSeries && <a href="#episodes" className="detail-secondary-action">{t("detail.episodes")}</a>}</div>
                </div>
              </section>

              {isSeries && seasons.length > 0 && <section id="episodes" className="detail-section"><div className="detail-section__heading"><div><p className="eyebrow">{t("detail.episodesEyebrow")}</p><h2>{t("detail.episodesTitle")}</h2></div><div className="season-nav">{seasons.map((value) => <button key={value} type="button" onClick={() => setSeason(value)} className={season === value ? "season-nav__item season-nav__item--active" : "season-nav__item"}>{t("watch.seasonShort")} {value}</button>)}</div></div><div className="detail-episode-list">{episodes.map((item) => <EpisodeCard key={item.id} item={item} kind={kind} id={id} t={t} dir={dir} />)}</div></section>}

              <CastSection cast={meta.cast || []} t={t} />
              <section className="detail-section"><div className="detail-section__heading"><div><p className="eyebrow">{t("detail.recommendationsEyebrow")}</p><h2>{t("detail.moreLikeThis")}</h2></div><span className="detail-section__count">{related.length} {t("detail.titles")}</span></div>{related.length > 0 ? <div className="media-grid">{related.map((item, index) => <MediaCard key={item.id} item={item} kind={kind} priority={index < 4} />)}</div> : <div className="detail-empty">{t("detail.noRecommendations")}</div>}</section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function CastSection({ cast, t }: { cast: Array<CastMember | string>; t: (key: string, vars?: Record<string, string | number>) => string }) {
  if (!cast.length) return null;
  return <section className="detail-section detail-cast-section"><div className="detail-section__heading"><div><p className="eyebrow">{t("detail.castEyebrow")}</p><h2>{t("detail.topCast")}</h2></div></div><div className="cast-rail">{cast.slice(0, 50).map((entry, index) => { const member = typeof entry === "string" ? { name: entry } : entry; return <div className="cast-card" key={`${member.name}-${member.character || index}`}><div className="cast-card__photo">{imageUrl(member.photo) ? <img src={imageUrl(member.photo)} alt={member.name} loading="lazy" /> : <span>{member.name.slice(0, 1)}</span>}</div><strong>{member.name}</strong><small>{member.character || t("detail.castMember")}</small></div>; })}</div></section>;
}

function EpisodeCard({ item, kind, id, t, dir }: { item: Episode; kind: MediaKind; id: string; t: (key: string, vars?: Record<string, string | number>) => string; dir: "rtl" | "ltr" }) {
  const watchId = `${decodeURIComponent(id).split(":")[0]}:${item.season}:${item.episode}`;
  return <Link href={`/watch/${kind}/${encodeURIComponent(watchId)}`} className="detail-episode-card"><span className="detail-episode-card__number">{String(item.episode).padStart(2, "0")}</span>{imageUrl(item.thumbnail) && <img src={imageUrl(item.thumbnail)} alt="" loading="lazy" />}<span className={dir === "rtl" ? "min-w-0 flex-1 text-right" : "min-w-0 flex-1 text-left"}><strong>{item.title || t("watch.episodeFallback", { n: item.episode })}</strong><small>{item.description || t("watch.episodeHint")}</small></span>{dir === "rtl" ? <ArrowLeft size={17} className="shrink-0 text-[#77746f]" /> : <ArrowRight size={17} className="shrink-0 text-[#77746f]" />}</Link>;
}
