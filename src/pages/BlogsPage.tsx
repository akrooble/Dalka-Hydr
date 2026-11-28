import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { resolveSiteTheme } from '../lib/siteThemes';
import { BlogPost, SiteThemeId } from '../types/dalka';

interface BlogsPageProps {
  blogs: BlogPost[];
  siteTheme?: SiteThemeId;
}

export function BlogsPage({ blogs, siteTheme }: BlogsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const theme = resolveSiteTheme(siteTheme);

  const activeSlug = searchParams.get('article');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(blogs.map((b) => b.category)))],
    [blogs],
  );

  const filteredBlogs = useMemo(() => {
    if (selectedCategory === 'All') return blogs;
    return blogs.filter((b) => b.category === selectedCategory);
  }, [blogs, selectedCategory]);

  const activeArticle = useMemo(
    () => blogs.find((b) => b.slug === activeSlug) || null,
    [blogs, activeSlug],
  );

  function openArticle(slug: string) {
    const next = new URLSearchParams(searchParams);
    next.set('article', slug);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeArticle() {
    const next = new URLSearchParams(searchParams);
    next.delete('article');
    setSearchParams(next);
  }

  if (activeArticle) {
    if (theme === 'swiss_editorial') {
      return (
        <div className="mx-auto max-w-[780px] px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <button
            type="button"
            onClick={closeArticle}
            className="inline-flex items-center gap-2 min-h-[44px] text-xs font-mono uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Editorial Archive</span>
          </button>

          <article className="space-y-6">
            <header className="pb-6 border-b-2 border-[#0A0C10] dark:border-slate-200 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#64748B] dark:text-slate-400">
                {activeArticle.category} · {activeArticle.readTime} · By {activeArticle.author}
              </div>
              <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0C10] dark:text-[#F8FAFC] leading-[1.08] text-balance">
                {activeArticle.title}
              </h1>
              <p className="text-base sm:text-lg text-[#334155] dark:text-slate-300 leading-relaxed">
                {activeArticle.excerpt}
              </p>
            </header>

            {activeArticle.coverImage && (
              <figure>
                <div className="aspect-[16/9] border border-slate-300 dark:border-slate-700 bg-[#F1F5F9] dark:bg-[#12151C] overflow-hidden">
                  <SafeImage
                    src={activeArticle.coverImage}
                    alt={activeArticle.title}
                    className="w-full h-full object-cover"
                    fallbackIcon={<FileText className="h-10 w-10" />}
                  />
                </div>
              </figure>
            )}

            <div className="space-y-5 text-base sm:text-[17px] text-[#0A0C10] dark:text-slate-200 leading-[1.8] max-w-[68ch] whitespace-pre-line first-letter:text-5xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none">
              {activeArticle.content}
            </div>
          </article>
        </div>
      );
    }

    if (theme === 'modern_bento') {
      return (
        <div className="mx-auto max-w-[880px] px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <button
            type="button"
            onClick={closeArticle}
            className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </button>

          <article className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-[0_6px_28px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
            {activeArticle.coverImage && (
              <div className="aspect-[16/9] bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden">
                <SafeImage
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                  fallbackIcon={<FileText className="h-10 w-10" />}
                />
              </div>
            )}

            <div className="p-6 sm:p-10">
              <div className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                {activeArticle.category} · {activeArticle.readTime} · By {activeArticle.author}
              </div>
              <h1 className="mt-3 font-bento text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] leading-tight text-balance">
                {activeArticle.title}
              </h1>
              <p className="mt-4 text-base font-medium text-[#475569] dark:text-slate-300 leading-relaxed">
                {activeArticle.excerpt}
              </p>
              <hr className="my-6 border-slate-100 dark:border-slate-800" />
              <div className="space-y-4 text-base text-[#0F172A] dark:text-slate-200 leading-relaxed max-w-[68ch] whitespace-pre-line">
                {activeArticle.content}
              </div>
            </div>
          </article>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-16">
        <button
          type="button"
          onClick={closeArticle}
          className="inline-flex items-center gap-2 min-h-[44px] lg:min-h-0 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-[#A5B4FC] mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Articles</span>
        </button>

        <article className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {activeArticle.coverImage && (
            <div className="aspect-[16/9] bg-[#EFF4FF] dark:bg-[#1E2430] border-b border-slate-200 dark:border-slate-800 overflow-hidden">
              <SafeImage
                src={activeArticle.coverImage}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
                fallbackIcon={<FileText className="h-10 w-10" />}
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">
              {activeArticle.category} · {activeArticle.readTime} · By {activeArticle.author}
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC] leading-tight text-balance">
              {activeArticle.title}
            </h1>
            <p className="mt-4 text-base font-medium text-[#464554] dark:text-slate-300 leading-relaxed">
              {activeArticle.excerpt}
            </p>
            <hr className="my-6 border-slate-200 dark:border-slate-800" />
            <div className="space-y-4 text-base text-[#0B1C30] dark:text-slate-200 leading-relaxed max-w-[68ch] whitespace-pre-line">
              {activeArticle.content}
            </div>
          </div>
        </article>
      </div>
    );
  }

  if (theme === 'modern_bento') {
    const leadPost = filteredBlogs[0];
    const secondaryPosts = filteredBlogs.slice(1);

    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">Insights &amp; Playbooks</p>
            <h1 className="mt-1 font-bento text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Blogs &amp; Career Guides
            </h1>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 self-start">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#4648D4] dark:bg-[#6366F1] text-white'
                    : 'text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {leadPost && (
          <article className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[0_6px_28px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
            <div className="lg:col-span-6 aspect-[16/10] lg:aspect-auto bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden">
              <SafeImage
                src={leadPost.coverImage}
                alt={leadPost.title}
                className="w-full h-full object-cover"
                fallbackIcon={<FileText className="h-10 w-10" />}
              />
            </div>
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                  Featured · {leadPost.category} · {leadPost.readTime}
                </div>
                <h2 className="mt-2 font-bento text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                  {leadPost.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed">
                  {leadPost.excerpt}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-[#64748B] dark:text-slate-400">By {leadPost.author}</span>
                <button
                  type="button"
                  onClick={() => openArticle(leadPost.slug)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
                >
                  <span>Read Featured Guide</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secondaryPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none flex flex-col"
            >
              <div className="aspect-[16/10] bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden">
                <SafeImage
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                  fallbackIcon={<FileText className="h-8 w-8" />}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#64748B] dark:text-slate-400">
                    {post.category} · {post.readTime}
                  </div>
                  <h2 className="mt-1.5 font-bento text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#475569] dark:text-slate-300 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-[#64748B] dark:text-slate-400">By {post.author}</span>
                  <button
                    type="button"
                    onClick={() => openArticle(post.slug)}
                    className="text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
                  >
                    Read →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (theme === 'swiss_editorial') {
    const leadPost = filteredBlogs[0];
    const secondaryPosts = filteredBlogs.slice(1);

    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-8">
        <div className="pb-4 border-b-2 border-[#0A0C10] dark:border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
              Editorial Dispatch · Archive
            </p>
            <h1 className="mt-1 font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0C10] dark:text-[#F8FAFC]">
              Blogs &amp; Insights
            </h1>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12151C] p-1 self-start">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[36px] px-3 py-1 text-xs uppercase tracking-wider font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0A0C10] dark:bg-[#F8FAFC] text-white dark:text-[#0A0C10]'
                    : 'text-[#475569] dark:text-slate-400 hover:text-[#0A0C10] dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {leadPost && (
          <article className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 aspect-[16/10] lg:aspect-auto bg-[#F1F5F9] dark:bg-[#181C25] border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-slate-800 overflow-hidden">
              <SafeImage
                src={leadPost.coverImage}
                alt={leadPost.title}
                className="w-full h-full object-cover"
                fallbackIcon={<FileText className="h-10 w-10" />}
              />
            </div>
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#4648D4] dark:text-[#818CF8]">
                  Lead Dispatch · {leadPost.category} · {leadPost.readTime}
                </div>
                <h2 className="mt-2 font-editorial text-2xl sm:text-3xl font-bold text-[#0A0C10] dark:text-[#F8FAFC] leading-tight">
                  {leadPost.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#334155] dark:text-slate-300 leading-relaxed">
                  {leadPost.excerpt}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-[#64748B] dark:text-slate-400">
                  By {leadPost.author}
                </span>
                <button
                  type="button"
                  onClick={() => openArticle(leadPost.slug)}
                  className="text-xs uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
                >
                  Read Dispatch →
                </button>
              </div>
            </div>
          </article>
        )}

        {secondaryPosts.length > 0 && (
          <div className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 divide-y divide-slate-300 dark:divide-slate-800">
            {secondaryPosts.map((post, idx) => (
              <article
                key={post.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span className="font-mono text-xs text-[#64748B] dark:text-slate-400 pt-1 shrink-0">
                    0{idx + 2}.
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                      {post.category} · {post.readTime} · By {post.author}
                    </div>
                    <h2 className="mt-1 font-editorial text-xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
                      {post.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-[#334155] dark:text-slate-300 max-w-3xl">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openArticle(post.slug)}
                  className="h-10 px-4 border border-slate-300 dark:border-slate-700 text-xs uppercase tracking-wider font-semibold text-[#4648D4] dark:text-[#818CF8] hover:bg-slate-50 dark:hover:bg-[#181C25] whitespace-nowrap shrink-0 self-start sm:self-center"
                >
                  Read Article →
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Classic Editorial (Theme 1 — Default)
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12 space-y-6">
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Blogs &amp; Insights
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Practical guides on direct job applications, tender bidding, and regional market trends.
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#EFF4FF] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700 self-start">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[38px] px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-[#161B22] text-[#0B1C30] dark:text-[#F8FAFC] shadow-xs'
                  : 'text-[#464554] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBlogs.map((post) => (
          <article
            key={post.id}
            className="group bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
          >
            <div className="aspect-[4/3] bg-[#EFF4FF] dark:bg-[#1E2430] border-b border-slate-100 dark:border-slate-800 overflow-hidden">
              <SafeImage
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                fallbackIcon={<FileText className="h-8 w-8" />}
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs text-[#64748B] dark:text-slate-400">
                  {post.category} · {post.readTime}
                </div>
                <h2 className="mt-1.5 text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC] leading-snug">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-[#64748B] dark:text-slate-400">By {post.author}</span>
                <button
                  type="button"
                  onClick={() => openArticle(post.slug)}
                  className="min-h-[44px] lg:min-h-0 px-1 text-sm font-semibold text-[#4648D4] dark:text-[#818CF8] hover:text-[#4F46E5] dark:hover:text-[#A5B4FC]"
                >
                  Read Article →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
