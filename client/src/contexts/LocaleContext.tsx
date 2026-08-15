import React, { createContext, useContext, useEffect, useState } from "react";
import { type Locale, translations } from "@/lib/translations";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "rtl" | "ltr";
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function isLocale(value: string): value is Locale {
  return value === "ar" || value === "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("mw-locale");
    return stored && isLocale(stored) ? stored : "ar";
  });

  const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  function setLocale(next: Locale) {
    localStorage.setItem("mw-locale", next);
    setLocaleState(next);
  }

  function t(key: string, vars?: Record<string, string | number>) {
    let text = translations[locale][key] ?? translations.ar[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
