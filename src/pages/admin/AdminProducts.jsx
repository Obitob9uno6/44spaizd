import { useEffect, useState, useRef } from 'react';
import { api, uploadImage } from '@/api/client';
import { Plus, Pencil, Trash2, X, Check, ImagePlus, GripVertical, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = {
  name: '', slug: '', price: '', compare_price: '', category: 'tees',
  description: '', materials: '', weight: '', sizes: [], images: [],
  stock: '', badge: '', featured: false, is_active: true, sku: '', origin: ''
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'];
const CATS = ['tees', 'hoodies', 'pants', 'outerwear', 'headwear', 'accessories'];
const BADGES = ['', 'NEW', 'LIMITED', 'SOLD OUT', 'POPULAR'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const p = await api.products.list('-created_date', 200);
      setProducts(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setImageUrl(''); setEditing('new'); };
  const openEdit = (p) => {
    setForm({
      ...p,
      price: String(p.price || ''),
      compare_price: String(p.compare_price || ''),
      stock: String(p.stock || ''),
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      images: Array.isArray(p.images) ? p.images : [],
    });
    setImageUrl('');
    setEditing(p.id);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price) || 0,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock) || 0,
      };
      if (editing === 'new') {
        await api.products.create(data);
        toast.success('Product created');
      } else {
        await api.products.update(editing, data);
        toast.success('Product saved');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.products.delete(id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const toggleSize = (s) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes?.includes(s) ? f.sizes.filter(x => x !== s) : [...(f.sizes || []), s]
    }));
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    setForm(f => ({ ...f, images: [...(f.images || []), imageUrl.trim()] }));
    setImageUrl('');
  };

  const handleFileUpload = async (files) => {
    const fileArr = Array.from(files);
    setUploading(true);
    try {
      const urls = await Promise.all(fileArr.map(f => uploadImage(f).then(r => r.url)));
      setForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  const moveImage = (from, to) => {
    setForm(f => {
      const imgs = [...f.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...f, images: imgs };
    });
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-widest">PRODUCTS</h1>
          <p className="text-[10px] text-muted-foreground mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold tracking-wider hover:bg-primary/90 transition-colors rounded"
        >
          <Plus className="w-4 h-4" /> ADD PRODUCT
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-secondary border border-border pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
        >
          <option value="">All categories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-muted-foreground">No products found.</p>
            <button onClick={openNew} className="mt-3 text-xs text-primary font-bold tracking-wider">+ Add your first product</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">PRODUCT</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden md:table-cell">CATEGORY</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">PRICE</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden sm:table-cell">STOCK</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden sm:table-cell">STATUS</th>
                  <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden lg:table-cell">BADGE</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} className="w-10 h-10 object-cover rounded bg-secondary" />
                          ) : (
                            <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                              <ImagePlus className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold leading-tight">{p.name}</p>
                          {p.sku && <p className="text-[10px] text-muted-foreground">{p.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold">${Number(p.price).toFixed(2)}</span>
                        {p.compare_price && p.compare_price > p.price && (
                          <span className="text-muted-foreground line-through ml-1">${Number(p.compare_price).toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`font-bold ${(p.stock || 0) === 0 ? 'text-destructive' : (p.stock || 0) < 5 ? 'text-yellow-400' : 'text-foreground'}`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${p.is_active ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                        {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.badge && <span className="text-[10px] font-bold text-primary tracking-wider">{p.badge}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => del(p.id)}
                          disabled={deleting === p.id}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / New Drawer */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative ml-auto w-full max-w-2xl bg-background border-l border-border h-full flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-sm font-bold tracking-widest">{editing === 'new' ? 'NEW PRODUCT' : 'EDIT PRODUCT'}</h2>
                {editing !== 'new' && <p className="text-[10px] text-muted-foreground mt-0.5">ID: {editing?.slice(0, 8)}...</p>}
              </div>
              <button onClick={() => setEditing(null)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Basic Info */}
              <Section title="BASIC INFO">
                <Field label="Product Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Cali Sun Tee" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} placeholder="SPAIZD-001" />
                  <Field label="Slug / URL" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} placeholder="cali-sun-tee" />
                </div>
                <TextareaField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} rows={3} />
              </Section>

              {/* Pricing & Category */}
              <Section title="PRICING & CATEGORY">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price *" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" placeholder="0.00" />
                  <Field label="Compare Price" value={form.compare_price} onChange={v => setForm(f => ({ ...f, compare_price: v }))} type="number" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={CATS} />
                  <SelectField label="Badge" value={form.badge || ''} onChange={v => setForm(f => ({ ...f, badge: v }))} options={BADGES} labels={{ '': '— None —' }} />
                </div>
              </Section>

              {/* Images */}
              <Section title="IMAGES">
                {/* Upload zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-border rounded p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="w-6 h-6 text-muted-foreground" />
                      <p className="text-xs font-bold tracking-wider">DRAG & DROP or CLICK TO UPLOAD</p>
                      <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP · Max 10MB each</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files?.length && handleFileUpload(e.target.files)}
                />
                {/* URL input */}
                <div className="flex gap-2">
                  <input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addImageUrl()}
                    placeholder="Or paste image URL..."
                    className="flex-1 bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded"
                  />
                  <button
                    onClick={addImageUrl}
                    className="bg-primary text-primary-foreground px-3 py-2 text-xs font-bold hover:bg-primary/90 transition-colors rounded"
                  >
                    ADD
                  </button>
                </div>
                {/* Image grid */}
                {form.images?.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={img} className="w-full h-full object-cover rounded bg-secondary" />
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[8px] text-center font-bold py-0.5 rounded-b">MAIN</div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                          {i > 0 && (
                            <button onClick={() => moveImage(i, i - 1)} className="w-6 h-6 bg-white/20 rounded text-white text-[10px] font-bold">←</button>
                          )}
                          <button
                            onClick={() => removeImage(i)}
                            className="w-6 h-6 bg-destructive/80 rounded flex items-center justify-center"
                          >
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                          {i < form.images.length - 1 && (
                            <button onClick={() => moveImage(i, i + 1)} className="w-6 h-6 bg-white/20 rounded text-white text-[10px] font-bold">→</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Inventory */}
              <Section title="INVENTORY">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Stock Quantity" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" placeholder="0" />
                  <Field label="Origin" value={form.origin} onChange={v => setForm(f => ({ ...f, origin: v }))} placeholder="Los Angeles, CA" />
                </div>
              </Section>

              {/* Details */}
              <Section title="PRODUCT DETAILS">
                <Field label="Materials" value={form.materials} onChange={v => setForm(f => ({ ...f, materials: v }))} placeholder="100% organic cotton" />
                <Field label="Fabric Weight" value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} placeholder="220 GSM" />
              </Section>

              {/* Sizes */}
              <Section title="AVAILABLE SIZES">
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-wider border rounded transition-colors ${
                        form.sizes?.includes(s)
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Visibility */}
              <Section title="VISIBILITY">
                <div className="flex gap-3">
                  <Toggle label="Active (visible in shop)" value={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} />
                  <Toggle label="Featured on homepage" value={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} />
                </div>
              </Section>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 text-xs font-bold tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground transition-colors rounded">
                CANCEL
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-[2] bg-primary text-primary-foreground py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded"
              >
                {saving ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'SAVING...' : editing === 'new' ? 'CREATE PRODUCT' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div>
    <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-3 border-b border-border pb-1">{title}</p>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="text-[10px] text-muted-foreground tracking-wider font-bold block mb-1">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded transition-colors"
    />
  </div>
);

const TextareaField = ({ label, value, onChange, rows = 4 }) => (
  <div>
    <label className="text-[10px] text-muted-foreground tracking-wider font-bold block mb-1">{label}</label>
    <textarea
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none rounded transition-colors"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, labels = {} }) => (
  <div>
    <label className="text-[10px] text-muted-foreground tracking-wider font-bold block mb-1">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary rounded transition-colors"
    >
      {options.map(o => <option key={o} value={o}>{labels[o] ?? (o || '— None —')}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`flex items-center gap-2 px-3 py-2 border text-[10px] font-bold tracking-wider transition-colors rounded ${
      value ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50'
    }`}
  >
    <div className={`w-3 h-3 rounded-sm border ${value ? 'bg-primary border-primary' : 'border-muted-foreground'} flex items-center justify-center`}>
      {value && <Check className="w-2 h-2 text-primary-foreground" />}
    </div>
    {label}
  </button>
);
