import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SETTING_KEYS = [
  { key: 'store_name', label: 'Store Name', placeholder: 'SPAIZD', type: 'text' },
  { key: 'tagline', label: 'Tagline', placeholder: 'Good Vibes, Better Fits', type: 'text' },
  { key: 'contact_email', label: 'Contact Email', placeholder: 'hello@spaizd.com', type: 'email' },
  { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/spaizd', type: 'url' },
  { key: 'social_twitter', label: 'Twitter / X URL', placeholder: 'https://x.com/spaizd', type: 'url' },
  { key: 'social_tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@spaizd', type: 'url' },
  { key: 'free_shipping_threshold', label: 'Free Shipping Threshold ($)', placeholder: '150', type: 'number' },
];

export default function AdminStoreSettings() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.settings.getAll()
      .then(data => {
        const mapped = {};
        for (const sk of SETTING_KEYS) {
          mapped[sk.key] = data[sk.key] || '';
        }
        setValues(mapped);
      })
      .catch(err => setError(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const sk of SETTING_KEYS) {
        await api.settings.set(sk.key, values[sk.key] || '');
      }
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-widest">STORE SETTINGS</h1>
          <p className="text-[10px] text-muted-foreground mt-1">Configure your store-wide settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold tracking-wider hover:bg-primary/90 transition-colors rounded disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'SAVING...' : 'SAVE ALL'}
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded p-4 sm:p-6 space-y-5">
          {SETTING_KEYS.map(sk => (
            <div key={sk.key}>
              <label className="block text-[10px] font-bold tracking-widest text-muted-foreground mb-1.5">
                {sk.label.toUpperCase()}
              </label>
              <input
                type={sk.type}
                value={values[sk.key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [sk.key]: e.target.value }))}
                placeholder={sk.placeholder}
                className="w-full bg-secondary border border-border px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded transition-colors"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
