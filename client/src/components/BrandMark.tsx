/**
 * DESIGN: أطلس السيلولويد — رمز بوابة هندسي بأحمر Vermilion Cut على خلفية فحمية.
 */
import { Link } from "wouter";

type BrandMarkProps = {
  compact?: boolean;
};

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3 no-underline" aria-label="Movie Witcher — الصفحة الرئيسية">
      <span className="grid size-10 place-items-center overflow-hidden rounded-[0.72rem] bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
        <img src="/assets/movie-witcher-mark.png" alt="" className="size-[85%] object-contain" />
      </span>
      {!compact && (
        <span className="wordmark" aria-label="Movie Witcher">
          <span className="wordmark__top">MO<span>V</span>IE</span>
          <span className="wordmark__bottom"><b>W</b>ITCHER</span>
          <i className="wordmark__cut" aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}
