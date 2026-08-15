/**
 * DESIGN: أطلس السيلولويد — شريط علوي خفيف شفاف يتحول إلى سطح فحمي مقروء عند التمرير.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Globe2, Menu, Search, Settings2, Sparkles, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "البحث", href: "/search" },
];

export default function SiteHeader() {
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem("mw-username") || "");
  const [locale, setLocale] = useState(() => localStorage.getItem("mw-locale") || "ar");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function persistSettings() {
    localStorage.setItem("mw-username", username.trim());
    localStorage.setItem("mw-locale", locale);
    document.documentElement.lang = locale;
    setOpen(false);
  }

  return (
    <header className={`site-header ${scrolled || location !== "/" ? "site-header--solid" : ""}`}>
      <div className="mx-auto flex h-[4.85rem] max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <BrandMark />

        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-link ${location === item.href ? "nav-link--active" : ""}`}>{item.label}</Link>
          ))}
          <button type="button" className="nav-link inline-flex items-center gap-1" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
            اكتشف <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div className="absolute top-[4.25rem] mr-[12.6rem] w-48 rounded-2xl border border-white/10 bg-[#171714]/95 p-2 shadow-2xl backdrop-blur-xl">
              <button className="discovery-menu-item" onClick={() => { setLocation("/search"); setMenuOpen(false); }}>الأفلام</button>
              <button className="discovery-menu-item" onClick={() => { setLocation("/search?type=series"); setMenuOpen(false); }}>المسلسلات</button>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="header-icon-button" onClick={() => setLocation("/search")} aria-label="فتح البحث"><Search size={19} /></Button>
          <a href="https://t.me/MWitcherr" target="_blank" rel="noreferrer" className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 text-[0.72rem] font-bold tracking-[0.06em] text-[#efede8] transition hover:border-white/20 hover:bg-white/10 sm:inline-flex">
            <Sparkles size={15} className="text-[#e33b2f]" /> تيليغرام
          </a>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="header-icon-button" aria-label="الإعدادات"><Settings2 size={18} /></Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-white/10 bg-[#171714] p-0 text-[#f4f0e9] shadow-2xl">
              <DialogHeader className="border-b border-white/10 px-6 py-5 text-right">
                <DialogTitle className="font-display text-xl tracking-[-0.045em]">إعدادات المشاهدة</DialogTitle>
                <DialogDescription className="pt-1 text-right text-[#9d9b96]">تُحفظ هذه الخيارات على جهازك فقط.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-6 py-6" dir="rtl">
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-semibold"><Globe2 size={15} className="text-[#e33b2f]" /> لغة الواجهة</span>
                  <select value={locale} onChange={(event) => setLocale(event.target.value)} className="settings-control">
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold">اسمك في الغرفة</span>
                  <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="اسم اختياري" className="settings-control" />
                </label>
                <Button className="h-11 w-full rounded-xl bg-[#e33b2f] font-bold text-white hover:bg-[#f04b3f]" onClick={persistSettings}>حفظ التغييرات</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="header-icon-button md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="فتح القائمة">{menuOpen ? <X size={19} /> : <Menu size={19} />}</Button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#121210]/98 px-5 py-3 backdrop-blur-xl md:hidden">
          <div className="flex gap-2" dir="rtl">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="mobile-nav-link">{item.label}</Link>)}
            <Link href="/search?type=series" onClick={() => setMenuOpen(false)} className="mobile-nav-link">مسلسلات</Link>
          </div>
        </div>
      )}
    </header>
  );
}
