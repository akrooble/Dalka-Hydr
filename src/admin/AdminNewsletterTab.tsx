import { AlertCircle, Download, Mail, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { deleteNewsletterSubscriber } from '../lib/adminFirestore';
import { NewsletterSubscriber } from '../types/dalka';

interface AdminNewsletterTabProps {
  subscribers: NewsletterSubscriber[];
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

export function AdminNewsletterTab({ subscribers }: AdminNewsletterTabProps) {
  const [queryText, setQueryText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        (s.source || '').toLowerCase().includes(q),
    );
  }, [subscribers, queryText]);

  const uniqueEmailsCount = useMemo(() => {
    return new Set(subscribers.map((s) => s.email.trim().toLowerCase())).size;
  }, [subscribers]);

  async function handleDelete(subId: string) {
    setError(null);
    try {
      await deleteNewsletterSubscriber(subId);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove subscriber.');
    }
  }

  function handleExportCsv() {
    const headers = ['Email', 'Source', 'Subscribed At'];
    const rows = filtered.map((sub) => [
      escapeCsvCell(sub.email),
      escapeCsvCell(sub.source),
      escapeCsvCell(formatCreatedAt(sub.createdAt)),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dalka-jobs-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
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
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Email subscribers captured from the website footer newsletter form.
          </p>
        </div>

        <button
          type="button"
          disabled={filtered.length === 0}
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-semibold text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
              Total Subscriptions
            </span>
            <Mail className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {subscribers.length}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">
            Unique Email Addresses
          </div>
          <div className="mt-2 text-2xl font-bold text-[#4648D4] dark:text-[#818CF8] tabular-nums">
            {uniqueEmailsCount}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">
            Matching Filter
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {filtered.length}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-[#93000A] dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search subscriber email..."
            aria-label="Search newsletter subscribers"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#4648D4]"
          />
        </div>
        {queryText.trim() && (
          <button
            type="button"
            onClick={() => setQueryText('')}
            className="h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430] self-start sm:self-auto"
          >
            Clear Search
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Mail className="h-7 w-7 mx-auto text-[#4648D4] dark:text-[#818CF8]" />
            <p className="text-sm font-medium text-[#0B1C30] dark:text-[#F8FAFC]">
              {subscribers.length === 0
                ? 'No newsletter subscribers yet.'
                : 'No subscribers match your search.'}
            </p>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Emails entered in the public footer newsletter form appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#1E2430] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Subscribed At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]">
                    <td className="py-3 px-4 font-medium text-[#0B1C30] dark:text-[#F8FAFC]">
                      <a
                        href={`mailto:${sub.email}`}
                        className="hover:text-[#4648D4] dark:hover:text-[#818CF8] transition-colors"
                      >
                        {sub.email}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-xs capitalize text-[#464554] dark:text-slate-300">
                      {sub.source || 'footer'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                      {formatCreatedAt(sub.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === sub.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id)}
                            className="h-8 px-2.5 rounded-md bg-[#BA1A1A] text-white text-xs font-semibold hover:bg-[#93000A]"
                          >
                            Confirm Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-[#464554] dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(sub.id)}
                          aria-label={`Remove subscriber ${sub.email}`}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-[#93000A] dark:hover:text-red-400 transition-colors"
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
