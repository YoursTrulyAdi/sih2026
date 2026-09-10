import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Building2, 
  BarChart3, 
  ShieldAlert, 
  PlusCircle, 
  Menu, 
  X, 
  Layers, 
  User, 
  LogOut, 
  LogIn,
  Shield
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const { t } = useI18n();
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUPERVISOR' | 'VIEWER' | null>(null);

  useEffect(() => {
    if (session?.user) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      fetch(`${apiBase}/api/me`, { credentials: 'include' })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.user?.role) {
              setUserRole(data.user.role);
            }
          }
        })
        .catch(() => {
          setUserRole('SUPERVISOR');
        });
    } else {
      setUserRole(null);
    }
  }, [session]);

  const navLinks = [
    { label: t('nav.home', 'Home'), href: '/', icon: Building2, showAlways: false, requireAuth: true },
    { label: t('nav.adminDashboard', 'Dashboard'), href: '/admin', icon: ShieldAlert, showAlways: false, requireAuth: true },
    { label: t('nav.publicPortal', 'Public Portal'), href: '/projects', icon: BarChart3, showAlways: false, requireAuth: true },
    { 
      label: t('nav.createProject', 'Create Project'), 
      href: '/admin/new', 
      icon: PlusCircle, 
      showAlways: false, 
      requireAuth: true,
      adminOnly: true 
    },
  ];

  const visibleLinks = navLinks.filter((link) => {
    if (link.requireAuth && !session?.user) return false;
    if (link.adminOnly && userRole !== 'ADMIN') return false;
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getRoleBadge = (role: 'ADMIN' | 'SUPERVISOR' | 'VIEWER' | null) => {
    if (role === 'ADMIN') {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-400 border border-rose-800">
          Admin
        </span>
      );
    }
    if (role === 'SUPERVISOR') {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-400 border border-blue-800">
          Supervisor
        </span>
      );
    }
    if (role === 'VIEWER') {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-400 border border-amber-800">
          Viewer
        </span>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0A0D14]/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href={session?.user ? "/admin" : "/login"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-gray-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  Infra<span className="text-emerald-500 dark:text-emerald-400">Track</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/50">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-medium tracking-wide leading-none">
                {t('nav.brandSubtitle', 'National Digital Twin & SCADA')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {session?.user && (
            <nav className="hidden md:flex items-center space-x-1">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-150 ${
                      active
                        ? 'bg-slate-200 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-gray-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Session / Theming / Auth Controls */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle />

            {session?.user && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-gray-900/80 border border-emerald-500/20 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                  {t('nav.telemetryActive', 'LIVE')}
                </span>
              </div>
            )}

            {isPending ? (
              <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-gray-800 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-gray-800">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    {session.user.name?.charAt(0).toUpperCase() || <User className="w-3 h-3" />}
                  </div>
                  <span className="text-slate-800 dark:text-gray-200 font-medium max-w-[110px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                  {getRoleBadge(userRole)}
                </div>
                <button
                  onClick={handleSignOut}
                  title={t('nav.signOut', 'Sign Out')}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-gray-900 hover:bg-rose-100 dark:hover:bg-red-950/40 text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-red-400 border border-slate-200 dark:border-gray-800 hover:border-rose-300 dark:hover:border-red-900/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav.officerLogin', 'Officer Login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button & quick toggles */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-gray-800 bg-white/95 dark:bg-[#0A0D14]/95 px-4 pt-2 pb-4 space-y-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-slate-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-200 dark:border-gray-800">
            {session?.user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-red-950/30 text-rose-600 dark:text-red-400 text-sm border border-rose-200 dark:border-red-800/40"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.signOut', 'Sign Out')} ({session.user.name})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-gray-950 font-semibold text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.officerLogin', 'Officer Login')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
