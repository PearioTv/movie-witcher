import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2, LoaderCircle, Menu, Search, Settings2, Sparkles, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocale } from "@/contexts/LocaleContext";
import { detailPath, imageUrl, searchCatalog, type MediaItem, type MediaKind } from "@/lib/stremio";
import { locales, type Locale } from "@/lib/translations";

export default function SiteHeader() {
  const [location, setLocation] = useLocation();
  const { locale, setLocale, dir, t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem("mw-username") || "");
  const [draftLocale, setDraftLocale] = useState<Locale>(locale);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind>("movie");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.movies"), href: "/discover/movies" },
    { label: t("nav.series"), href: "/discover/series" },
    { label: t("nav.history"), href: "/history" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setDraftLocale(locale), [locale, settingsOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        setSearchError("");
        setSearching(false);
        return;
      }
      setSearching(true);
      setSearchError("");
      try {
        const data = await searchCatalog(kind, trimmed);
        if (active) setResults(data.slice(0, 6));
      } catch (error) {
        if (active) setSearchError(error instanceof Error ? error.message : t("search.failed"));
      } finally {
        if (active) setSearching(false);
      }
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, kind, t]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function persistSettings() {
    localStorage.setItem("mw-username", username.trim());
    setLocale(draftLocale);
    setSettingsOpen(false);
  }

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  return (
    <header className={`site-header ${scrolled || location !== "/" ? "site-header--solid" : ""}`}>
      <div className="mx-auto flex h-[4.85rem] max-w-[1480px] items-center gap-5 px-5 sm:px-8 lg:px-10">
        <BrandMark />
        <nav className="hidden min-w-0 items-center gap-1 md:flex" aria-label={t("nav.home")}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-link ${location === item.href ? "nav-link--active" : ""}`}>{item.label}</Link>
          ))}
          <div className="relative">
            <button type="button" className="nav-link inline-flex items-center gap-1" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
              {t("nav.discover")} <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div className="header-discover-menu" dir={dir}>
                <button type="button" className="discovery-menu-item" onClick={() => { setLocation("/discover/movies"); setMenuOpen(false); }}>{t("nav.movies")}</button>
                <button type="button" className="discovery-menu-item" onClick={() => { setLocation("/discover/series"); setMenuOpen(false); }}>{t("nav.series")}</button>
              </div>
            )}
          </div>
        </nav>

        <div className="header-search-wrap">
          <button type="button" className={`header-search-trigger ${searchOpen ? "header-search-trigger--active" : ""}`} onClick={openSearch} aria-expanded={searchOpen} aria-label={t("nav.openSearch")}>
            <Search size={17} />
            <span>{t("search.placeholder")}</span>
            <kbd>⌘ K</kbd>
          </button>
          {searchOpen && (
            <div className="header-search-panel" dir={dir}>
              <div className="header-search-panel__input">
                <Search size={18} className="text-[#e33b2f]" />
                <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search.placeholder")} aria-label={t("search.title")} />
                {query && <button type="button" onClick={() => setQuery("")} aria-label={t("search.clear")}><X size={17} /></button>}
                <button type="button" onClick={() => setSearchOpen(false)} aria-label={t("search.clear")}><X size={17} /></button>
              </div>
              <div className="header-search-panel__filters" role="tablist" aria-label={t("search.filter")}>
                <button type="button" role="tab" aria-selected={kind === "movie"} className={kind === "movie" ? "header-search-filter header-search-filter--active" : "header-search-filter"} onClick={() => setKind("movie")}>{t("search.movies")}</button>
                <button type="button" role="tab" aria-selected={kind === "series"} className={kind === "series" ? "header-search-filter header-search-filter--active" : "header-search-filter"} onClick={() => setKind("series")}>{t("search.series")}</button>
                <span className="header-search-advanced">{t("search.filter")}</span>
              </div>
              {searching && <div className="header-search-status"><LoaderCircle size={16} className="animate-spin" /> {t("search.loading")}</div>}
              {!searching && searchError && <div className="header-search-status header-search-status--error">{searchError}</div>}
              {!searching && !searchError && query.trim() && results.length === 0 && <div className="header-search-status">{t("search.noMatch")}</div>}
              {!searching && results.length > 0 && (
                <div className="header-search-results">
                  {results.map((item) => {
                    const itemKind = item.type === "series" ? "series" : kind;
                    return <Link key={`${itemKind}-${item.id}`} href={detailPath(item, itemKind)} onClick={() => setSearchOpen(false)} className="header-search-result">
                      {imageUrl(item.poster) ? <img src={imageUrl(item.poster)} alt="" /> : <span className="header-search-result__fallback">MW</span>}
                      <span><strong>{item.name}</strong><small>{item.year || item.releaseInfo || "—"} <i /> {itemKind === "series" ? t("search.series") : t("search.movies")}</small></span>
                    </Link>;
                  })}
                </div>
              )}
              {!query.trim() && <p className="header-search-hint">{t("search.emptyDesc")}</p>}
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <a href="https://t.me/MWitcherr" target="_blank" rel="noreferrer" className="header-telegram hidden sm:inline-flex"><Sparkles size={15} className="text-[#e33b2f]" /> {t("nav.telegram")}</a>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild><Button variant="ghost" size="icon" className="header-icon-button" aria-label={t("nav.settings")}><Settings2 size={18} /></Button></DialogTrigger>
            <DialogContent className="max-w-md border-white/10 bg-[#171714] p-0 text-[#f4f0e9] shadow-2xl">
              <DialogHeader className={dir === "rtl" ? "border-b border-white/10 px-6 py-5 text-right" : "border-b border-white/10 px-6 py-5 text-left"}><DialogTitle className="font-display text-xl tracking-[-0.045em]">{t("settings.title")}</DialogTitle><DialogDescription className={dir === "rtl" ? "pt-1 text-right text-[#9d9b96]" : "pt-1 text-left text-[#9d9b96]"}>{t("settings.desc")}</DialogDescription></DialogHeader>
              <div className="space-y-5 px-6 py-6" dir={dir}><label className="block space-y-2"><span className="flex items-center gap-2 text-sm font-semibold"><Globe2 size={15} className="text-[#e33b2f]" /> {t("settings.language")}</span><select value={draftLocale} onChange={(event) => setDraftLocale(event.target.value as Locale)} className="settings-control">{locales.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="block space-y-2"><span className="text-sm font-semibold">{t("settings.username")}</span><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t("settings.usernamePlaceholder")} className="settings-control" /></label><Button className="h-11 w-full rounded-xl bg-[#e33b2f] font-bold text-white hover:bg-[#f04b3f]" onClick={persistSettings}>{t("settings.save")}</Button></div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="header-icon-button md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label={t("nav.openMenu")}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</Button>
        </div>
      </div>
      {menuOpen && <div className="border-t border-white/10 bg-[#121210]/98 px-5 py-3 backdrop-blur-xl md:hidden"><div className="flex gap-2" dir={dir}>{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="mobile-nav-link">{item.label}</Link>)}<button type="button" onClick={openSearch} className="mobile-nav-link">{t("nav.search")}</button></div></div>}
    </header>
  );
}
