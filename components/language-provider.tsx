"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

export type SiteLanguage = "en" | "id";

type LanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
};

const LANGUAGE_STORAGE_KEY = "edutindo_language";
const GOOGLE_TRANSLATE_CONTAINER_ID = "google_translate_element";
const DEFAULT_LANGUAGE: SiteLanguage = "en";

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

const isSiteLanguage = (value: string | null): value is SiteLanguage => value === "en" || value === "id";

const setGoogTransCookie = (language: SiteLanguage) => {
  const value = `/en/${language}`;
  document.cookie = `googtrans=${value};path=/`;
  document.cookie = `googtrans=${value};domain=${window.location.hostname};path=/`;
};

const applyLanguageToPage = (language: SiteLanguage) => {
  setGoogTransCookie(language);
  document.documentElement.lang = language;

  const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!combo) return;

  // Google renders a select control internally; drive it directly to update translated content.
  const requestedValue = language === "id" ? "id" : "en";
  const hasRequestedValue = Array.from(combo.options).some((option) => option.value === requestedValue);

  if (hasRequestedValue) {
    combo.value = requestedValue;
    combo.dispatchEvent(new Event("change"));
    return;
  }

  if (language === "en") {
    combo.selectedIndex = 0;
    combo.dispatchEvent(new Event("change"));
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguageState] = React.useState<SiteLanguage>(DEFAULT_LANGUAGE);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [isTranslatorReady, setIsTranslatorReady] = React.useState(false);

  React.useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLanguage = navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
    const initialLanguage = isSiteLanguage(storedLanguage) ? storedLanguage : browserLanguage;

    setLanguageState(initialLanguage);
    applyLanguageToPage(initialLanguage);
    setHasInitialized(true);
  }, []);

  React.useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      // Keep the supported list intentionally small for predictable translations.
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,id",
          autoDisplay: false,
        },
        GOOGLE_TRANSLATE_CONTAINER_ID
      );

      setIsTranslatorReady(true);
    };

    return () => {
      window.googleTranslateElementInit = undefined;
    };
  }, []);

  React.useEffect(() => {
    if (!hasInitialized) return;
    applyLanguageToPage(language);
  }, [language, hasInitialized, isTranslatorReady, pathname]);

  const setLanguage = React.useCallback((nextLanguage: SiteLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
      <div id={GOOGLE_TRANSLATE_CONTAINER_ID} className="sr-only" />
      <Script
        id="google-translate-script"
        strategy="afterInteractive"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
