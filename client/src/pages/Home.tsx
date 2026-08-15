/**
 * DESIGN: أطلس السيلولويد — بطل بصري بانورامي ومسارات اكتشاف تحريرية تتجنب تخطيط الشبكة المتماثل.
 */
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpLeft, Play, Search, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { type MediaItem, getCatalog, mediaPath } from "@/lib/stremio";

type CatalogRows = { movies: MediaItem[]; series: MediaItem[] };

export default function Home() {
  const [, setLocation] = useLocation();
  const [rows, setRows] = useState<CatalogRows>({ movies: [], series: [] });
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCatalog("movie"), getCatalog("series")]).then(([movies, series]) => {
      if (active) setRows({ movies, series });
    }).catch(() => { if (active) setCatalogError(true); });
    return () => { active = false; };
  }, []);

  const featured = rows.movies[0] || rows.series[0];
  const featuredPath = featured ? mediaPath(featured, featured.type === "series" ? "series" : "movie") : "/search";

  return (
    <div className="min-h-screen bg-[#10100f] text-[#f4f0e9]" dir="rtl">
      <SiteHeader />
      <main>
        <section className="hero-stage">
          <div className="hero-stage__image" aria-hidden="true" />
          <div className="hero-stage__grain" aria-hidden="true" />
          <div className="relative z-10 mx-auto flex min-h-[42rem] max-w-[1480px] items-end px-5 pb-16 pt-28 sm:px-8 lg:min-h-[46rem] lg:px-10 lg:pb-20">
            <div className="max-w-2xl">
              <p className="eyebrow">Movie Witcher <span className="mx-2 text-[#e33b2f]">/</span> دليل المشاهدة</p>
              <h1 className="mt-5 font-display text-[clamp(3.25rem,8vw,6.8rem)] font-bold leading-[0.88] tracking-[-0.085em] text-[#f7f2eb]">ابحث.<br /><span className="text-[#e33b2f]">شغّل.</span> وابقَ في القصة.</h1>
              <p className="mt-6 max-w-lg text-sm leading-7 text-[#c5c0b8] sm:text-base">واجهة بحث ومشاهدة جديدة بالكامل؛ تصل بك من عنوانك المفضل إلى نافذة العرض من دون تشتيت.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="hero-primary-action" onClick={() => setLocation("/search")}><Search size={17} /> ابدأ البحث</Button>
                <Link href={featuredPath} className="hero-secondary-action"><Play size={16} fill="currentColor" /> {featured ? "شغّل الاختيار المميز" : "افتح المشاهدة"}</Link>
              </div>
            </div>
            <div className="hero-stage__status hidden sm:block"><span>01</span><i /><p>بحث وبث<br />بمسار واحد</p></div>
          </div>
        </section>

        <section className="relative z-10 -mt-8 rounded-t-[2rem] bg-[#10100f] pt-12 sm:-mt-12 sm:rounded-t-[3rem] sm:pt-16">
          <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-10">
            <div className="intro-ribbon">
              <div className="intro-ribbon__mark"><Sparkles size={19} /></div><p>كتالوج مباشر للفيلم والمسلسل، صُمّم ليقودك من الاكتشاف إلى المشاهدة بوضوح.</p><Link href="/search" className="intro-ribbon__link">افتح البحث <ArrowLeft size={16} /></Link>
            </div>
          </div>
          <ContentRail label="الأكثر ظهوراً" title="اختيارات تبدأ منها" items={rows.movies.slice(0, 10)} kind="movie" />
          <section className="explore-banner mx-auto mt-7 max-w-[1480px] overflow-hidden sm:mt-12"><div className="explore-banner__image" /><div className="explore-banner__content"><p className="eyebrow">مساحة الاستكشاف</p><h2>كل ليلة لها<br /><em>لقطة مختلفة.</em></h2><p>اكتب اسم العمل، اختر النوع، واترك الباقي لمسار المشاهدة.</p><Button variant="ghost" className="mt-5 h-10 gap-2 rounded-full border border-white/20 px-4 text-xs font-bold text-white hover:bg-white/10" onClick={() => setLocation("/search?type=series")}>استكشف المسلسلات <ArrowUpLeft size={15} /></Button></div></section>
          <ContentRail label="على امتداد الموسم" title="مسلسلات في الانتظار" items={rows.series.slice(0, 10)} kind="series" />
          {catalogError && <p className="mx-auto max-w-[1480px] px-5 pb-16 text-center text-xs leading-6 text-[#8f8d88] sm:px-8 lg:px-10">لم نتمكن من تحميل بطاقات الكتالوج الآن، لكن البحث والمشاهدة يظلان متاحين عند محاولة عنوان محدد.</p>}
        </section>
      </main>
    </div>
  );
}

function ContentRail({ label, title, items, kind }: { label: string; title: string; items: MediaItem[]; kind: "movie" | "series" }) {
  return (
    <section className="mx-auto max-w-[1480px] px-5 pb-10 pt-16 sm:px-8 sm:pt-20 lg:px-10">
      <div className="rail-heading mb-6"><div><p className="eyebrow">{label}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.065em] sm:text-4xl">{title}</h2></div><div className="rail-heading__route"><span>PATH {kind === "movie" ? "01" : "02"}</span><i /> <em>{kind === "movie" ? "مسار الفيلم" : "مسار المسلسل"}</em><Link href={`/search?type=${kind === "series" ? "series" : "movie"}`}>تتبّع المسار <ArrowLeft size={15} /></Link></div></div>
      {items.length > 0 ? <div className="media-rail">{items.map((item, index) => <MediaCard key={item.id} item={item} kind={kind} priority={index < 2} sequence={index + 1} />)}</div> : <div className="catalog-skeleton"><span /><span /><span /><span /><span /></div>}
    </section>
  );
}
