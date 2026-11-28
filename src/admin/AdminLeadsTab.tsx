import { CheckCircle2, Clock, Download, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { deleteVisitorLead, updateVisitorLeadStatus } from '../lib/adminFirestore';
import { LeadSource, VisitorLead, VisitorLeadStatus } from '../types/dalka';

interface AdminLeadsTabProps {
  leads: VisitorLead[];
}

function formatCreatedAt(createdAt: unknown): string {
  if (
    createdAt &&
    typeof (createdAt as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (createdAt as { toDate: () => Date }).toDate().toLocaleString();
  }
  return '—';
}

function escapeCsvCell(val: string | undefined): string {
  const str = (val || '').replace(/"/g, '""');
  return `"${str}"`;
}

export function AdminLeadsTab({ leads }: AdminLeadsTabProps) {
  const [queryText, setQueryText] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | LeadSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | VisitorLeadStatus>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !q ||
        lead.fullName.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        (lead.location || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.higherEducation || '').toLowerCase().includes(q) ||
        (lead.itemTitle || '').toLowerCase().includes(q);
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesQuery && matchesSource && matchesStatus;
    });
  }, [leads, queryText, sourceFilter, statusFilter]);

  const hasActiveFilters = queryText.trim() !== '' || sourceFilter !== 'all' || statusFilter !== 'all';

  async function handleToggleStatus(lead: VisitorLead) {
    setError(null);
    const nextStatus: VisitorLeadStatus = lead.status === 'new' ? 'contacted' : 'new';
    try {
      await updateVisitorLeadStatus(lead.id, nextStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteVisitorLead(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete lead.');
    }
  }

  function handleExportCsv() {
    const headers = [
      'Full Name',
      'Phone',
      'Location',
      'Email',
      'Higher Education',
      'Source',
      'Requested Item',
      'Message',
      'Status',
      'Submitted At',
    ];
    const rows = filteredLeads.map((l) => [
      escapeCsvCell(l.fullName),
      escapeCsvCell(l.phone),
      escapeCsvCell(l.location),
      escapeCsvCell(l.email),
      escapeCsvCell(l.higherEducation),
      escapeCsvCell(l.source),
      escapeCsvCell(l.itemTitle),
      escapeCsvCell(l.message),
      escapeCsvCell(l.status),
      escapeCsvCell(formatCreatedAt(l.createdAt)),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dalka-jobs-visitor-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Visitor Leads
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Collected visitor names, phone numbers, and optional location, email, and higher education details from Contacts and Marketplace.
          </p>
        </div>
        <button
          type="button"
          disabled={filteredLeads.length === 0}
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] disabled:opacity-50 whitespace-nowrap self-start"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-[#93000A] dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search name, phone, location, email, or education..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'all' | LeadSource)}
              aria-label="Filter by lead source"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#0D1117] text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
            >
              <option value="all">All Sources</option>
              <option value="contacts">Contacts Page</option>
              <option value="marketplace">Marketplace</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | VisitorLeadStatus)}
              aria-label="Filter by lead status"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-[#0D1117] text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
          <span className="tabular-nums">
            Showing {filteredLeads.length} of {leads.length} visitor leads
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setSourceFilter('all');
                setStatusFilter('all');
              }}
              className="font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm text-[#64748B] dark:text-slate-400">
              {leads.length === 0
                ? 'No visitor leads captured yet.'
                : 'No visitor leads match the current filters.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setQueryText('');
                  setSourceFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#1E2430] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  <th className="py-3 px-4">Visitor</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Location &amp; Education</th>
                  <th className="py-3 px-4">Source / Notes</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm align-top">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]/70">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">{lead.fullName}</div>
                      {lead.email && <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{lead.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-medium tabular-nums text-[#0B1C30] dark:text-slate-200 whitespace-nowrap">
                      {lead.phone}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#464554] dark:text-slate-300">
                      <div>{lead.location || 'Location: —'}</div>
                      <div className="text-[#64748B] dark:text-slate-400 mt-0.5">
                        {lead.higherEducation || 'Education: —'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#464554] dark:text-slate-300 max-w-xs">
                      <div className="font-semibold capitalize text-[#0B1C30] dark:text-[#F8FAFC]">
                        {lead.source}
                        {lead.itemTitle ? ` · ${lead.itemTitle}` : ''}
                      </div>
                      {lead.message && <p className="mt-1 text-[#64748B] dark:text-slate-400 line-clamp-2">{lead.message}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {formatCreatedAt(lead.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(lead)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-xs font-semibold capitalize transition-colors ${
                          lead.status === 'new'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4648D4] dark:text-[#818CF8] border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006C49] dark:text-[#34D399] border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        }`}
                      >
                        {lead.status === 'new' ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>{lead.status}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === lead.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(lead.id)}
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
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(lead.id)}
                          aria-label={`Delete lead ${lead.fullName}`}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#BA1A1A] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
