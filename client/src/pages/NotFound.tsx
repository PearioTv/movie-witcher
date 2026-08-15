/**
 * DESIGN: أطلس السيلولويد — حتى مسار الخطأ يبقى كإطار عنواني هادئ ومباشر للعودة إلى الاستكشاف.
 */
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { useLocale } from "@/contexts/LocaleContext";

export default function NotFound() {
  const { dir, t } = useLocale();
  return (
    <div className="min-h-screen bg-[#10100f] text-[#f4f0e9]" dir={dir}><SiteHeader /><main className="mx-auto grid min-h-[78vh] max-w-[1480px] place-items-center px-5 text-center"><div><p className="eyebrow">{t("404.eyebrow")}</p><h1 className="mt-4 font-display text-6xl font-bold tracking-[-0.08em] sm:text-8xl">404</h1><p className="mt-5 text-[#aaa7a1]">{t("404.desc")}</p><Link href="/" className="mt-8 inline-flex rounded-full bg-[#e33b2f] px-5 py-3 text-sm font-bold text-white">{t("404.back")}</Link></div></main></div>
  );
}
