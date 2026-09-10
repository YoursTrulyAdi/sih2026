import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import ProjectCard from '@/components/public/ProjectCard';
import SearchBar from '@/components/public/SearchBar';
import { Project } from '@/types/project';
import { BarChart3, Layers, Compass, CheckCircle2, RotateCcw, FolderOpen } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useI18n } from '@/lib/i18n-context';

export default function ProjectsIndexPage() {
  return (
    <AuthGuard>
      <ProjectsIndexContent />
    </AuthGuard>
  );
}

function ProjectsIndexContent() {
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiBase}/api/projects`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.projects && Array.isArray(data.projects)) {
            const backendProjects: Project[] = data.projects.map((bp: any) => ({
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
            setProjects(backendProjects);
          }
        }
      } catch (err) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.wbsCode.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

  return (
    <>
      <Head>
        <title>National Infrastructure Projects Portal | InfraTrack 2026</title>
        <meta
          name="description"
          content="Real-time public portal for monitoring major infrastructure projects across India."
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 dark:border-gray-800 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                Telemetric Observability
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              National Infrastructure Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-2xl mt-1.5 leading-relaxed">
              Explore multi-modal progress verification and telemetry feeds for priority capital assets across the Republic of India.
            </p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
        />

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 dark:text-gray-400">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono">{t('common.loading', 'Syncing live telemetry from PostgreSQL...')}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-500 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              {t('dashboard.emptyStateTitle', 'No Infrastructure Projects Found')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
              {t('dashboard.emptyStateDesc', 'There are no projects matching your query in the database.')}
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
