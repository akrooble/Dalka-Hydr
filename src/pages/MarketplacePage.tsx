import { BookOpen, Laptop, Package, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LeadForm } from '../components/LeadForm';
import { SafeImage } from '../components/SafeImage';
import { resolveSiteTheme } from '../lib/siteThemes';
import { MarketplaceCategory, MarketplaceItem, SiteThemeId } from '../types/dalka';

interface MarketplacePageProps {
  items: MarketplaceItem[];
  siteTheme?: SiteThemeId;
}

const CATEGORY_LABELS: Record<'all' | MarketplaceCategory, string> = {
  all: 'All Items',
  digital_good: 'Digital Goods',
  book: 'Books',
  ecommerce: 'E-Commerce',
};

function CategoryIcon({ category }: { category: MarketplaceCategory }) {
  if (category === 'digital_good') return <Laptop className="h-6 w-6 text-[#4648D4] dark:text-[#818CF8]" />;
  if (category === 'book') return <BookOpen className="h-6 w-6 text-[#4648D4] dark:text-[#818CF8]" />;
  return <Package className="h-6 w-6 text-[#4648D4] dark:text-[#818CF8]" />;
}

export function MarketplacePage({ items, siteTheme }: MarketplacePageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<'all' | MarketplaceCategory>('all');
  const [queryText, setQueryText] = useState('');
  const [activeItem, setActiveItem] = useState<MarketplaceItem | null>(null);
  const theme = resolveSiteTheme(siteTheme);

  const requestedItemId = searchParams.get('item');
  useEffect(() => {
    if (requestedItemId) {
      const match = items.find((i) => i.id === requestedItemId);
      if (match) setActiveItem(match);
    }
  }, [requestedItemId, items]);

  const filteredItems = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [items, categoryFilter, queryText]);

  function openInquiry(item: MarketplaceItem) {
    setActiveItem(item);
    const next = new URLSearchParams(searchParams);
    next.set('item', item.id);
    setSearchParams(next, { replace: true });
  }

  function closeInquiry() {
    setActiveItem(null);
    const next = new URLSearchParams(searchParams);
    next.delete('item');
    setSearchParams(next, { replace: true });
  }

  useEffect(() => {
    if (!activeItem) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveItem(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeItem]);

  function renderDrawer() {
    if (!activeItem) return null;
    const isSharp = theme === 'swiss_editorial';
    const isBento = theme === 'modern_bento';
    return (
      <div
        className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/75 flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-inquiry-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeInquiry();
        }}
      >
        <div
          className={`w-full max-w-lg bg-white dark:bg-[#161B22] h-full overflow-y-auto p-6 sm:p-8 shadow-xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
            isBento ? 'sm:rounded-l-2xl dark:bg-[#111827]' : ''
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                  Order &amp; Inquiry Request
                </p>
                <h2
                  id="marketplace-inquiry-title"
                  className={`mt-1 text-xl font-semibold text-[#0B1C30] dark:text-[#F8FAFC] ${
                    isSharp ? 'font-editorial' : isBento ? 'font-bento' : ''
                  }`}
                >
                  {activeItem.title}
                </h2>
                <p className="mt-1 text-sm font-mono font-semibold text-[#0B1C30] dark:text-slate-200 tabular-nums">
                  ${activeItem.price} {activeItem.currency} · {CATEGORY_LABELS[activeItem.category]}
                </p>
              </div>
              <button
                type="button"
                onClick={closeInquiry}
                aria-label="Close item request drawer"
                className={`inline-flex items-center justify-center h-11 w-11 lg:h-9 lg:w-9 border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1E2430] shrink-0 ${
                  isSharp ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className={`mt-4 border border-slate-200 dark:border-slate-800 bg-[#F8F9FF] dark:bg-[#1E2430] p-3.5 text-xs text-[#464554] dark:text-slate-300 ${
                isSharp ? 'rounded-none' : isBento ? 'rounded-xl' : 'rounded-lg'
              }`}
            >
              No online payment is charged now. Leave your name and phone number below (location, email, and higher education are optional) so our team can confirm delivery or file access.
            </div>

            <div className="mt-6">
              <LeadForm
                source="marketplace"
                itemId={activeItem.id}
                itemTitle={activeItem.title}
                submitLabel="Send Request"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'modern_bento') {
    const spotlight = !queryText.trim() && categoryFilter === 'all' ? filteredItems[0] : null;
    const gridItems = spotlight ? filteredItems.slice(1) : filteredItems;

    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-8">
        <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">Tools &amp; Publications</p>
              <h1 className="mt-1 font-bento text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Dalka Marketplace
              </h1>
              <p className="mt-1.5 text-sm text-[#475569] dark:text-slate-300 max-w-2xl">
                Reserve career playbooks, procurement kits, and field essentials without upfront online checkout.
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F4F6FB] dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 self-start">
              {(['all', 'digital_good', 'book', 'ecommerce'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-[#4648D4] dark:bg-[#6366F1] text-white'
                      : 'text-[#475569] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 relative max-w-md">
            <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search digital goods, books, or items..."
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4F6FB] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#4648D4]"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-10 text-center">
            <h2 className="font-bento text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              No marketplace items match your search
            </h2>
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setCategoryFilter('all');
              }}
              className="mt-4 h-10 px-5 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold"
            >
              Show All Items
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {spotlight && (
              <article className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[0_6px_28px_-8px_rgba(15,23,42,0.06)] dark:shadow-none">
                <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden">
                  <SafeImage
                    src={spotlight.imageUrl}
                    alt={spotlight.title}
                    className="w-full h-full object-cover"
                    fallbackIcon={<CategoryIcon category={spotlight.category} />}
                  />
                </div>
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#4648D4] dark:text-[#818CF8]">
                        Featured · {CATEGORY_LABELS[spotlight.category]}
                      </span>
                      <span className={spotlight.inStock ? 'text-[#006C49] dark:text-[#34D399]' : 'text-[#64748B]'}>
                        {spotlight.inStock ? 'Available Now' : 'Out of Stock'}
                      </span>
                    </div>
                    <h2 className="mt-2 font-bento text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {spotlight.title}
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed">
                      {spotlight.description}
                    </p>
                    {spotlight.deliveryNote && (
                      <p className="mt-3 text-xs text-[#64748B] dark:text-slate-400">{spotlight.deliveryNote}</p>
                    )}
                  </div>
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <span className="font-mono text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                      ${spotlight.price} {spotlight.currency}
                    </span>
                    <button
                      type="button"
                      disabled={!spotlight.inStock}
                      onClick={() => openInquiry(spotlight)}
                      className="h-11 px-6 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] disabled:opacity-50"
                    >
                      Request Item
                    </button>
                  </div>
                </div>
              </article>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridItems.map((item) => (
                <article
                  key={item.id}
                  className="group rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:shadow-none flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#EFF4FF] dark:bg-[#1E2430] overflow-hidden">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      fallbackIcon={<CategoryIcon category={item.category} />}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-[#64748B] dark:text-slate-400">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        <span className={item.inStock ? 'text-[#006C49] dark:text-[#34D399] font-semibold' : 'text-[#64748B]'}>
                          {item.inStock ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                      <h2 className="mt-1.5 font-bento text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm text-[#475569] dark:text-slate-300 line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <span className="font-mono text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                        ${item.price} {item.currency}
                      </span>
                      <button
                        type="button"
                        disabled={!item.inStock}
                        onClick={() => openInquiry(item)}
                        className="h-10 px-4 rounded-xl bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] disabled:opacity-50"
                      >
                        Request Item
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {renderDrawer()}
      </div>
    );
  }

  if (theme === 'swiss_editorial') {
    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-8">
        <div className="pb-5 border-b-2 border-[#0A0C10] dark:border-slate-200 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#4648D4] dark:text-[#818CF8]">
                Catalog Monograph · Publications &amp; Kits
              </p>
              <h1 className="mt-1 font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0C10] dark:text-[#F8FAFC]">
                Dalka Marketplace
              </h1>
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12151C] p-1 self-start">
              {(['all', 'digital_good', 'book', 'ecommerce'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`min-h-[36px] px-3 py-1 text-xs uppercase tracking-wider font-semibold transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-[#0A0C10] dark:bg-[#F8FAFC] text-white dark:text-[#0A0C10]'
                      : 'text-[#475569] dark:text-slate-400 hover:text-[#0A0C10] dark:hover:text-white'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search catalog..."
              className="w-full h-10 pl-9 pr-3 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12151C] text-sm text-[#0A0C10] dark:text-[#F1F5F9] focus:outline-none focus:border-[#4648D4]"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 p-10 text-center">
            <h2 className="font-editorial text-xl font-semibold text-[#0A0C10] dark:text-[#F8FAFC]">
              No catalog entries match your filter
            </h2>
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setCategoryFilter('all');
              }}
              className="mt-4 h-10 px-5 rounded-none bg-[#4648D4] text-white text-xs uppercase tracking-wider font-semibold"
            >
              Reset Catalog Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <article
                key={item.id}
                className="bg-white dark:bg-[#12151C] border border-slate-300 dark:border-slate-800 flex flex-col hover:border-[#0A0C10] dark:hover:border-slate-300 transition-colors"
              >
                <div className="aspect-[4/3] bg-[#F1F5F9] dark:bg-[#181C25] border-b border-slate-300 dark:border-slate-800 overflow-hidden">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    fallbackIcon={<CategoryIcon category={item.category} />}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
                      <span className="text-[#64748B] dark:text-slate-400">
                        CAT. {String(idx + 1).padStart(2, '0')} · {CATEGORY_LABELS[item.category]}
                      </span>
                      <span className={item.inStock ? 'text-[#006C49] dark:text-[#34D399]' : 'text-[#64748B]'}>
                        {item.inStock ? 'In Stock' : 'Unavailable'}
                      </span>
                    </div>
                    <h2 className="mt-2 font-editorial text-lg font-semibold text-[#0A0C10] dark:text-[#F8FAFC] leading-snug">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm text-[#334155] dark:text-slate-300 line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="font-mono text-base font-bold text-[#0A0C10] dark:text-[#F8FAFC] tabular-nums">
                      ${item.price} {item.currency}
                    </span>
                    <button
                      type="button"
                      disabled={!item.inStock}
                      onClick={() => openInquiry(item)}
                      className="h-10 px-4 rounded-none bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#4F46E5] disabled:opacity-50"
                    >
                      Request
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {renderDrawer()}
      </div>
    );
  }

  // Classic Editorial (Theme 1 — Default)
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12 space-y-6">
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
              Dalka Marketplace
            </h1>
            <p className="mt-1 text-sm text-[#464554] dark:text-slate-300 max-w-2xl">
              Digital toolkits, career and procurement books, and office essentials. No online payment required — submit your request and our team will coordinate delivery.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#EFF4FF] dark:bg-[#1E2430] border border-slate-200 dark:border-slate-700 self-start">
            {(['all', 'digital_good', 'book', 'ecommerce'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[38px] px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-[#161B22] text-[#0B1C30] dark:text-[#F8FAFC] shadow-xs'
                    : 'text-[#464554] dark:text-slate-400 hover:text-[#0B1C30] dark:hover:text-white'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 relative max-w-md">
          <Search className="h-4 w-4 text-[#64748B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search digital goods, books, or items..."
            className="w-full h-11 lg:h-[38px] pl-9 pr-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
          <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">No marketplace items match your search</h2>
          <button
            type="button"
            onClick={() => {
              setQueryText('');
              setCategoryFilter('all');
            }}
            className="mt-4 min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 rounded bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
          >
            Show All Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#EFF4FF] dark:bg-[#1E2430] border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  fallbackIcon={<CategoryIcon category={item.category} />}
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] dark:text-slate-400">
                    <span>{CATEGORY_LABELS[item.category]}</span>
                    <span className={item.inStock ? 'text-[#006C49] dark:text-[#34D399] font-medium' : 'text-[#64748B] dark:text-slate-400'}>
                      {item.inStock ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC] leading-snug">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#464554] dark:text-slate-300 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                  {item.deliveryNote && (
                    <p className="mt-3 text-xs text-[#64748B] dark:text-slate-400">{item.deliveryNote}</p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-lg font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
                    ${item.price} {item.currency}
                  </div>
                  <button
                    type="button"
                    disabled={!item.inStock}
                    onClick={() => openInquiry(item)}
                    className="min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 rounded bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] active:bg-[#4338CA] disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    Request Item
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {renderDrawer()}
    </div>
  );
}
