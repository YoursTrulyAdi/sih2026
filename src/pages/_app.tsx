import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';
import ScrollLinkedBackgroundWrapper from '@/components/3d/ScrollLinkedBackgroundWrapper';
import { ThemeProvider } from '@/lib/theme-context';
import { I18nProvider } from '@/lib/i18n-context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Head>
          <title>InfraTrack 2026 - National Infrastructure Monitoring System</title>
          <meta name="description" content="Real-time multi-modal project monitoring for national infrastructure projects (SIH 2026)" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-50 flex flex-col selection:bg-emerald-500 selection:text-gray-950 relative transition-colors duration-200">
          {/* Fixed Scroll-Driven 3D Parallax Depth Canvas */}
          <ScrollLinkedBackgroundWrapper />

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Component {...pageProps} />
            </main>
            <footer className="border-t border-slate-200 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md py-8 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-gray-500">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-700 dark:text-gray-400 font-semibold font-mono">InfraTrack AI</span>
                  <span>— Smart India Hackathon 2026 Solution</span>
                </div>
                <p className="text-slate-400 dark:text-gray-500 font-mono text-[11px]">
                  Better Auth • Next.js • Three.js R3F • PostgreSQL
                </p>
              </div>
            </footer>
          </div>
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
