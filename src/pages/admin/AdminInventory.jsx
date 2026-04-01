import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Save, AlertTriangle, Package, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const p = await api.products.list('name', 200);
      setProducts(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setEdit = (id, val) => {
    setEdits(e => ({ ...e, [id]: val }));
  };

  const saveStock = async (id) => {
    const val = edits[id];
    if (val === undefined || val === '') return;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await api.products.updateStock(id, parseInt(val));
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: parseInt(val) } : p));
      setEdits(e => { const c = { ...e }; delete c[id]; return c; });
      toast.success('Stock updated');
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setSaving(s => { const c = { ...s }; delete c[id]; return c; });
    }
  };

  const handleKey = (e, id) => {
    if (e.key === 'Enter') saveStock(id);
    if (e.key === 'Escape') setEdits(prev => { const c = { ...prev }; delete c[id]; return c; });
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    const stock = parseInt(p.stock) || 0;
    if (filter === 'out') return matchSearch && stock === 0;
    if (filter === 'low') return matchSearch && stock > 0 && stock <= 5;
    if (filter === 'ok') return matchSearch && stock > 5;
    return matchSearch;
  });

  const outCount = products.filter(p => (parseInt(p.stock) || 0) === 0).length;
  const lowCount = products.filter(p => { const s = parseInt(p.stock) || 0; return s > 0 && s <= 5; }).length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0) * (parseInt(p.stock) || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-widest">INVENTORY</h1>
          <p className="text-[10px] text-muted-foreground mt-1">Manage stock levels across your collection</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'TOTAL PRODUCTS', value: products.length, icon: Package, color: 'text-primary' },
          { label: 'OUT OF STOCK', value: outCount, icon: AlertTriangle, color: outCount > 0 ? 'text-destructive' : 'text-muted-foreground' },
          { label: 'LOW STOCK (≤5)', value: lowCount, icon: AlertTriangle, color: lowCount > 0 ? 'text-yellow-400' : 'text-muted-foreground' },
          { label: 'INVENTORY VALUE', value: `$${totalValue.toFixed(0)}`, icon: Package, color: 'text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded p-4">
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <p className="text-xl font-bold">{loading ? '—' : value}</p>
            <p className="text-[9px] text-muted-foreground tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-secondary border border-border pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: `ALL (${products.length})` },
            { value: 'out', label: `OUT (${outCount})` },
            { value: 'low', label: `LOW (${lowCount})` },
            { value: 'ok', label: `OK (${products.length - outCount - lowCount})` },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-2 text-[10px] font-bold tracking-wider border rounded transition-colors ${
                filter === opt.value
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-muted-foreground hover:border-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-muted-foreground">No products match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">PRODUCT</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden md:table-cell">CATEGORY</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden sm:table-cell">PRICE</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">STOCK</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden lg:table-cell">VALUE</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">STATUS</th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const stock = parseInt(p.stock) || 0;
                  const currentEdit = edits[p.id];
                  const hasEdit = currentEdit !== undefined;
                  const stockStatus = stock === 0 ? 'out' : stock <= 5 ? 'low' : 'ok';

                  return (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} className="w-9 h-9 object-cover rounded bg-secondary flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 bg-secondary rounded flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-bold leading-tight">{p.name}</p>
                            {p.sku && <p className="text-[10px] text-muted-foreground">{p.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize hidden md:table-cell">{p.category}</td>
                      <td className="px-4 py-3 font-bold hidden sm:table-cell">${parseFloat(p.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={hasEdit ? currentEdit : stock}
                          onChange={e => setEdit(p.id, e.target.value)}
                          onKeyDown={e => handleKey(e, p.id)}
                          className={`w-20 bg-secondary border px-2 py-1.5 text-xs font-bold text-center focus:outline-none rounded transition-colors ${
                            hasEdit ? 'border-primary text-primary' : 'border-border text-foreground'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        ${(parseFloat(p.price || 0) * stock).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold tracking-wider px-2 py-1 rounded border ${
                          stockStatus === 'out' ? 'bg-destructive/15 text-destructive border-destructive/30' :
                          stockStatus === 'low' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                          'bg-green-500/15 text-green-400 border-green-500/30'
                        }`}>
                          {stockStatus === 'out' ? 'OUT' : stockStatus === 'low' ? 'LOW' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hasEdit && (
                          <button
                            onClick={() => saveStock(p.id)}
                            disabled={saving[p.id]}
                            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 py-1.5 text-[10px] font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {saving[p.id] ? <div className="w-3 h-3 border border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
                            SAVE
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {filtered.length > 0 && (
        <p className="text-[10px] text-muted-foreground mt-3 text-center">
          Click on a stock number to edit it, then press Enter or click SAVE
        </p>
      )}
    </div>
  );
}
