/**
 * DESIGN: أطلس السيلولويد — بطاقة كإطار فيلم؛ تكشف قرار المشاهدة تدريجياً ولا تساوي بين المعلومات والصورة.
 */
import { Play, Star } from "lucide-react";
import { Link } from "wouter";
import { type MediaItem, detailPath, imageUrl } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

type MediaCardProps = {
  item: MediaItem;
  kind?: "movie" | "series";
  priority?: boolean;
  sequence?: number;
};

export default function MediaCard({ item, kind = "movie", priority = false, sequence }: MediaCardProps) {
  const { t } = useLocale();
  const poster = imageUrl(item.poster);
  const rating = item.imdbRating || (item as MediaItem & { imdbRating?: number }).imdbRating;
  const label = item.type === "series" || kind === "series" ? t("hero.series") : t("hero.movie");

  return (
    <Link href={detailPath(item, kind)} className="media-card group" aria-label={`${t("card.open")} ${item.name}`}>
      <div className="media-card__poster">
        {poster ? (
          <img src={poster} alt={item.name} loading={priority ? "eager" : "lazy"} />
        ) : (
          <div className="media-card__fallback">MW</div>
        )}
        <div className="media-card__veil" />
        <span className="media-card__play"><Play size={15} fill="currentColor" /></span>
        {rating && <span className="media-card__rating"><Star size={11} fill="currentColor" /> {rating}</span>}
        {sequence && <span className="media-card__frame"><b>{String(sequence).padStart(2, "0")}</b><i />{label}</span>}
      </div>
      <div className="pt-3">
        <h3 className="line-clamp-1 font-display text-[0.94rem] font-semibold tracking-[-0.035em] text-[#f2eee8]">{item.name}</h3>
        <p className="mt-1 text-[0.69rem] font-medium tracking-[0.08em] text-[#a09f9c]">
          {item.releaseInfo || item.year || "—"} <span className="mx-1 opacity-40">·</span> {label}
        </p>
      </div>
    </Link>
  );
}
