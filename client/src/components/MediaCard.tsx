import { Play } from "lucide-react";
import { Link } from "wouter";
import { type MediaItem, detailPath, imageUrl } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type MediaCardProps = {
  item: MediaItem;
  kind?: "movie" | "series";
  priority?: boolean;
  sequence?: number;
};

function displayYear(item: MediaItem) {
  return String(item.year || item.releaseInfo || "—").slice(0, 4);
}

function displayRuntime(item: MediaItem) {
  if (item.runtime) return item.runtime.replace(/\s+/g, " ");
  return "—";
}

export default function MediaCard({ item, kind = "movie", priority = false, sequence }: MediaCardProps) {
  const { t } = useLocale();
  const poster = imageUrl(item.poster);
  const isSeries = item.type === "series" || kind === "series";
  const label = isSeries ? t("hero.series") : t("hero.movie");

  return (
    <Link href={detailPath(item, kind)} className="media-card group" aria-label={`${t("card.open")} ${item.name}`}>
      <div className="media-card__poster">
        {poster ? <img src={poster} alt={item.name} loading={priority ? "eager" : "lazy"} /> : <div className="media-card__fallback">MW</div>}
        <span className="media-card__quality">HD</span>
        <span className="media-card__play"><Play size={16} fill="currentColor" /></span>
        {sequence && <span className="media-card__frame"><b>{String(sequence).padStart(2, "0")}</b><i />{label}</span>}
      </div>
      <div className="media-card__info">
        <h3>{item.name}</h3>
        <div className="media-card__meta">
          <span>{displayYear(item)}</span>
          <i />
          <span>{displayRuntime(item)}</span>
          <em>{label}</em>
        </div>
      </div>
    </Link>
  );
}
