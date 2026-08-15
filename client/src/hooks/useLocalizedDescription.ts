import { useEffect, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { translateText } from "@/lib/stremio";

export function useLocalizedDescription(text?: string) {
  const { locale } = useLocale();
  const [value, setValue] = useState(text || "");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const source = text || "";
    setValue(source);
    if (!source || locale !== "ar") {
      setTranslating(false);
      return () => { cancelled = true; };
    }

    setTranslating(true);
    translateText(source, "ar").then((translated) => {
      if (!cancelled) setValue(translated || source);
    }).catch(() => {
      if (!cancelled) setValue(source);
    }).finally(() => {
      if (!cancelled) setTranslating(false);
    });

    return () => { cancelled = true; };
  }, [text, locale]);

  return { value, translating };
}
