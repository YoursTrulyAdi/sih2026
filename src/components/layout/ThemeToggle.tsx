import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-gray-900/80 dark:bg-gray-900/80 border-gray-700 dark:border-gray-800 text-amber-400 dark:text-gray-300 hover:text-amber-300 dark:hover:text-white hover:border-gray-600 shadow-sm"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
