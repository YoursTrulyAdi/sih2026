import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n, Locale, LOCALE_LABELS } from '@/lib/i18n-context';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const locales: Locale[] = ['en', 'kn', 'hi'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Select Language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-700 dark:border-gray-800 bg-gray-900/80 hover:bg-gray-800/80 text-gray-200 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold">{LOCALE_LABELS[locale].nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-gray-900 border border-gray-700 dark:border-gray-800 shadow-2xl z-50 py-1 divide-y divide-gray-800 overflow-hidden animate-in fade-in zoom-in-95">
          {locales.map((loc) => {
            const isSelected = locale === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-emerald-950/60 text-emerald-400 font-bold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{LOCALE_LABELS[loc].nativeName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
