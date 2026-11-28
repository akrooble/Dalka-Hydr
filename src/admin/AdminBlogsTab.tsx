import { CheckCircle2, FileText, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { SafeImage } from '../components/SafeImage';
import { deleteBlogPost, normalizeSlug, saveBlogPost } from '../lib/adminFirestore';
import { BlogPost } from '../types/dalka';

interface AdminBlogsTabProps {
  blogs: BlogPost[];
}

const COVER_PRESETS = [
  { label: 'Editorial Meeting', url: '/src/assets/images/blog_career_editorial_1795594060761.jpg' },
  { label: 'Modern Workspace', url: '/src/assets/images/hero_dalka_workspace_1795594060501.jpg' },
];

const EMPTY_BLOG = {
  title: '',
  slug: '',
  category: 'Career Strategy',
  author: 'Dalka Editorial Team',
  excerpt: '',
  content: '',
  coverImage: COVER_PRESETS[0].url,
  readTime: '4 min read',
  status: 'published' as 'published' | 'draft',
};

export function AdminBlogsTab({ blogs }: AdminBlogsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_BLOG);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [queryText, setQueryText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const publishedCount = useMemo(() => blogs.filter((b) => b.status === 'published').length, [blogs]);
  const draftCount = blogs.length - publishedCount;

  const filteredBlogs = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return blogs.filter((post) => {
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [blogs, queryText, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_BLOG);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      author: post.author,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      readTime: post.readTime,
      status: post.status,
    });
    setError(null);
    setDrawerOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (
      form.title.trim().length < 4 ||
      form.excerpt.trim().length < 10 ||
      form.content.trim().length < 20
    ) {
      setError('Title (min 4 chars), excerpt (min 10 chars), and content (min 20 chars) are required.');
      return;
    }

    setSaving(true);
    try {
      await saveBlogPost(
        {
          ...form,
          slug: normalizeSlug(form.slug || form.title),
        },
        editingId || undefined,
      );
      setDrawerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save blog post.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBlogPost(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete blog post.');
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Manage Blogs
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Publish career advice, tender compliance guides, and regional market insights.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] whitespace-nowrap self-start"
        >
          <Plus className="h-4 w-4" />
          <span>New Article</span>
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
            placeholder="Search articles, categories, authors, or slugs..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700">
            {(
              [
                { id: 'all', label: `All (${blogs.length})` },
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
            Showing {filteredBlogs.length} of {blogs.length}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {blogs.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-[#64748B] dark:text-slate-400">No blog posts uploaded to Firestore yet.</p>
            <button
              type="button"
              onClick={openCreate}
              className="h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8]"
            >
              Write First Article
            </button>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm text-[#64748B] dark:text-slate-400">No articles match your search or filter.</p>
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
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Read Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredBlogs.map((post) => (
                  <tr key={post.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#EFF4FF] dark:bg-[#1E2430] shrink-0">
                          <SafeImage
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            fallbackIcon={<FileText className="h-4 w-4" />}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#0B1C30] dark:text-[#F8FAFC] truncate max-w-xs sm:max-w-sm">
                            {post.title}
                          </div>
                          <div className="text-xs font-mono text-[#64748B] dark:text-slate-400 truncate max-w-xs mt-0.5">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-[#464554] dark:text-slate-300 whitespace-nowrap">
                      {post.category}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#464554] dark:text-slate-300 whitespace-nowrap">
                      {post.author}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                      {post.readTime}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006C49] dark:text-[#34D399]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Draft</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === post.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
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
                            onClick={() => openEdit(post)}
                            aria-label={`Edit ${post.title}`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#1E2430]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(post.id)}
                            aria-label={`Delete ${post.title}`}
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
                  {editingId ? 'Edit Blog Article' : 'Publish Blog Article'}
                </h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Configure article metadata, cover imagery, and editorial body.
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
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={180}
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: editingId ? form.slug : normalizeSlug(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                      Read Time *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={30}
                      value={form.readTime}
                      onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
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
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  Cover Image &amp; Preview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-4 aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#EFF4FF] dark:bg-[#1E2430]">
                    <SafeImage
                      src={form.coverImage}
                      alt={form.title || 'Article cover preview'}
                      className="w-full h-full object-cover"
                      fallbackIcon={<FileText className="h-6 w-6" />}
                    />
                  </div>
                  <div className="sm:col-span-8 space-y-2.5">
                    <input
                      type="text"
                      maxLength={500}
                      value={form.coverImage}
                      onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                      placeholder="https://... or /src/assets/..."
                      className={inputClass}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {COVER_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setForm({ ...form, coverImage: preset.url })}
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
                    Excerpt * (min 10 chars)
                  </label>
                  <textarea
                    required
                    rows={2}
                    maxLength={400}
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                    Article Content * (min 20 chars)
                  </label>
                  <textarea
                    required
                    rows={7}
                    maxLength={15000}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
                  />
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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
