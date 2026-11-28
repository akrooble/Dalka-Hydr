import { CheckCircle2, Pencil, Plus, Search, ShoppingBag, Star, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { SafeImage } from '../components/SafeImage';
import { deleteMarketplaceItem, saveMarketplaceItem } from '../lib/adminFirestore';
import { MarketplaceCategory, MarketplaceItem } from '../types/dalka';

interface AdminMarketplaceTabProps {
  items: MarketplaceItem[];
}

const IMAGE_PRESETS = [
  { label: 'Digital Kit Tablet', url: '/src/assets/images/marketplace_digital_kit_1795594059215.jpg' },
  { label: 'Hardcover Book', url: '/src/assets/images/marketplace_career_book_1795594058956.jpg' },
  { label: 'Executive Desk Set', url: '/src/assets/images/marketplace_desk_bundle_1795594060081.jpg' },
];

const CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  digital_good: 'Digital Good',
  book: 'Book',
  ecommerce: 'E-Commerce',
};

const EMPTY_ITEM = {
  title: '',
  category: 'digital_good' as MarketplaceCategory,
  price: 15,
  currency: 'USD',
  description: '',
  imageUrl: IMAGE_PRESETS[0].url,
  deliveryNote: '',
  inStock: true,
  featured: false,
  status: 'published' as 'published' | 'draft',
};

export function AdminMarketplaceTab({ items }: AdminMarketplaceTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const publishedCount = useMemo(() => items.filter((i) => i.status === 'published').length, [items]);
  const draftCount = items.length - publishedCount;

  const filteredItems = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        CATEGORY_LABELS[item.category].toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [items, queryText, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_ITEM);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: MarketplaceItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      price: item.price,
      currency: item.currency,
      description: item.description,
      imageUrl: item.imageUrl || '',
      deliveryNote: item.deliveryNote || '',
      inStock: item.inStock,
      featured: item.featured,
      status: item.status,
    });
    setError(null);
    setDrawerOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (form.title.trim().length < 2 || form.description.trim().length < 10) {
      setError('Title and description (min 10 chars) are required.');
      return;
    }

    setSaving(true);
    try {
      await saveMarketplaceItem(form, editingId || undefined);
      setDrawerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save marketplace item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMarketplaceItem(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete item.');
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Manage Marketplace
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Add digital goods, books, and work essentials. Visitors request items via direct phone lead capture.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] whitespace-nowrap self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
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
            placeholder="Search products, books, or categories..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700">
            {(
              [
                { id: 'all', label: `All (${items.length})` },
                { id: 'published', label: `Published (${publishedCount})` },
                { id: 'draft', label: `Draft (${draftCount})` },
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
            Showing {filteredItems.length} of {items.length}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-[#64748B] dark:text-slate-400">
              No marketplace items uploaded to Firestore yet.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8]"
            >
              Add First Product
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm text-[#64748B] dark:text-slate-400">No products match your search or filter.</p>
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
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Inventory</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#EFF4FF] dark:bg-[#1E2430] shrink-0">
                          <SafeImage
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            fallbackIcon={<ShoppingBag className="h-4 w-4" />}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                            <span className="truncate">{item.title}</span>
                            {item.featured && (
                              <Star
                                className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0"
                                aria-label="Featured"
                              />
                            )}
                          </div>
                          {item.deliveryNote && (
                            <div className="text-xs text-[#64748B] dark:text-slate-400 truncate max-w-xs mt-0.5">
                              {item.deliveryNote}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-[#464554] dark:text-slate-300 whitespace-nowrap">
                      {CATEGORY_LABELS[item.category]}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold tabular-nums text-[#0B1C30] dark:text-slate-200 whitespace-nowrap">
                      ${item.price} {item.currency}
                    </td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      <span
                        className={
                          item.inStock
                            ? 'text-[#006C49] dark:text-[#34D399] font-medium'
                            : 'text-[#BA1A1A] dark:text-red-400 font-medium'
                        }
                      >
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006C49] dark:text-[#34D399]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === item.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
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
                            onClick={() => openEdit(item)}
                            aria-label={`Edit ${item.title}`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#1E2430]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Delete ${item.title}`}
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
                  {editingId ? 'Edit Marketplace Item' : 'Add Marketplace Item'}
                </h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Configure product pricing, stock state, and preview imagery.
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
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={140}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value as MarketplaceCategory })
                      }
                      className={inputClass}
                    >
                      <option value="digital_good">Digital Good</option>
                      <option value="book">Book</option>
                      <option value="ecommerce">E-Commerce</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Price *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000000}
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className={`${inputClass} tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Currency *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={6}
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Product Image &amp; Preview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-4 aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#EFF4FF] dark:bg-[#1E2430]">
                    <SafeImage
                      src={form.imageUrl}
                      alt={form.title || 'Product preview'}
                      className="w-full h-full object-cover"
                      fallbackIcon={<ShoppingBag className="h-6 w-6" />}
                    />
                  </div>
                  <div className="sm:col-span-8 space-y-2.5">
                    <input
                      type="text"
                      maxLength={500}
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://... or /src/assets/..."
                      className={inputClass}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setForm({ ...form, imageUrl: preset.url })}
                          className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#1E2430] text-xs font-medium text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC]"
                        >
                          Use {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Delivery Note (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={form.deliveryNote}
                    onChange={(e) => setForm({ ...form, deliveryNote: e.target.value })}
                    placeholder="e.g. Sent by email after phone confirmation"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Description * (min 10 chars)
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={4000}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Status *
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value as 'published' | 'draft' })
                      }
                      className={inputClass}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end gap-2 pb-1">
                    <label className="inline-flex items-center gap-2 text-sm text-[#0B1C30] dark:text-[#F1F5F9]">
                      <input
                        type="checkbox"
                        checked={form.inStock}
                        onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#4648D4]"
                      />
                      <span>Available / In Stock</span>
                    </label>
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
                </div>
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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
