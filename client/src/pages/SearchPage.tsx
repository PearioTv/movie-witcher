/**
 * DESIGN: أطلس السيلولويد — البحث شريط أوامر مضيء فوق قاعة عرض داكنة، والنتائج ذات أولوية بصرية للملصق ثم القرار.
 */
import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLocation } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { type MediaItem, type MediaKind, searchCatalog } from "@/lib/stremio";

export default function SearchPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const [kind, setKind] = useState<MediaKind>(params.get("type") === "series" ? "series" : "movie");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setItems([]);
        setMessage("");
        setLoading(false);
        return;
      }
      setLoading(true);
      setMessage("");
      try {
        const data = await searchCatalog(kind, query);
        if (active) {
          setItems(data);
          if (!data.length) setMessage("لم نجد عملاً مطابقاً. جرّب عنواناً آخر أو جزءاً من الاسم.");
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "تعذر تنفيذ البحث الآن.");
      } finally {
        if (active) setLoading(false);
      }
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, kind]);

  return (
    <div className="min-h-screen bg-[#10100f] text-[#f4f0e9]" dir="rtl">
      <SiteHeader />
      <main className="search-page">
        <div className="search-page__image" aria-hidden="true" />
        <section className="relative z-10 mx-auto max-w-[1480px] px-5 pb-12 pt-14 sm:px-8 sm:pt-18 lg:px-10 lg:pt-24">
          <p className="eyebrow">دليل المشاهدة</p>
          <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold tracking-[-0.07em] text-[#f6f0e8] sm:text-6xl">ابحث عن قصتك التالية.</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#b1afa9] sm:text-base">اكتب اسم فيلم أو مسلسل، ثم انتقل مباشرةً إلى تفاصيله ومشاهدته.</p>
            </div>
            <p className="max-w-xs border-r border-[#e33b2f] pr-4 text-xs leading-6 text-[#a5a29d]">تتصل النتائج بكتالوج المحتوى نفسه الذي يعتمد عليه مشروعك الحالي.</p>
          </div>
          <div className="search-command mt-9">
            <Search size={21} className="shrink-0 text-[#e33b2f]" />
            <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: Parasite, Reacher, Fight Club…" aria-label="ابحث عن فيلم أو مسلسل" />
            {query && <button type="button" className="text-[#a9a7a2] hover:text-white" onClick={() => setQuery("")} aria-label="مسح البحث"><X size={18} /></button>}
            <span className="hidden border-r border-white/10 pr-4 text-[0.67rem] font-bold tracking-[0.14em] text-[#77756f] sm:inline">⌘ K</span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="segment-control">
              <button type="button" onClick={() => setKind("movie")} className={kind === "movie" ? "segment-control__item segment-control__item--active" : "segment-control__item"}>أفلام</button>
              <button type="button" onClick={() => setKind("series")} className={kind === "series" ? "segment-control__item segment-control__item--active" : "segment-control__item"}>مسلسلات</button>
            </div>
            <Button variant="ghost" className="hidden h-9 gap-2 rounded-full border border-white/10 px-3 text-xs text-[#b6b3ae] hover:bg-white/5 sm:inline-flex"><SlidersHorizontal size={15} /> تصفية النتائج</Button>
          </div>
        </section>
        <section className="relative z-10 mx-auto max-w-[1480px] px-5 pb-24 sm:px-8 lg:px-10">
          {loading && <div className="flex min-h-56 items-center justify-center text-sm text-[#b8b4ac]"><span className="loading-orbit ml-3" /> نبحث في الكتالوج…</div>}
          {!loading && !query && (
            <div className="search-empty">
              <span className="search-empty__reel"><span /><Search size={20} className="relative z-10 text-[#f7efe7]" /><span /></span>
              <div><p className="search-empty__index">FRAME / 01 — INPUT</p><h2>اضبط وجهتك.</h2><p>اكتب عنواناً تعرفه؛ سنفتح لك مسار الفيلم أو المسلسل فوراً.</p><span className="search-empty__tag">FILM / SERIES / DIRECT</span></div>
            </div>
          )}
          {!loading && message && <div className="search-empty"><span className="search-empty__reel"><span /><Search size={20} className="relative z-10 text-[#f7efe7]" /><span /></span><div><p className="search-empty__index">FRAME / LOST SIGNAL</p><h2>لم نعثر على لقطة مطابقة.</h2><p>{message}</p><span className="search-empty__tag">جرّب عنواناً أقصر</span></div></div>}
          {!loading && items.length > 0 && (
            <>
              <div className="mb-6 flex items-end justify-between"><div><p className="eyebrow">نتائج البحث</p><h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.06em]">{items.length} أعمال متاحة</h2></div><p className="text-xs text-[#999791]">{kind === "movie" ? "أفلام" : "مسلسلات"}</p></div>
              <div className="media-grid">{items.map((item, index) => <MediaCard key={item.id} item={item} kind={kind} priority={index < 4} />)}</div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
