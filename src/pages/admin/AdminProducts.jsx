import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Check, Upload } from 'lucide-react';

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
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageInput, setImageInput] = useState('');

  const load = () => {
    base44.entities.Product.list('-created_date').then(p => {
      setProducts(p);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (p) => { setForm({ ...p, price: String(p.price || ''), compare_price: String(p.compare_price || ''), stock: String(p.stock || '') }); setEditing(p.id); };

  const save = async () => {
    setSaving(true);
    const data = {
      ...form,
      price: parseFloat(form.price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : undefined,
      stock: parseInt(form.stock) || 0,
    };
    if (editing === 'new') {
      await base44.entities.Product.create(data);
    } else {
      await base44.entities.Product.update(editing, data);
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    await base44.entities.Product.delete(id);
    load();
  };

  const toggleSize = (s) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes?.includes(s) ? f.sizes.filter(x => x !== s) : [...(f.sizes || []), s]
    }));
  };

  const addImage = () => {
    if (!imageInput.trim()) return;
    setForm(f => ({ ...f, images: [...(f.images || []), imageInput.trim()] }));
    setImageInput('');
  };

  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-widest">PRODUCTS</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold tracking-wider hover:bg-primary/90 transition-colors rounded">
          <Plus className="w-4 h-4" /> ADD PRODUCT
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">No products yet. Add your first drop.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">PRODUCT</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden md:table-cell">CATEGORY</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">PRICE</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden sm:table-cell">STOCK</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden sm:table-cell">STATUS</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 object-cover rounded bg-secondary" />}
                      <div>
                        <p className="font-bold">{p.name}</p>
                        {p.badge && <span className="text-[9px] text-accent tracking-wider">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize hidden md:table-cell">{p.category}</td>
                  <td className="px-4 py-3 font-bold">${p.price}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.stock ?? '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${p.is_active ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                      {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit / New Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-xl bg-background border-l border-border h-full overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-sm font-bold tracking-widest">{editing === 'new' ? 'NEW PRODUCT' : 'EDIT PRODUCT'}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="PRODUCT NAME *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
              <Field label="SKU / SLUG" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} placeholder="auto-generated if empty" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="PRICE *" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" placeholder="0.00" />
                <Field label="COMPARE PRICE" value={form.compare_price} onChange={v => setForm(f => ({ ...f, compare_price: v }))} type="number" placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="CATEGORY" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={CATS} />
                <SelectField label="BADGE" value={form.badge || ''} onChange={v => setForm(f => ({ ...f, badge: v }))} options={BADGES} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="STOCK QTY" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" />
                <Field label="ORIGIN" value={form.origin} onChange={v => setForm(f => ({ ...f, origin: v }))} />
              </div>
              <Field label="MATERIALS" value={form.materials} onChange={v => setForm(f => ({ ...f, materials: v }))} />
              <Field label="FABRIC WEIGHT" value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} />
              <TextareaField label="DESCRIPTION" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />

              {/* Sizes */}
              <div>
                <label className="text-[10px] text-muted-foreground tracking-widest font-bold block mb-2">AVAILABLE SIZES</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-wider border transition-colors ${form.sizes?.includes(s) ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-[10px] text-muted-foreground tracking-widest font-bold block mb-2">PRODUCT IMAGES (URLs)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addImage()}
                    placeholder="Paste image URL..."
                    className="flex-1 bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button onClick={addImage} className="bg-primary text-primary-foreground px-3 py-2 text-xs font-bold hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.images?.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} className="w-16 h-16 object-cover bg-secondary rounded" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      ><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <Toggle label="ACTIVE" value={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Toggle label="FEATURED" value={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} />
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="w-full bg-primary text-primary-foreground py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'SAVING...' : 'SAVE PRODUCT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="text-[10px] text-muted-foreground tracking-widest font-bold block mb-1">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
    />
  </div>
);

const TextareaField = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] text-muted-foreground tracking-widest font-bold block mb-1">{label}</label>
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      rows={4}
      className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[10px] text-muted-foreground tracking-widest font-bold block mb-1">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-secondary border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
    >
      {options.map(o => <option key={o} value={o}>{o || '— none —'}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`flex items-center gap-2 px-3 py-2 border text-[10px] font-bold tracking-wider transition-colors ${value ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}
  >
    {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    {label}
  </button>
);
