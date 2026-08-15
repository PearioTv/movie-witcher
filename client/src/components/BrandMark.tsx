import { Link } from "wouter";

type BrandMarkProps = {
  compact?: boolean;
};

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link href="/" className="brand-lockup group no-underline" aria-label="Movie witcher — الصفحة الرئيسية">
      {compact ? (
        <span className="brand-compact-icon" aria-hidden="true">MW</span>
      ) : (
        <img src="/assets/movie-witcher-logo.png" alt="Movie witcher" className="brand-logo-image" />
      )}
    </Link>
  );
}
