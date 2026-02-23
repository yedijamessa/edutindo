interface GoogleTranslateElementOptions {
  pageLanguage: string;
  includedLanguages?: string;
  autoDisplay?: boolean;
}

interface GoogleTranslateApi {
  translate: {
    TranslateElement: new (options: GoogleTranslateElementOptions, elementId: string) => unknown;
  };
}

declare global {
  interface Window {
    google?: GoogleTranslateApi;
    googleTranslateElementInit?: () => void;
  }
}

export {};
