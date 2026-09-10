import React, { createContext, useContext, useEffect, useState } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';

export type Locale = 'en' | 'hi' | 'kn';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, defaultText?: string) => string;
}

const translations: Record<Locale, any> = {
  en,
  hi,
  kn,
};

export const LOCALE_LABELS: Record<Locale, { label: string; nativeName: string }> = {
  en: { label: 'English', nativeName: 'English' },
  hi: { label: 'Hindi', nativeName: 'हिन्दी' },
  kn: { label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
};

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (path: string, defaultText?: string) => defaultText || path,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('infratrack-locale') as Locale | null;
      if (stored && (stored === 'en' || stored === 'hi' || stored === 'kn')) {
        setLocaleState(stored);
      }
    } catch {}
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('infratrack-locale', newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  };

  const t = (path: string, defaultText?: string): string => {
    const keys = path.split('.');
    let current: any = translations[locale];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if translation is missing in current locale
        let fallbackCurrent: any = translations['en'];
        for (const fbKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fbKey];
          } else {
            return defaultText || path;
          }
        }
        return typeof fallbackCurrent === 'string' ? fallbackCurrent : defaultText || path;
      }
    }

    return typeof current === 'string' ? current : defaultText || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
