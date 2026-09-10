import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Mic,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Calendar,
  Loader2
} from 'lucide-react';
import ProgressUploader from '@/components/admin/ProgressUploader';
import { Project } from '@/types/project';
import { useI18n } from '@/lib/i18n-context';
import AuthGuard from '@/components/auth/AuthGuard';

export default function UpdateProgressPage() {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'SUPERVISOR']}>
      <UpdateProgressContent />
    </AuthGuard>
  );
}

function UpdateProgressContent() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useI18n();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchProjectDetails = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/projects/${id}`, { credentials: 'include' });
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (res.status === 404) {
        setProject(null);
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load project context from database');
      }

      const data = await res.json();
      const bp = data.project;
      const loaded: Project = {
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
      };
      setProject(loaded);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve project');
    } finally {
      setLoading(false);
    }
  }, [apiBase, id, router]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleUpdateSubmitted = () => {
    fetchProjectDetails();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 dark:text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono">{t('common.loading', 'Loading Project WBS Context from PostgreSQL...')}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Not Found in Database</h2>
        <p className="text-xs text-slate-500 dark:text-gray-400">The requested project ID does not exist in the active PostgreSQL registry.</p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('projectUpdate.backToDashboard', 'Return to Admin Dashboard')}</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('projectUpdate.title', 'Update Progress')}: {project.name} | InfraTrack 2026</title>
      </Head>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('projectUpdate.backToDashboard', 'Back to Dashboard')}</span>
          </Link>

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            <span>{t('projectUpdate.viewPublicAnalytics', 'View Public Analytics')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Project Header Card */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-gray-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-gray-700 font-semibold">
                  {project.wbsCode}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400">{project.category}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{project.name}</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{project.department} • {project.location}</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 p-3.5 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-gray-500 block">
                  {t('projectUpdate.currentProgress', 'Current Progress')}
                </span>
                <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block">
                  {project.currentProgress}%
                </span>
              </div>
              <div className="border-l border-slate-200 dark:border-gray-800 pl-4">
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-gray-500 block">
                  {t('projectUpdate.targetBaseline', 'Target Baseline')}
                </span>
                <span className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400 block">
                  {project.plannedProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Uploader (Excel, Text, Voice tabs) */}
        <ProgressUploader
          projectId={project.id}
          projectName={project.name}
          currentProgress={project.currentProgress}
          onUpdateSubmitted={handleUpdateSubmitted}
        />

        {/* Recent Daily Logs Stream for this project (From PostgreSQL) */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl space-y-4 transition-colors">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('projectUpdate.auditHistoryTitle', 'Audit History & Field Submissions')}</span>
          </h3>

          <div className="space-y-3">
            {project.recentUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-gray-500">
                {t('projectUpdate.noLogsYet', 'No field logs recorded yet for this project.')}
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
