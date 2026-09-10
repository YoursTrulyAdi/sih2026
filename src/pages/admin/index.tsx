import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Layers, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Calendar,
  RefreshCw,
  FolderOpen,
  UserCheck,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { Project, ProjectStatus } from '@/types/project';
import { getStatusBadge } from '@/components/public/ProjectCard';
import { useSession } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminDashboardPage() {
  return (
    <AuthGuard>
      <AdminDashboardContent />
    </AuthGuard>
  );
}

interface DashboardStats {
  totalProjects: number;
  onTrackCount: number;
  delayedCount: number;
  completedCount: number;
  totalBudgetCr: number;
  avgProgress: number;
  recentUpdates?: any[];
}

function AdminDashboardContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();

  const [officerRole, setOfficerRole] = useState<'ADMIN' | 'SUPERVISOR' | 'VIEWER'>('SUPERVISOR');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    onTrackCount: 0,
    delayedCount: 0,
    completedCount: 0,
    totalBudgetCr: 0,
    avgProgress: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // 1. Fetch live DB data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Check session status & officer profile
      const meRes = await fetch(`${apiBase}/api/me`, { credentials: 'include' });
      if (meRes.status === 401) {
        router.replace('/login');
        return;
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.role) {
          setOfficerRole(meData.user.role);
        }
      }

      // Fetch live aggregated stats from PostgreSQL
      const statsRes = await fetch(`${apiBase}/api/dashboard/stats`, { credentials: 'include' });
      if (statsRes.status === 401) {
        router.replace('/login');
        return;
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch live projects from PostgreSQL (scoped by role on backend)
      const projRes = await fetch(`${apiBase}/api/projects`, { credentials: 'include' });
      if (projRes.status === 401) {
        router.replace('/login');
        return;
      }
      if (projRes.ok) {
        const projData = await projRes.json();
        const liveProjects: Project[] = (projData.projects || []).map((bp: any) => ({
          id: bp.id,
          name: bp.name,
          code: bp.code,
          wbsCode: bp.wbsCode,
          department: bp.department,
          category: bp.category,
          location: bp.location,
          description: bp.description,
          baselineStartDate: typeof bp.baselineStartDate === 'string' ? bp.baselineStartDate.slice(0, 10) : '',
          baselineEndDate: typeof bp.baselineEndDate === 'string' ? bp.baselineEndDate.slice(0, 10) : '',
          currentProgress: bp.currentProgress || 0,
          plannedProgress: bp.plannedProgress || 0,
          status: bp.status,
          budget: bp.budget,
          spent: bp.spent,
          supervisor: bp.supervisor,
          contractor: bp.contractor,
          timelineData: (bp.timelinePoints || []).map((tp: any) => ({
            period: tp.period,
            actual: tp.actual,
            planned: tp.planned,
          })),
          recentUpdates: (bp.recentUpdates || []).map((up: any) => ({
            id: up.id,
            channel: up.channel,
            notes: up.notes,
            progressDelta: up.progressDelta,
            author: up.author,
            role: up.role,
            timestamp: new Date(up.createdAt).toLocaleDateString(),
            tags: up.tags || [],
          })),
        }));
        setProjects(liveProjects);
      } else {
        throw new Error('Failed to load project telemetry from database');
      }
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Error connecting to infrastructure database');
    } finally {
      setLoading(false);
    }
  }, [apiBase, router]);

  useEffect(() => {
    fetchData();

    if (router.query.created) {
      setToastMessage(`Project ${router.query.created} initialized successfully in PostgreSQL baseline.`);
      const timer = setTimeout(() => setToastMessage(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [fetchData, router.query]);

  // Role Switcher for instant verification and demonstration of RBAC
  const handleRoleChange = async (newRole: 'ADMIN' | 'SUPERVISOR' | 'VIEWER') => {
    setSwitchingRole(true);
    try {
      const res = await fetch(`${apiBase}/api/me/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setOfficerRole(newRole);
        setToastMessage(`Officer role updated to ${newRole}. View permissions re-scoped.`);
        setTimeout(() => setToastMessage(''), 5000);
        await fetchData();
      }
    } catch {
      setToastMessage('Failed to update officer role.');
    } finally {
      setSwitchingRole(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.wbsCode.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>{t('dashboard.title', 'National Infrastructure Command Center')} | InfraTrack</title>
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Top Header & Role-Aware Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t('dashboard.title', 'National Infrastructure Command Center')}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              {t('dashboard.subtitle', 'Real-time project telemetry, capital expenditure monitoring, and multi-modal progress verification.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={fetchData}
              disabled={loading}
              title="Sync Live Database"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            {/* CTA: Create New Project (ADMIN ONLY) */}
            {officerRole === 'ADMIN' && (
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4 text-gray-950" />
                <span>{t('dashboard.createProjectBtn', 'Create New Project')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="text-emerald-600 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Fetch Error Banner */}
        {fetchError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchData}
              className="underline font-semibold ml-4 hover:text-rose-950 dark:hover:text-white"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        )}

        {/* Officer Auth & Role Scope Banner */}
        <div className="p-4 rounded-2xl border bg-white dark:bg-gray-900/90 border-slate-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-gray-400">
                {t('dashboard.authNotice', 'Authenticated as')}{' '}
              </span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">
                {session?.user?.name || session?.user?.email}
              </strong>
              <span className="mx-2 text-slate-300 dark:text-gray-600">•</span>
              <span className="inline-flex items-center gap-1 font-semibold uppercase px-2 py-0.5 rounded text-[10px] tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <UserCheck className="w-3 h-3" />
                {officerRole}
              </span>
            </div>
          </div>

          {/* Interactive Role Switcher for verification */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Role:</span>
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800">
              {(['ADMIN', 'SUPERVISOR', 'VIEWER'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={switchingRole}
                  onClick={() => handleRoleChange(r)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    officerRole === r
                      ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role Scoping Explanation Alert */}
        {officerRole === 'SUPERVISOR' && (
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{t('dashboard.supervisorScopeNotice', 'Supervisor Scope: Displaying projects assigned to your sector. You can commit daily multimodal progress updates.')}</span>
          </div>
        )}
        {officerRole === 'VIEWER' && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{t('dashboard.viewerScopeNotice', 'Read-Only View: Field modifications and project baseline creation are restricted for Viewer role.')}</span>
          </div>
        )}

        {/* Quick Stats Cards (From PostgreSQL Aggregations) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-md transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
              {t('dashboard.totalPortfolio', 'Total Portfolio')}
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.totalProjects}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              {t('dashboard.managedAssets', 'Managed capital assets')}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-md transition-colors">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('dashboard.onSchedule', 'On Schedule')}
            </span>
            <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.onTrackCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              {t('dashboard.zeroVariance', 'Zero schedule variance')}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-md transition-colors">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('dashboard.delayed', 'Delayed / At Risk')}
            </span>
            <div className="text-2xl font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {stats.delayedCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              {t('dashboard.needsIntervention', 'Requires intervention')}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-md transition-colors">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('dashboard.completed', 'Completed')}
            </span>
            <div className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {stats.completedCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              {t('dashboard.handedOver', 'Commissioned & handed over')}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm transition-colors">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder', 'Search projects or WBS code...')}
              className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-slate-200 dark:bg-gray-700 text-slate-900 dark:text-white font-bold shadow-sm'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800'
                }`}
              >
                {st === 'ALL'
                  ? t('dashboard.filterAll', 'All')
                  : st === 'ON_TRACK'
                  ? t('dashboard.filterOnTrack', 'On Track')
                  : st === 'AT_RISK'
                  ? t('dashboard.filterAtRisk', 'At Risk')
                  : st === 'DELAYED'
                  ? t('dashboard.filterDelayed', 'Delayed')
                  : t('dashboard.filterCompleted', 'Completed')}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Table (Backed 100% by Real PostgreSQL Data) */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-gray-900/80 text-slate-600 dark:text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">{t('dashboard.colDetails', 'Project & WBS Details')}</th>
                  <th className="px-6 py-4">{t('dashboard.colMinistry', 'Ministry / Sector')}</th>
                  <th className="px-6 py-4">{t('dashboard.colTimeline', 'Baseline Timeline')}</th>
                  <th className="px-6 py-4">{t('dashboard.colProgress', 'Progress (% Actual / Target)')}</th>
                  <th className="px-6 py-4">{t('dashboard.colStatus', 'Status')}</th>
                  <th className="px-6 py-4 text-right">{t('dashboard.colActions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <span className="font-mono text-xs">{t('common.loading', 'Loading Live Database Telemetry...')}</span>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  // REAL EMPTY STATE: No items in DB
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-gray-500">
                        <FolderOpen className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">
                        {t('dashboard.emptyStateTitle', 'No Infrastructure Projects Found')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto mt-1">
                        {t('dashboard.emptyStateDesc', 'There are no live projects registered in the central database. Initialize a project baseline to begin monitoring.')}
                      </p>
                      {officerRole === 'ADMIN' && (
                        <div className="mt-4">
                          <Link
                            href="/admin/new"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-md"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>{t('dashboard.emptyStateAction', 'Create Initial Project Baseline')}</span>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((proj) => {
                    const statusInfo = getStatusBadge(proj.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr
                        key={proj.id}
                        className="hover:bg-slate-50 dark:hover:bg-gray-750/50 transition-colors group"
                      >
                        {/* Project Name & WBS */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {proj.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-gray-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-gray-700">
                              {proj.wbsCode}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-gray-400">{proj.code}</span>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4">
                          <div className="text-slate-800 dark:text-gray-200 font-medium">{proj.category}</div>
                          <div className="text-[11px] text-slate-500 dark:text-gray-400 truncate max-w-[200px]">
                            {proj.department}
                          </div>
                        </td>

                        {/* Timeline */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300 font-mono text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                            <span>{proj.baselineStartDate}</span>
                            <span className="text-slate-400 dark:text-gray-500">&rarr;</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{proj.baselineEndDate}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
                            {t('common.budget', 'Budget')}: <span className="text-slate-700 dark:text-gray-300 font-mono font-semibold">{proj.budget}</span>
                          </div>
                        </td>

                        {/* Progress bar */}
                        <td className="px-6 py-4 min-w-[180px]">
                          <div className="flex items-center justify-between mb-1 text-[11px]">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{proj.currentProgress}%</span>
                            <span className="text-slate-400 dark:text-gray-500 font-mono">/ {proj.plannedProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-gray-900 rounded-full h-2 border border-slate-200 dark:border-gray-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                proj.status === 'DELAYED'
                                  ? 'bg-rose-500'
                                  : proj.status === 'AT_RISK'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${proj.currentProgress}%` }}
                            />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </td>

                        {/* Actions: Role-Gated */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Update Progress button (Allowed for ADMIN & SUPERVISOR; hidden for VIEWER) */}
                            {(officerRole === 'ADMIN' || officerRole === 'SUPERVISOR') && (
                              <Link
                                href={`/admin/${proj.id}/update`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-semibold transition-colors"
                                title="Add daily progress via Excel, Text, or Voice"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{t('dashboard.actionUpdate', 'Update Progress')}</span>
                              </Link>
                            )}

                            <Link
                              href={`/projects/${proj.id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-700 text-xs font-medium transition-colors"
                              title={t('dashboard.actionView', 'View Telemetry')}
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
