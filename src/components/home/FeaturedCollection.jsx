import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard';

export default function FeaturedCollection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const all = await api.products.filter({ featured: true, is_active: true }, '-created_date', 6);
      setProducts(all);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
        <div>
          <span className="text-[10px] text-primary tracking-widest font-bold mb-2 block">FEATURED</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            COLLECTION
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          VIEW ALL <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-20">No featured products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      )}
    </section>
  );
}
