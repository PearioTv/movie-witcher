/**
 * DESIGN: أطلس السيلولويد — بطل بصري يدور بين أبرز الأعمال الرائجة، بانتقال هادئ يشبه غرفة عرض حية.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Search, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import { type MediaItem, imageUrl, mediaPath } from "@/lib/stremio";
import { useLocale } from "@/contexts/LocaleContext";

const ROTATE_MS = 7000;

type HeroCarouselProps = {
  items: MediaItem[];
};

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [, setLocation] = useLocation();
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const slides = useMemo(() => items.slice(0, 8), [items]);
  const active = slides[index];

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = window.setTimeout(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearTimeout(timerRef.current);
  }, [index, paused, slides.length]);

  if (!active) {
    return (
      <section className="hero-stage">
        <div className="hero-stage__image" aria-hidden="true" />
        <div className="hero-stage__grain" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex min-h-[42rem] max-w-[1480px] items-end px-5 pb-16 pt-28 sm:px-8 lg:min-h-[46rem] lg:px-10 lg:pb-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Movie Witcher <span className="mx-2 text-[#e33b2f]">/</span> {t("hero.eyebrowGuide")}</p>
            <h1 className="mt-5 font-display text-[clamp(3.25rem,8vw,6.8rem)] font-bold leading-[0.88] tracking-[-0.085em] text-[#f7f2eb]">{t("hero.startSearch")}</h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="hero-primary-action" onClick={() => setLocation("/search")}><Search size={17} /> {t("hero.startSearch")}</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const kind = active.type === "series" ? "series" : "movie";
  const path = mediaPath(active, kind);
  const backdrop = imageUrl(active.background) || imageUrl(active.poster) || "/assets/movie-witcher-hero.jpg";

  return (
    <section
      className="hero-stage"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, slideIndex) => {
        const slideBackdrop = imageUrl(slide.background) || imageUrl(slide.poster) || "/assets/movie-witcher-hero.jpg";
        return (
          <div
            key={slide.id}
            className="hero-stage__image"
            aria-hidden="true"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(12,12,11,.95) 2%, rgba(12,12,11,.76) 36%, rgba(12,12,11,.18) 72%, rgba(12,12,11,.55)), linear-gradient(0deg, #10100f 0%, transparent 42%), url('${slideBackdrop}')`,
              opacity: slideIndex === index ? 1 : 0,
            }}
          />
        );
      })}
      <div className="hero-stage__grain" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[42rem] max-w-[1480px] items-end px-5 pb-16 pt-28 sm:px-8 lg:min-h-[46rem] lg:px-10 lg:pb-20">
        <div key={active.id} className="hero-stage__panel max-w-2xl">
          <p className="eyebrow">Movie Witcher <span className="mx-2 text-[#e33b2f]">/</span> {kind === "series" ? t("hero.series") : t("hero.movie")}</p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,6.5vw,5.4rem)] font-bold leading-[0.94] tracking-[-0.06em] text-[#f7f2eb]">{active.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-[#c9c5bd] sm:text-sm">
            {active.imdbRating && (
              <span className="inline-flex items-center gap-1.5 text-[#e33b2f]"><Star size={14} fill="currentColor" /> <span className="text-[#efece6]">{active.imdbRating}</span></span>
            )}
            <span>{active.releaseInfo || active.year || "—"}</span>
            {active.genres?.slice(0, 3).map((genre) => (
              <span key={genre} className="hero-stage__chip">{genre}</span>
            ))}
          </div>
          {active.description && (
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#c5c0b8] sm:text-base line-clamp-3">{active.description}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={path} className="hero-primary-action"><Play size={17} fill="currentColor" /> {t("hero.play")}</Link>
            <Link href={path} className="hero-secondary-action">{t("hero.seeMore")}</Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="hero-stage__dots" role="tablist" aria-label="Featured titles">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={slide.name}
              className={`hero-stage__dot ${slideIndex === index ? "hero-stage__dot--active" : ""}`}
              onClick={() => setIndex(slideIndex)}
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
