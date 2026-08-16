import { useEffect, useMemo, useState } from "react";
import { Clock3, History, Play, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { type MediaKind, type WatchHistoryEntry, clearWatchHistory, imageUrl, readWatchHistory, removeWatchHistory } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type Filter = "all" | MediaKind;
type Translator = (key: string, vars?: Record<string, string | number>) => string;

export default function WatchHistoryPage() {
  const { dir, locale, t } = useLocale();
  const [entries, setEntries] = useState<WatchHistoryEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const sync = () => setEntries(readWatchHistory());
    sync();
    window.addEventListener("mw-watch-history-change", sync);
    return () => window.removeEventListener("mw-watch-history-change", sync);
  }, []);

  const visible = useMemo(() => filter === "all" ? entries : entries.filter((entry) => entry.kind === filter), [entries, filter]);

  function remove(entry: WatchHistoryEntry) {
    removeWatchHistory(entry.id, entry.kind);
  }

  function clearAll() {
    if (entries.length && window.confirm(t("history.clearConfirm"))) clearWatchHistory();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#f4f0e9]" dir={dir}>
      <SiteHeader />
      <main className="history-page">
        <div className="history-page__inner">
          <header className="history-header">
            <div className="history-heading"><span className="history-heading__icon"><History size={21} /></span><div><p className="eyebrow">{t("history.eyebrow")}</p><h1>{t("history.title")}</h1><p>{entries.length} {t("history.items")}</p></div></div>
            <div className="history-actions"><button type="button" className="history-action history-action--muted" onClick={() => entries[0] && remove(entries[0])} disabled={!entries.length}><Trash2 size={14} /> {t("history.removeItems")}</button><button type="button" className="history-action" onClick={clearAll} disabled={!entries.length}>{t("history.clearAll")}</button></div>
          </header>
          <div className="history-tabs" role="tablist" aria-label={t("history.filterLabel")}>{(["all", "movie", "series"] as Filter[]).map((value) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={filter === value ? "history-tab history-tab--active" : "history-tab"}>{value === "all" ? t("history.all") : value === "movie" ? t("history.movies") : t("history.tvShows")}</button>)}</div>
          {visible.length > 0 ? <div className="history-grid">{visible.map((entry) => <HistoryCard key={`${entry.kind}-${entry.id}-${entry.season || 0}-${entry.episode || 0}`} entry={entry} t={t} language={locale} onRemove={() => remove(entry)} />)}</div> : <div className="history-empty"><History size={30} /><h2>{t("history.emptyTitle")}</h2><p>{t("history.emptyDesc")}</p><Link href="/discover/movies" className="hero-primary-action"><Play size={15} fill="currentColor" /> {t("home.startDiscover")}</Link></div>}
        </div>
      </main>
    </div>
  );
}

function formatRelativeTime(timestamp: number, language: "ar" | "en"): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return language === "ar" ? "منذ لحظات" : "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return language === "ar" ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return language === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return language === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
}

function HistoryCard({ entry, t, language, onRemove }: { entry: WatchHistoryEntry; t: Translator; language: "ar" | "en"; onRemove: () => void }) {
  const id = entry.kind === "series" && entry.season && entry.episode ? `${entry.id}:${entry.season}:${entry.episode}` : entry.id;
  const href = `/watch/${entry.kind}/${encodeURIComponent(id)}`;
  const poster = imageUrl(entry.background || entry.poster);
  const progress = entry.durationSeconds && entry.positionSeconds ? Math.min(100, Math.round((entry.positionSeconds / entry.durationSeconds) * 100)) : 0;
  const label = entry.kind === "series" && entry.season && entry.episode ? `S${entry.season} E${entry.episode}` : entry.kind === "movie" ? t("history.movie") : t("history.series");
  return <article className="history-card"><div className="history-card__visual"><Link href={href} className="group block size-full" aria-label={`${t("card.open")}: ${entry.name}`}><div className="history-card__image">{poster && <img src={poster} alt={entry.name} loading="lazy" />}</div><span className="history-card__shade" /><span className="history-card__play"><Play size={18} fill="currentColor" /></span><span className="history-card__badge">{label}</span>{progress > 0 && <span className="history-progress" aria-label={`${progress}%`}><i style={{ width: `${progress}%` }} /></span>}</Link><span className="history-card__remove"><button type="button" onClick={onRemove} aria-label={`${t("history.removeOne")}: ${entry.name}`}><X size={17} /></button></span></div><div className="history-card__body"><strong title={entry.name}>{entry.name}</strong><small>{entry.kind === "series" && entry.season && entry.episode ? `${t("watch.seasonShort")} ${entry.season} · ${t("watch.episode")} ${entry.episode}` : t("history.movie")}</small><span><Clock3 size={12} /> {formatRelativeTime(entry.updatedAt, language)}{progress > 0 && ` · ${progress}%`}</span></div></article>;
}
