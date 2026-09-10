import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layers } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import { useSession } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t } = useI18n();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace('/admin');
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-white flex flex-col justify-between relative overflow-hidden transition-colors">
      <Head>
        <title>Sign In • SIH 2026 InfraTrack</title>
        <meta name="description" content="Sign in or register for the National Infrastructure Monitoring Command Portal" />
      </Head>

      {/* Cyber Grid background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.15), transparent 60%),
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Infra<span className="text-emerald-500 dark:text-emerald-400">Track</span>
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-700/50">
                SIH 2026
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <AuthCard />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 dark:text-gray-600 border-t border-slate-200 dark:border-gray-900">
        <p>Ministry of Infrastructure & National Planning • Smart India Hackathon 2026</p>
      </footer>
    </div>
  );
}
