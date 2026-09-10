import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ProjectStatus } from '@/types/project';
import { useSession } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';
import { 
  Building2, 
  Calendar, 
  Layers, 
  IndianRupee, 
  MapPin, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: '',
    wbsCode: '',
    department: 'Ministry of Road Transport & Highways',
    category: 'Transportation',
    location: '',
    budget: '',
    baselineStartDate: '',
    baselineEndDate: '',
    description: '',
    status: 'ON_TRACK' as ProjectStatus,
    supervisor: '',
    contractor: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user?.name && !formData.supervisor) {
      setFormData((prev) => ({ ...prev, supervisor: session.user.name }));
    }
  }, [session?.user?.name, formData.supervisor]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.wbsCode.trim() || !formData.baselineStartDate || !formData.baselineEndDate) {
      setError('Please fill in all mandatory fields: Project Name, WBS Details, and Baseline Dates.');
      return;
    }

    setLoading(true);
    setError('');

    const formattedBudget = formData.budget
      ? formData.budget.startsWith('₹')
        ? formData.budget
        : `₹${formData.budget}`
      : '₹1,500 Cr';

    const supervisorVal = formData.supervisor || session?.user?.name || 'Field Executive Engineer';

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const payload = {
        name: formData.name.trim(),
        code: formData.wbsCode.trim(),
        wbsCode: formData.wbsCode.trim(),
        department: formData.department,
        category: formData.category,
        location: formData.location.trim() || 'Pan-India Corridor',
        budget: formattedBudget,
        spent: '₹0 Cr',
        baselineStartDate: new Date(formData.baselineStartDate).toISOString(),
        baselineEndDate: new Date(formData.baselineEndDate).toISOString(),
        currentProgress: 0,
        plannedProgress: 5,
        status: formData.status,
        supervisor: supervisorVal,
        contractor: formData.contractor.trim() || 'National EPC Contractors Ltd',
        description: formData.description.trim() || 'Infrastructure development project with multi-phase execution.',
      };

      const res = await fetch(`${apiBase}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setError('Authentication required: You must be signed in with your Officer account.');
        router.replace('/login');
        return;
      }

      if (res.status === 403) {
        setError('Access Restricted: Only Admin personnel are authorized to create new project baselines.');
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to persist project to database');
      }

      const resData = await res.json();
      const newProjectId = resData.project?.id || `PRJ-${Date.now()}`;

      setSubmitted(true);
      setTimeout(() => {
        router.push(`/admin?created=${newProjectId}`);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('projectForm.backBtn', 'Back to Dashboard')}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors">
        <div className="border-b border-slate-200 dark:border-gray-700 pb-5 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {t('projectForm.title', 'Create New Infrastructure Project')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {t('projectForm.subtitle', 'Establish a new project baseline with Work Breakdown Structure (WBS) metadata and timeline limits.')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-bounce">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span className="font-semibold">{t('projectForm.successMsg', 'Project baseline initialized successfully! Redirecting to dashboard...')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
              {t('projectForm.nameLabel', 'Project Name')} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('projectForm.namePlaceholder', 'e.g. Coastal Ring Road Expressway Phase II')}
              required
              className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
          </div>

          {/* WBS Details & Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t('projectForm.wbsLabel', 'WBS Code / Structure')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="wbsCode"
                value={formData.wbsCode}
                onChange={handleChange}
                placeholder={t('projectForm.wbsPlaceholder', 'e.g. WBS-2.3.14-HWY')}
                required
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                {t('projectForm.sectorLabel', 'Sector / Domain')}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="Transportation">Transportation</option>
                <option value="Energy">Energy & Renewables</option>
                <option value="Urban Transit">Urban Transit / Metro</option>
                <option value="Maritime">Maritime & Ports</option>
                <option value="Water & Environment">Water & Sanitation</option>
                <option value="Digital Infra">Digital Infrastructure</option>
              </select>
            </div>
          </div>

          {/* Ministry / Department */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
              {t('projectForm.ministryLabel', 'Ministry / Implementing Department')}
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="Ministry of Road Transport & Highways">Ministry of Road Transport & Highways</option>
              <option value="Ministry of New and Renewable Energy">Ministry of New and Renewable Energy</option>
              <option value="Ministry of Housing and Urban Affairs">Ministry of Housing and Urban Affairs</option>
              <option value="Ministry of Ports, Shipping and Waterways">Ministry of Ports, Shipping and Waterways</option>
              <option value="Ministry of Jal Shakti">Ministry of Jal Shakti</option>
              <option value="Ministry of Railways">Ministry of Railways</option>
            </select>
          </div>

          {/* Baseline Start Date & Baseline End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                {t('projectForm.startDateLabel', 'Baseline Start Date')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="baselineStartDate"
                value={formData.baselineStartDate}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t('projectForm.endDateLabel', 'Baseline End Date (Target)')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="baselineEndDate"
                value={formData.baselineEndDate}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Budget & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                {t('projectForm.budgetLabel', 'Sanctioned Budget')}
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. ₹3,450 Cr"
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                {t('projectForm.locationLabel', 'Project Location / Region')}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Pune-Nashik Corridor, MH"
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
              {t('projectForm.scopeLabel', 'Scope of Work & Description')}
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder={t('projectForm.scopePlaceholder', 'Detail the project scope, key milestones, and critical deliverables...')}
              className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/admin"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-gray-900 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-center transition-colors"
            >
              {t('projectForm.cancelBtn', 'Cancel')}
            </Link>
            <button
              type="submit"
              disabled={submitted || loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('projectForm.submitting', 'Submitting to Database...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('projectForm.submitBtn', 'Initialize Project Baseline')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
