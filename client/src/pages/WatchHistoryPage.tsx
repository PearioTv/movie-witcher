import { useEffect, useMemo, useState } from "react";
import { Clock3, History, Play, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { type MediaKind, type WatchHistoryEntry, clearWatchHistory, imageUrl, readWatchHistory, removeWatchHistory } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type Filter = "all" | MediaKind;
type Translator = (key: string, vars?: Record<string, string | number>) => string;

export default function WatchHistoryPage() {
  const { dir, t } = useLocale();
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
          <div className="history-tabs" role="tablist">{(["all", "movie", "series"] as Filter[]).map((value) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={filter === value ? "history-tab history-tab--active" : "history-tab"}>{value === "all" ? t("history.all") : value === "movie" ? t("history.movies") : t("history.tvShows")}</button>)}</div>
          {visible.length > 0 ? <div className="history-grid">{visible.map((entry) => <HistoryCard key={`${entry.kind}-${entry.id}`} entry={entry} t={t} onRemove={() => remove(entry)} />)}</div> : <div className="history-empty"><History size={30} /><h2>{t("history.emptyTitle")}</h2><p>{t("history.emptyDesc")}</p><Link href="/discover/movies" className="hero-primary-action"><Play size={15} fill="currentColor" /> {t("home.startDiscover")}</Link></div>}
        </div>
      </main>
    </div>
  );
}

function HistoryCard({ entry, t, onRemove }: { entry: WatchHistoryEntry; t: Translator; onRemove: () => void }) {
  const id = entry.kind === "series" && entry.season && entry.episode ? `${entry.id}:${entry.season}:${entry.episode}` : entry.id;
  const href = `/watch/${entry.kind}/${encodeURIComponent(id)}`;
  return <article className="history-card"><Link href={href} className="history-card__visual group"><div className="history-card__image">{imageUrl(entry.background || entry.poster) && <img src={imageUrl(entry.background || entry.poster)} alt="" loading="lazy" />}</div><span className="history-card__shade" /><span className="history-card__play"><Play size={18} fill="currentColor" /></span><span className="history-card__remove"><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onRemove(); }} aria-label={t("history.removeOne")}><X size={17} /></button></span><span className="history-card__badge">{entry.kind === "series" && entry.season && entry.episode ? `S${entry.season} E${entry.episode}` : entry.kind === "movie" ? t("history.movie") : t("history.series")}</span><span className="history-progress"><i style={{ width: "24%" }} /></span></Link><div className="history-card__body"><strong>{entry.name}</strong><small>{entry.kind === "series" && entry.season && entry.episode ? `${t("watch.seasonShort")} ${entry.season} · ${t("watch.episode")} ${entry.episode}` : t("history.movie")}</small><span><Clock3 size={12} /> {t("history.justNow")}</span></div></article>;
}
