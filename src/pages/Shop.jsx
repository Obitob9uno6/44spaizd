import { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/client';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { value: '', label: 'ALL' },
  { value: 'tees', label: 'TEES' },
  { value: 'hoodies', label: 'HOODIES' },
  { value: 'outerwear', label: 'OUTERWEAR' },
  { value: 'pants', label: 'PANTS' },
  { value: 'headwear', label: 'HEADWEAR' },
  { value: 'accessories', label: 'ACCESSORIES' },
];

const SORT_OPTIONS = [
  { value: '-created_date', label: 'NEWEST' },
  { value: 'price', label: 'PRICE: LOW → HIGH' },
  { value: '-price', label: 'PRICE: HIGH → LOW' },
];

export default function Shop() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-created_date');
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setCategory(cat);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const results = await api.products.filter({ is_active: true }, sort, 200);
        setAllProducts(results);
      } catch {}
      setLoading(false);
    }
    load();
  }, [sort]);

  const products = useMemo(() => {
    let list = allProducts;
    if (category) list = list.filter(p => p.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) list = list.filter(p => parseFloat(p.price) >= min);
    if (!isNaN(max)) list = list.filter(p => parseFloat(p.price) <= max);
    return list;
  }, [allProducts, category, query, minPrice, maxPrice]);

  const hasPriceFilter = minPrice !== '' || maxPrice !== '';
  const clearSearch = () => setQuery('');
  const clearPriceFilter = () => { setMinPrice(''); setMaxPrice(''); };

  return (
    <div className="pt-16">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] text-primary tracking-widest font-bold mb-2 block">CATALOG</span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              {query ? `SEARCH RESULTS` : category ? CATEGORIES.find(c => c.value === category)?.label || 'SHOP' : 'ALL PRODUCTS'}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Search bar */}
      <div className="border-b border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS..."
              className="w-full bg-background border border-border pl-9 pr-8 py-2.5 text-[11px] tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 text-[10px] font-bold tracking-widest transition-colors border ${
                      category === cat.value
                        ? 'border-primary text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPriceFilter(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-widest border transition-colors ${
                    showPriceFilter || hasPriceFilter
                      ? 'border-primary text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  PRICE
                  {hasPriceFilter && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-secondary border border-border px-3 py-1.5 text-[10px] font-bold tracking-wider text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price range filter */}
            {showPriceFilter && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-muted-foreground tracking-wider">PRICE RANGE</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      placeholder="MIN"
                      min="0"
                      className="w-24 bg-background border border-border pl-5 pr-2 py-1.5 text-[10px] tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">—</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      placeholder="MAX"
                      min="0"
                      className="w-24 bg-background border border-border pl-5 pr-2 py-1.5 text-[10px] tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  {hasPriceFilter && (
                    <button
                      onClick={clearPriceFilter}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" /> CLEAR
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xs text-muted-foreground tracking-wider mb-3">
              {query ? `NO RESULTS FOR "${query.toUpperCase()}"` : 'NO PRODUCTS FOUND'}
            </p>
            {query && (
              <button
                onClick={clearSearch}
                className="text-[10px] text-primary font-bold tracking-wider hover:underline"
              >
                CLEAR SEARCH
              </button>
            )}
          </div>
        ) : (
          <>
            {query && (
              <p className="text-[10px] text-muted-foreground tracking-wider mb-6">
                {products.length} {products.length === 1 ? 'RESULT' : 'RESULTS'} FOR "{query.toUpperCase()}"
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
