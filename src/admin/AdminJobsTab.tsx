import { CheckCircle2, Globe, Mail, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { OrgLogo } from '../components/OrgLogo';
import { deleteJob, saveJob } from '../lib/adminFirestore';
import { JobEmploymentType, JobListing, JobStatus } from '../types/dalka';
import { LogoUploadField } from './LogoUploadField';

interface AdminJobsTabProps {
  jobs: JobListing[];
}

const LOGO_PRESETS = [
  { label: 'Infrastructure', url: '/assets/logos/org-infrastructure.svg' },
  { label: 'Tech / FinTech', url: '/assets/logos/org-fintech.svg' },
  { label: 'Energy / Water', url: '/assets/logos/org-water.svg' },
  { label: 'Health / Relief', url: '/assets/logos/org-health.svg' },
];

const EMPTY_JOB = {
  title: '',
  company: '',
  location: '',
  deadline: '',
  category: '',
  salary: '',
  employmentType: 'Full-time' as JobEmploymentType,
  description: '',
  externalUrl: '',
  applyEmail: '',
  logoUrl: '',
  status: 'active' as JobStatus,
  featured: false,
};

export function AdminJobsTab({ jobs }: AdminJobsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');

  const activeCount = useMemo(() => jobs.filter((j) => j.status === 'active').length, [jobs]);
  const closedCount = jobs.length - activeCount;

  const filteredJobs = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [jobs, queryText, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_JOB);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(job: JobListing) {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      deadline: job.deadline,
      category: job.category,
      salary: job.salary,
      employmentType: job.employmentType,
      description: job.description,
      externalUrl: job.externalUrl || '',
      applyEmail: job.applyEmail || '',
      logoUrl: job.logoUrl || '',
      status: job.status,
      featured: job.featured,
    });
    setError(null);
    setDrawerOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (form.title.trim().length < 2 || form.company.trim().length < 2 || form.description.trim().length < 10) {
      setError('Title, company, and a description of at least 10 characters are required.');
      return;
    }

    setSaving(true);
    try {
      await saveJob(form, editingId || undefined);
      setDrawerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save job.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteJob(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete job.');
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Manage Jobs
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Upload and manage job postings with external application links or direct hiring emails.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] transition-colors whitespace-nowrap self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Job</span>
        </button>
      </div>

      {error && !drawerOpen && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-[#93000A] dark:text-red-300">
          {error}
        </div>
      )}

      {/* Search + Segmented Status Filter Bar */}
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search job title, company, location, or category..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700">
            {(
              [
                { id: 'all', label: `All (${jobs.length})` },
                { id: 'active', label: `Active (${activeCount})` },
                { id: 'closed', label: `Closed (${closedCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 h-8 rounded-md text-xs font-medium transition-colors whitespace-nowrap tabular-nums ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-[#0D1117] text-[#0B1C30] dark:text-[#F8FAFC] shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#64748B] dark:text-slate-400 tabular-nums whitespace-nowrap">
            Showing {filteredJobs.length} of {jobs.length}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-[#64748B] dark:text-slate-400">No jobs uploaded to Firestore yet.</p>
            <button
              type="button"
              onClick={openCreate}
              className="h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8]"
            >
              Upload First Job
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm text-[#64748B] dark:text-slate-400">No jobs match your search or filter.</p>
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setStatusFilter('all');
              }}
              className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#1E2430] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  <th className="py-3 px-4">Role &amp; Category</th>
                  <th className="py-3 px-4">Employer &amp; City</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Apply Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]/70">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                        <span>{job.title}</span>
                        {job.featured && (
                          <Star
                            className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0"
                            aria-label="Featured"
                          />
                        )}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                        {job.category} · {job.employmentType}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <OrgLogo name={job.company} logoUrl={job.logoUrl} sizeClass="h-9 w-9" />
                        <div className="min-w-0">
                          <div className="font-medium text-[#0B1C30] dark:text-slate-200">{job.company}</div>
                          <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{job.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#0B1C30] dark:text-slate-200 whitespace-nowrap">
                      {job.salary}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#464554] dark:text-slate-300 whitespace-nowrap">
                      {job.deadline}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {job.externalUrl && (
                          <span className="inline-flex items-center gap-1 text-[#4648D4] dark:text-[#818CF8]">
                            <Globe className="h-3.5 w-3.5" />
                            <span>URL</span>
                          </span>
                        )}
                        {job.applyEmail && (
                          <span className="inline-flex items-center gap-1 text-[#464554] dark:text-slate-300">
                            <Mail className="h-3.5 w-3.5" />
                            <span>Email</span>
                          </span>
                        )}
                        {!job.externalUrl && !job.applyEmail && <span>—</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {job.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006C49] dark:text-[#34D399]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === job.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(job.id)}
                            className="px-2.5 h-8 rounded-md bg-[#BA1A1A] text-white text-xs font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 h-8 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(job)}
                            aria-label={`Edit ${job.title}`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#1E2430]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(job.id)}
                            aria-label={`Delete ${job.title}`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#BA1A1A] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/75 flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-[#161B22] h-full overflow-y-auto p-6 sm:p-8 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                  {editingId ? 'Edit Job Posting' : 'Upload New Job'}
                </h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Configure role details, salary, deadline, and direct employer routing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close drawer"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-sm text-[#93000A] dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Role Identity</h3>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <LogoUploadField
                  label="Company Logo Image (Optional)"
                  orgName={form.company || 'Company'}
                  value={form.logoUrl}
                  onChange={(logoUrl) => setForm({ ...form, logoUrl })}
                  presets={LOGO_PRESETS}
                />
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Compensation &amp; Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Salary *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      placeholder="e.g. $2,000 / mo"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Deadline *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      placeholder="YYYY-MM-DD"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Employment Type *
                    </label>
                    <select
                      value={form.employmentType}
                      onChange={(e) =>
                        setForm({ ...form, employmentType: e.target.value as JobEmploymentType })
                      }
                      className={inputClass}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Consultancy">Consultancy</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Status *
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Direct Application Routing &amp; Description
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Application Link (Optional)
                    </label>
                    <input
                      type="url"
                      maxLength={500}
                      value={form.externalUrl}
                      onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                      placeholder="https://company.com/apply"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Hiring Email (Optional)
                    </label>
                    <input
                      type="email"
                      maxLength={160}
                      value={form.applyEmail}
                      onChange={(e) => setForm({ ...form, applyEmail: e.target.value })}
                      placeholder="careers@company.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Description * (min 10 chars)
                  </label>
                  <textarea
                    required
                    rows={5}
                    maxLength={6000}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-[#0B1C30] dark:text-[#F1F5F9]">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#4648D4]"
                  />
                  <span>Feature this job on homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-medium text-[#464554] dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
