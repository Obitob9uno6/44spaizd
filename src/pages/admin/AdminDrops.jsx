import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Zap, Check } from 'lucide-react';

export default function AdminDrops() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    api.products.list('-created_date').then(p => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const setBadge = async (id, badge) => {
    setSaving(id);
    await api.products.update(id, { badge });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, badge } : p));
    setSaving(null);
  };

  const toggleFeatured = async (id, featured) => {
    setSaving(id + 'f');
    await api.products.update(id, { featured: !featured });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !featured } : p));
    setSaving(null);
  };

  const BADGES = ['', 'NEW', 'LIMITED', 'SOLD OUT', 'POPULAR'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Zap className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold tracking-widest">DROPS MANAGER</h1>
      </div>
      <p className="text-xs text-muted-foreground tracking-wider mb-6">Control drop status, badges, and featured placement for your collection.</p>

      {loading ? (
        <div className="text-center text-muted-foreground text-xs py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-card border border-border rounded p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {p.images?.[0] && <img src={p.images[0]} className="w-12 h-12 object-cover rounded bg-secondary flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wider truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">${p.price} — {p.category}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Badge selector */}
                <div className="flex gap-1">
                  {BADGES.map(b => (
                    <button
                      key={b}
                      onClick={() => setBadge(p.id, b)}
                      disabled={saving === p.id}
                      className={`px-2 py-1 text-[9px] font-bold tracking-wider border transition-colors ${p.badge === b ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground'}`}
                    >
                      {b || 'NONE'}
                    </button>
                  ))}
                </div>

                {/* Featured toggle */}
                <button
                  onClick={() => toggleFeatured(p.id, p.featured)}
                  disabled={saving === p.id + 'f'}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold tracking-wider border transition-colors ${p.featured ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}`}
                >
                  {p.featured && <Check className="w-3 h-3" />}
                  FEATURED
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
