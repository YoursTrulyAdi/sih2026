import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Layers, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Edit3, 
  Mic, 
  FileSpreadsheet, 
  FileText, 
  Activity, 
  UserCheck, 
  HardHat,
  Flag
} from 'lucide-react';
import { Project } from '@/types/project';
import ProgressLineChart from '@/components/charts/ProgressLineChart';
import CompletionPieChart from '@/components/charts/CompletionPieChart';
import { getStatusBadge } from '@/components/public/ProjectCard';
import AuthGuard from '@/components/auth/AuthGuard';
import { useI18n } from '@/lib/i18n-context';

export default function ProjectDetailsPage() {
  return (
    <AuthGuard>
      <ProjectDetailsContent />
    </AuthGuard>
  );
}

function ProjectDetailsContent() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useI18n();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUPERVISOR' | 'VIEWER'>('SUPERVISOR');

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    fetch(`${apiBase}/api/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role) setUserRole(data.user.role);
      })
      .catch(() => {});

    if (id && typeof id === 'string') {
      fetch(`${apiBase}/api/projects/${id}`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.project) {
            const bp = data.project;
            setProject({
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
              timelineData: (bp.timelinePoints && bp.timelinePoints.length > 0)
                ? bp.timelinePoints.map((tp: any) => ({
                    date: tp.period,
                    plannedProgress: tp.planned,
                    actualProgress: tp.actual,
                  }))
                : [
                    { date: 'M-1', plannedProgress: 10, actualProgress: bp.currentProgress / 2 },
                    { date: 'Current', plannedProgress: bp.plannedProgress, actualProgress: bp.currentProgress },
                  ],
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
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 dark:text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono">{t('common.loading', 'Loading Project Analytics & S-Curve Telemetry from PostgreSQL...')}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-gray-400">
          The requested infrastructure project could not be located in the database.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Portal</span>
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusBadge(project.status);
  const StatusIcon = statusInfo.icon;
  const variance = Math.round((project.currentProgress - project.plannedProgress) * 10) / 10;

  return (
    <>
      <Head>
        <title>{project.name} - Project Analytics & Progress | InfraTrack 2026</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation / Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Directory</span>
          </Link>

          {(userRole === 'ADMIN' || userRole === 'SUPERVISOR') && (
            <Link
              href={`/admin/${project.id}/update`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Submit Field Update</span>
            </Link>
          )}
        </div>

        {/* Project Header Banner */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-gray-700">
                  <Layers className="w-3.5 h-3.5" />
                  {project.wbsCode}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-700/60">
                  {project.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-gray-400 pt-1">
                <span className="text-slate-800 dark:text-gray-300 font-medium">{project.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  {project.location}
                </span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">{project.category}</span>
              </div>
            </div>

            {/* Overall Progress Stat Box */}
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-gray-900/90 border border-slate-200 dark:border-gray-700/80 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-gray-400 block tracking-wider">
                  Actual Physical Progress
                </span>
                <span className="text-3xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {project.currentProgress}%
                </span>
              </div>
              <div className="border-l border-slate-200 dark:border-gray-800 pl-6">
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-gray-400 block tracking-wider">
                  Planned Baseline
                </span>
                <span className="text-3xl font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {project.plannedProgress}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed border-t border-slate-100 dark:border-gray-700/70 pt-4">
            {project.description}
          </p>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Schedule Variance
            </span>
            <div
              className={`text-2xl font-mono font-extrabold mt-1 ${
                variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {variance >= 0 ? `+${variance}%` : `${variance}%`}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              {variance >= 0 ? 'Ahead of baseline target' : 'Behind planned velocity'}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Capital Budget
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">
              {project.budget}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              Spent to date: {project.spent}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Target Handover
            </span>
            <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-1 truncate">
              {project.baselineEndDate}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              Started: {project.baselineStartDate}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              Lead EPC Contractor
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
              {project.contractor}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 block">
              Eng: {project.supervisor}
            </span>
          </div>
        </div>

        {/* Dynamic Visualizations: S-Curve Progress Line Chart & Radial Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <ProgressLineChart
              timelineData={project.timelineData}
              currentProgress={project.currentProgress}
              plannedProgress={project.plannedProgress}
            />
          </div>

          <div className="lg:col-span-4">
            <CompletionPieChart
              currentProgress={project.currentProgress}
              plannedProgress={project.plannedProgress}
            />
          </div>
        </div>

        {/* Live Multi-Modal Field Audit Stream */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Multi-Modal Field Ingestion Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Audit trail of site supervisor voice notes, Excel line item imports, and daily logs.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-gray-700">
              {project.recentUpdates.length} Submissions
            </span>
          </div>

          <div className="space-y-4">
            {project.recentUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-gray-500 py-6 text-center">
                No field progress logs submitted yet for this project.
              </p>
            ) : (
              project.recentUpdates.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-700/80 space-y-2 text-xs transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          item.channel === 'VOICE'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                            : item.channel === 'EXCEL'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {item.channel === 'VOICE' ? (
                          <Mic className="w-3.5 h-3.5" />
                        ) : item.channel === 'EXCEL' ? (
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.author}</span>
                      <span className="text-slate-500 dark:text-gray-500">({item.role})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{item.progressDelta}%
                      </span>
                      <span className="text-slate-400 dark:text-gray-500 font-mono text-[11px]">{item.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-gray-300 pl-8 leading-relaxed">{item.notes}</p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-8 pt-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
