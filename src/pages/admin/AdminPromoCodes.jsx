import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { toast } from 'sonner';
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';

const TYPE_LABELS = { percent: '% OFF', flat: '$ OFF' };

function formatExpiry(expires_at) {
  if (!expires_at) return '—';
  const d = new Date(expires_at);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isExpired(expires_at) {
  return expires_at && new Date(expires_at) < new Date();
}

const DEFAULT_FORM = { code: '', type: 'percent', value: '', expires_at: '', max_uses: '' };

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const data = await api.promoCodes.list();
      setCodes(data);
    } catch {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.code.trim()) return setFormError('Code is required');
    if (!form.value || parseFloat(form.value) <= 0) return setFormError('Value must be a positive number');
    if (form.type === 'percent' && parseFloat(form.value) > 100) return setFormError('Percent cannot exceed 100');

    setSaving(true);
    try {
      const created = await api.promoCodes.create({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        expires_at: form.expires_at || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      });
      setCodes(prev => [created, ...prev]);
      setForm(DEFAULT_FORM);
      setShowForm(false);
      toast.success(`Promo code ${created.code} created`);
    } catch (err) {
      setFormError(err.message || 'Failed to create promo code');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await api.promoCodes.toggle(id);
      setCodes(prev => prev.map(c => c.id === id ? updated : c));
      toast.success(updated.is_active ? 'Code activated' : 'Code deactivated');
    } catch {
      toast.error('Failed to update code');
    }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return;
    try {
      await api.promoCodes.delete(id);
      setCodes(prev => prev.filter(c => c.id !== id));
      toast.success('Promo code deleted');
    } catch {
      toast.error('Failed to delete promo code');
    }
  };

  const inputCls = 'w-full bg-background border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">PROMO CODES</h1>
          <p className="text-[10px] text-muted-foreground tracking-wider mt-0.5">
            {codes.length} code{codes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setFormError(''); setForm(DEFAULT_FORM); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'CANCEL' : 'NEW CODE'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="border border-border bg-card p-5">
          <p className="text-[10px] text-muted-foreground tracking-widest mb-4">CREATE PROMO CODE</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-1">CODE *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER20"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-1">TYPE *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={inputCls}
                >
                  <option value="percent">Percentage (% off)</option>
                  <option value="flat">Flat amount ($ off)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-1">
                  VALUE * {form.type === 'percent' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === 'percent' ? '10' : '5.00'}
                  min="0.01"
                  step="0.01"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-1">EXPIRY DATE (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-1">MAX USES (optional)</label>
                <input
                  type="number"
                  value={form.max_uses}
                  onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                  placeholder="Unlimited"
                  min="1"
                  className={inputCls}
                />
              </div>
            </div>
            {formError && (
              <p className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2">{formError}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground px-6 py-2 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'CREATING...' : 'CREATE CODE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : codes.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-xs text-muted-foreground tracking-wider">NO PROMO CODES YET</p>
          <p className="text-[10px] text-muted-foreground mt-1">Create your first promo code above</p>
        </div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground tracking-widest font-normal">CODE</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground tracking-widest font-normal">DISCOUNT</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground tracking-widest font-normal">EXPIRY</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground tracking-widest font-normal">USES</th>
                <th className="text-left px-4 py-3 text-[10px] text-muted-foreground tracking-widest font-normal">STATUS</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {codes.map(c => {
                const expired = isExpired(c.expires_at);
                const maxed = c.max_uses !== null && c.uses_count >= c.max_uses;
                const effectivelyInactive = !c.is_active || expired || maxed;
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-bold tracking-widest">{c.code}</td>
                    <td className="px-4 py-3 text-primary font-bold">
                      {c.type === 'percent' ? `${parseFloat(c.value)}%` : `$${parseFloat(c.value).toFixed(2)}`}
                      <span className="ml-1 text-[10px] text-muted-foreground font-normal">{TYPE_LABELS[c.type]}</span>
                    </td>
                    <td className={`px-4 py-3 ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatExpiry(c.expires_at)}
                      {expired && <span className="ml-1 text-[9px]">(expired)</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.uses_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wider border ${
                        effectivelyInactive
                          ? 'border-border text-muted-foreground'
                          : 'border-green-500/30 text-green-500 bg-green-500/10'
                      }`}>
                        {effectivelyInactive ? (expired ? 'EXPIRED' : maxed ? 'MAXED' : 'INACTIVE') : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggle(c.id)}
                          title={c.is_active ? 'Deactivate' : 'Activate'}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {c.is_active
                            ? <ToggleRight className="w-4 h-4 text-primary" />
                            : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          title="Delete"
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
