import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '@/lib/auth-client';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'SUPERVISOR' | 'VIEWER')[];
}

export interface OfficerProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'VIEWER';
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t } = useI18n();
  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // 1. If auth check is complete and no session exists, redirect immediately to /login
    if (!isPending && !session?.user) {
      router.replace('/login');
      return;
    }

    // 2. If session exists, fetch full officer profile from backend (/api/me) to verify live role
    if (!isPending && session?.user) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      fetch(`${apiBase}/api/me`, { credentials: 'include' })
        .then(async (res) => {
          if (res.status === 401) {
            // Session expired
            router.replace('/login');
            return;
          }
          if (res.ok) {
            const data = await res.json();
            const officerRole = data.user?.role || 'SUPERVISOR';
            const userProfile: OfficerProfile = {
              id: data.user.id,
              name: data.user.name || session.user.name || session.user.email,
              email: data.user.email,
              role: officerRole,
            };
            setProfile(userProfile);

            if (allowedRoles && !allowedRoles.includes(officerRole)) {
              setAccessDenied(true);
            } else {
              setAccessDenied(false);
            }
          } else {
            // Fallback to session user with default supervisor role
            setProfile({
              id: session.user.id,
              name: session.user.name || session.user.email,
              email: session.user.email,
              role: 'SUPERVISOR',
            });
          }
        })
        .catch(() => {
          setProfile({
            id: session.user.id,
            name: session.user.name || session.user.email,
            email: session.user.email,
            role: 'SUPERVISOR',
          });
        })
        .finally(() => {
          setCheckingRole(false);
        });
    }
  }, [isPending, session, router, allowedRoles]);

  // If session is pending or role check is in flight, display secure gate loader
  // NEVER render protected children during this stage (prevent flash)
  if (isPending || (!session?.user && typeof window !== 'undefined') || checkingRole) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-6 shadow-2xl shadow-emerald-950/80 animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2.5 text-emerald-400 font-mono text-sm font-semibold tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('common.loading', 'Verifying Officer Security Credentials...')}</span>
        </div>
        <p className="text-gray-500 font-mono text-xs mt-2">InfraTrack AI • RBAC Enforcement Gate</p>
      </div>
    );
  }

  // If role is insufficient for this route
  if (accessDenied) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">403 Forbidden: Insufficient Permissions</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Your current role (<strong className="text-emerald-400 font-mono">{profile?.role}</strong>) does not have clearance to access this resource. Please contact your National Infrastructure System Administrator.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold border border-gray-700"
          >
            Return to Authorized Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
