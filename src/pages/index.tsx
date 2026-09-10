import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from '@/lib/auth-client';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function IndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t } = useI18n();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        router.replace('/admin');
      } else {
        router.replace('/login');
      }
    }
  }, [session, isPending, router]);

  return (
    <>
      <Head>
        <title>InfraTrack 2026 • Security Verification Gate</title>
      </Head>
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-2xl animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-mono text-sm font-semibold tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('common.loading', 'Verifying Officer Security Credentials...')}</span>
        </div>
        <p className="text-slate-400 dark:text-gray-500 font-mono text-xs mt-2">
          InfraTrack AI • National Infrastructure Monitoring Portal
        </p>
      </div>
    </>
  );
}
