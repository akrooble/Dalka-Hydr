import { CheckCircle2, Globe, Mail, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { OrgLogo } from '../components/OrgLogo';
import { deleteTender, saveTender } from '../lib/adminFirestore';
import { TenderNotice, TenderStatus } from '../types/dalka';
import { LogoUploadField } from './LogoUploadField';

interface AdminTendersTabProps {
  tenders: TenderNotice[];
}

const LOGO_PRESETS = [
  { label: 'Water / Energy', url: '/assets/logos/org-water.svg' },
  { label: 'Infrastructure', url: '/assets/logos/org-infrastructure.svg' },
  { label: 'Health / Relief', url: '/assets/logos/org-health.svg' },
  { label: 'Digital / Finance', url: '/assets/logos/org-fintech.svg' },
];

const EMPTY_TENDER = {
  title: '',
  organization: '',
  location: '',
  deadline: '',
  category: '',
  budget: '',
  referenceNo: '',
  description: '',
  externalUrl: '',
  applyEmail: '',
  logoUrl: '',
  status: 'open' as TenderStatus,
  featured: false,
};

export function AdminTendersTab({ tenders }: AdminTendersTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_TENDER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TenderStatus>('all');

  const openCount = useMemo(() => tenders.filter((t) => t.status === 'open').length, [tenders]);
  const awardedCount = useMemo(() => tenders.filter((t) => t.status === 'awarded').length, [tenders]);
  const closedCount = tenders.length - openCount - awardedCount;

  const filteredTenders = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return tenders.filter((t) => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.organization.toLowerCase().includes(q) ||
        t.referenceNo.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [tenders, queryText, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_TENDER);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(tender: TenderNotice) {
    setEditingId(tender.id);
    setForm({
      title: tender.title,
      organization: tender.organization,
      location: tender.location,
      deadline: tender.deadline,
      category: tender.category,
      budget: tender.budget,
      referenceNo: tender.referenceNo,
      description: tender.description,
      externalUrl: tender.externalUrl || '',
      applyEmail: tender.applyEmail || '',
      logoUrl: tender.logoUrl || '',
      status: tender.status,
      featured: tender.featured,
    });
    setError(null);
    setDrawerOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (
      form.title.trim().length < 2 ||
      form.organization.trim().length < 2 ||
      form.referenceNo.trim().length < 2 ||
      form.description.trim().length < 10
    ) {
      setError('Title, organization, reference number, and description (min 10 chars) are required.');
      return;
    }

    setSaving(true);
    try {
      await saveTender(form, editingId || undefined);
      setDrawerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save tender.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTender(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete tender.');
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Manage Tenders
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Publish institutional procurement notices with budgets, reference IDs, and submission channels.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] transition-colors whitespace-nowrap self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Tender</span>
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
            placeholder="Search tender reference, title, organization, or city..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700">
            {(
              [
                { id: 'all', label: `All (${tenders.length})` },
                { id: 'open', label: `Open (${openCount})` },
                { id: 'awarded', label: `Awarded (${awardedCount})` },
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
            Showing {filteredTenders.length} of {tenders.length}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {tenders.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-[#64748B] dark:text-slate-400">No tenders uploaded to Firestore yet.</p>
            <button
              type="button"
              onClick={openCreate}
              className="h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8]"
            >
              Publish First Tender
            </button>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm text-[#64748B] dark:text-slate-400">No tenders match your search or filter.</p>
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
                  <th className="py-3 px-4">Tender &amp; Ref</th>
                  <th className="py-3 px-4">Organization &amp; City</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]/70">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                        <span>{tender.title}</span>
                        {tender.featured && (
                          <Star
                            className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0"
                            aria-label="Featured"
                          />
                        )}
                      </div>
                      <div className="text-xs font-mono text-[#64748B] dark:text-slate-400 mt-0.5 tabular-nums">
                        {tender.referenceNo} · <span className="font-sans">{tender.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <OrgLogo name={tender.organization} logoUrl={tender.logoUrl} sizeClass="h-9 w-9" />
                        <div className="min-w-0">
                          <div className="font-medium text-[#0B1C30] dark:text-slate-200">{tender.organization}</div>
                          <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{tender.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#0B1C30] dark:text-slate-200 whitespace-nowrap">
                      {tender.budget}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#464554] dark:text-slate-300 whitespace-nowrap">
                      {tender.deadline}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {tender.externalUrl && (
                          <span className="inline-flex items-center gap-1 text-[#4648D4] dark:text-[#818CF8]">
                            <Globe className="h-3.5 w-3.5" />
                            <span>Portal</span>
                          </span>
                        )}
                        {tender.applyEmail && (
                          <span className="inline-flex items-center gap-1 text-[#464554] dark:text-slate-300">
                            <Mail className="h-3.5 w-3.5" />
                            <span>Email</span>
                          </span>
                        )}
                        {!tender.externalUrl && !tender.applyEmail && <span>—</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tender.status === 'open' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006C49] dark:text-[#34D399]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Open</span>
                        </span>
                      ) : tender.status === 'awarded' ? (
                        <span className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                          Awarded
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === tender.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(tender.id)}
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
                            onClick={() => openEdit(tender)}
                            aria-label={`Edit ${tender.title}`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#1E2430]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(tender.id)}
                            aria-label={`Delete ${tender.title}`}
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
                  {editingId ? 'Edit Tender Notice' : 'Publish New Tender'}
                </h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Configure institutional tender reference, budget, and submission channel.
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
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Procurement Identity
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Tender Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={180}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Organization *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Reference No *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      value={form.referenceNo}
                      onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                      placeholder="e.g. RFP-2026-001"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <LogoUploadField
                  label="Organization Logo Image (Optional)"
                  orgName={form.organization || 'Organization'}
                  value={form.logoUrl}
                  onChange={(logoUrl) => setForm({ ...form, logoUrl })}
                  presets={LOGO_PRESETS}
                />
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Budget, Category &amp; Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Budget *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      placeholder="e.g. $50,000 USD"
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
                      Status *
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as TenderStatus })}
                      className={inputClass}
                    >
                      <option value="open">Open</option>
                      <option value="awarded">Awarded</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Submission Channels &amp; Scope
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Tender Portal Link (Optional)
                    </label>
                    <input
                      type="url"
                      maxLength={500}
                      value={form.externalUrl}
                      onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                      placeholder="https://organization.org/rfp"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Procurement Email (Optional)
                    </label>
                    <input
                      type="email"
                      maxLength={160}
                      value={form.applyEmail}
                      onChange={(e) => setForm({ ...form, applyEmail: e.target.value })}
                      placeholder="bids@organization.org"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Scope &amp; Requirements * (min 10 chars)
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
                  <span>Feature on homepage</span>
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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Tender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
