import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-created_date');

  // Read initial category from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setCategory(cat);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let results;
      if (category) {
        results = await base44.entities.Product.filter({ category, is_active: true }, sort, 50);
      } else {
        results = await base44.entities.Product.filter({ is_active: true }, sort, 50);
      }
      setProducts(results);
      setLoading(false);
    }
    load();
  }, [category, sort]);

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] text-primary tracking-widest font-bold mb-2 block">CATALOG</span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              {category ? CATEGORIES.find(c => c.value === category)?.label || 'SHOP' : 'ALL PRODUCTS'}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Categories */}
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

            {/* Sort */}
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
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-xs text-muted-foreground tracking-wider">NO PRODUCTS FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}

        {/* Count */}
        <div className="mt-8 text-center">
          <span className="text-[10px] text-muted-foreground tracking-widest">
            {products.length} ITEM{products.length !== 1 ? 'S' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
