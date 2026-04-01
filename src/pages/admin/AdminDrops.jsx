import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Zap, Check, Star, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';

const BADGES = ['', 'NEW', 'LIMITED', 'SOLD OUT', 'POPULAR'];

const badgeColor = (b) => ({
  'NEW': 'bg-green-500/15 text-green-400 border-green-500/40',
  'LIMITED': 'bg-primary/15 text-primary border-primary/40',
  'SOLD OUT': 'bg-muted text-muted-foreground border-border',
  'POPULAR': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40',
  '': 'border-border text-muted-foreground',
}[b] || 'border-border text-muted-foreground');

export default function AdminDrops() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.products.list('-created_date', 200).then(p => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const setBadge = async (id, badge) => {
    setSaving(id + '_badge');
    try {
      await api.products.update(id, { badge });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, badge } : p));
      toast.success(badge ? `Badge set to ${badge}` : 'Badge removed');
    } catch {
      toast.error('Failed to update badge');
    } finally {
      setSaving(null);
    }
  };

  const toggleFeatured = async (id, featured) => {
    setSaving(id + '_featured');
    try {
      await api.products.update(id, { featured: !featured });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !featured } : p));
      toast.success(!featured ? 'Added to featured' : 'Removed from featured');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (id, is_active) => {
    setSaving(id + '_active');
    try {
      await api.products.update(id, { is_active: !is_active });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !is_active } : p));
      toast.success(!is_active ? 'Product visible' : 'Product hidden');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const filtered = !search
    ? products
    : products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  const featuredCount = products.filter(p => p.featured).length;
  const activeCount = products.filter(p => p.is_active).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Zap className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold tracking-widest">DROPS MANAGER</h1>
      </div>
      <p className="text-xs text-muted-foreground tracking-wide mb-2">
        Control drop badges, featured placement, and visibility for your collection.
      </p>
      <div className="flex gap-3 text-[10px] text-muted-foreground mb-6">
        <span><span className="text-primary font-bold">{featuredCount}</span> featured</span>
        <span>·</span>
        <span><span className="text-green-400 font-bold">{activeCount}</span> active</span>
        <span>·</span>
        <span>{products.length} total</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-secondary border border-border pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded"
        />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const isSavingBadge = saving === p.id + '_badge';
            const isSavingFeat = saving === p.id + '_featured';
            const isSavingActive = saving === p.id + '_active';

            return (
              <div key={p.id} className="bg-card border border-border rounded p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Product info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} className="w-12 h-12 object-cover rounded bg-secondary" />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded" />
                      )}
                      {!p.is_active && (
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold tracking-wider truncate">{p.name}</p>
                        {p.featured && <Star className="w-3 h-3 text-primary fill-primary flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">${Number(p.price).toFixed(2)} · {p.category}</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge selector */}
                    <div className="flex flex-wrap gap-1">
                      {BADGES.map(b => (
                        <button
                          key={b}
                          onClick={() => setBadge(p.id, b)}
                          disabled={isSavingBadge}
                          title={b || 'No badge'}
                          className={`px-2 py-1 text-[9px] font-bold tracking-wider border rounded transition-colors ${
                            p.badge === b
                              ? badgeColor(b)
                              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                          } disabled:opacity-50`}
                        >
                          {b || 'NONE'}
                        </button>
                      ))}
                    </div>

                    {/* Feature toggle */}
                    <button
                      onClick={() => toggleFeatured(p.id, p.featured)}
                      disabled={isSavingFeat}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-wider border rounded transition-colors disabled:opacity-50 ${
                        p.featured
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${p.featured ? 'fill-primary' : ''}`} />
                      FEATURED
                    </button>

                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(p.id, p.is_active)}
                      disabled={isSavingActive}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-wider border rounded transition-colors disabled:opacity-50 ${
                        p.is_active
                          ? 'border-green-500/50 text-green-400 bg-green-500/10'
                          : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.is_active ? 'VISIBLE' : 'HIDDEN'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
