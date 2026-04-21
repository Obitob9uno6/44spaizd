import { useState, useEffect } from 'react';
import { Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_SECTIONS = {
  hero: {
    heading1: 'GOOD VIBES,',
    heading2: 'BETTER FITS',
    subheading: 'California-grown streetwear for the laid-back and deliberate. Sun-soaked fabrics, slow fashion, real culture.',
    buttonText: 'EXPLORE COLLECTION',
    buttonLink: '/shop',
  },
  about: {
    title: 'ABOUT SPAIZD',
    description: 'SPAIZD is a California-based streetwear brand committed to premium, sustainable clothing.',
    features: [
      { title: 'PREMIUM QUALITY', description: 'High-quality materials and craftsmanship' },
      { title: 'SUSTAINABLE FASHION', description: 'Eco-friendly production practices' },
      { title: 'CALI CULTURE', description: 'Authentic California streetwear aesthetic' },
    ],
  },
  vip: {
    title: 'VIP CLUB',
    description: 'Sun\'s out, drip\'s out. Get early access to drops, exclusive Cali colorways, and member-only pricing.',
    features: [
      { icon: '⏰', title: 'EARLY ACCESS', desc: 'Get first pick on drops — 24 to 72 hours before everyone else.' },
      { icon: '⚡', title: 'EXCLUSIVE DROPS', desc: 'Cali-only colorways, limited runs, and members-only pieces.' },
      { icon: '🏷️', title: 'MEMBER PRICING', desc: 'Up to 20% off every order, always. Plus free shipping.' },
    ],
  },
};

export default function AdminContent() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Try to load from Blob storage, fallback to defaults
      for (const key of Object.keys(DEFAULT_SECTIONS)) {
        try {
          const res = await fetch(`/api/content/${key}`);
          if (res.ok) {
            const data = await res.json();
            setSections(prev => ({ ...prev, [key]: data.data || DEFAULT_SECTIONS[key] }));
          }
        } catch (err) {
          console.warn(`Failed to load ${key}:`, err);
        }
      }
    } catch (err) {
      console.error('Load content error:', err);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem('spaizd_admin_token');
      
      for (const [key, data] of Object.entries(sections)) {
        const res = await fetch(`/api/content/${key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || 'admin'}`,
          },
          body: JSON.stringify({ data }),
        });
        if (!res.ok) {
          throw new Error(`Failed to save ${key}`);
        }
      }
      toast.success('Content saved successfully');
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section, key, value) => {
    setSections(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CONTENT MANAGEMENT</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit homepage and section content</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-secondary border border-border hover:border-primary transition-colors"
          >
            <Eye className="w-4 h-4" />
            {preview ? 'HIDE' : 'PREVIEW'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold tracking-tight">HERO SECTION</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Heading Line 1"
            value={sections.hero.heading1}
            onChange={e => updateSection('hero', 'heading1', e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="Heading Line 2"
            value={sections.hero.heading2}
            onChange={e => updateSection('hero', 'heading2', e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
          />
          <textarea
            placeholder="Subheading / Description"
            value={sections.hero.subheading}
            onChange={e => updateSection('hero', 'subheading', e.target.value)}
            rows={3}
            className="lg:col-span-2 px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary resize-none"
          />
          <input
            type="text"
            placeholder="Button Text"
            value={sections.hero.buttonText}
            onChange={e => updateSection('hero', 'buttonText', e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="Button Link"
            value={sections.hero.buttonLink}
            onChange={e => updateSection('hero', 'buttonLink', e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* About Section */}
      <div className="border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold tracking-tight">ABOUT SECTION</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="About Title"
            value={sections.about.title}
            onChange={e => updateSection('about', 'title', e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
          />
          <textarea
            placeholder="About Description"
            value={sections.about.description}
            onChange={e => updateSection('about', 'description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary resize-none"
          />
          <div className="space-y-2">
            <p className="text-xs font-bold">FEATURES</p>
            {sections.about.features.map((feature, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Feature Title"
                  value={feature.title}
                  onChange={e => {
                    const newFeatures = [...sections.about.features];
                    newFeatures[idx].title = e.target.value;
                    updateSection('about', 'features', newFeatures);
                  }}
                  className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Feature Description"
                  value={feature.description}
                  onChange={e => {
                    const newFeatures = [...sections.about.features];
                    newFeatures[idx].description = e.target.value;
                    updateSection('about', 'features', newFeatures);
                  }}
                  className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIP Section */}
      <div className="border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold tracking-tight">VIP SECTION</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="VIP Title"
            value={sections.vip.title}
            onChange={e => updateSection('vip', 'title', e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
          />
          <textarea
            placeholder="VIP Description"
            value={sections.vip.description}
            onChange={e => updateSection('vip', 'description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary resize-none"
          />
          <div className="space-y-2">
            <p className="text-xs font-bold">VIP FEATURES</p>
            {sections.vip.features.map((feature, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Icon/Emoji"
                  value={feature.icon}
                  maxLength={3}
                  onChange={e => {
                    const newFeatures = [...sections.vip.features];
                    newFeatures[idx].icon = e.target.value;
                    updateSection('vip', 'features', newFeatures);
                  }}
                  className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Feature Title"
                  value={feature.title}
                  onChange={e => {
                    const newFeatures = [...sections.vip.features];
                    newFeatures[idx].title = e.target.value;
                    updateSection('vip', 'features', newFeatures);
                  }}
                  className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Feature Description"
                  value={feature.desc}
                  onChange={e => {
                    const newFeatures = [...sections.vip.features];
                    newFeatures[idx].desc = e.target.value;
                    updateSection('vip', 'features', newFeatures);
                  }}
                  className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
