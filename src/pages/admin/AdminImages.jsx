import { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('spaizd_admin_token');
      const res = await fetch('/api/blob/list?prefix=images/', {
        headers: { 'Authorization': `Bearer ${token || 'admin'}` },
      });
      if (res.ok) {
        const data = await res.json();
        setImages(data.files || []);
      }
    } catch (err) {
      console.error('Load images error:', err);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const token = sessionStorage.getItem('spaizd_admin_token');
            const res = await fetch('/api/blob/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token || 'admin'}`,
              },
              body: JSON.stringify({
                file: event.target.result,
                folder: 'images',
              }),
            });
            if (res.ok) {
              const data = await res.json();
              setImages([...images, { url: data.url, filename: file.name, size: data.size }]);
              toast.success(`${file.name} uploaded`);
            } else {
              toast.error(`Failed to upload ${file.name}`);
            }
          } catch (err) {
            console.error('Upload error:', err);
            toast.error(`Upload failed: ${err.message}`);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('File read error:', err);
        toast.error('Failed to read file');
      }
    }
    setUploading(false);
  };

  const handleDelete = async (url) => {
    if (!confirm('Delete this image?')) return;
    try {
      const token = sessionStorage.getItem('spaizd_admin_token');
      const res = await fetch('/api/blob/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'admin'}`,
        },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setImages(images.filter(img => img.url !== url));
        toast.success('Image deleted');
      } else {
        toast.error('Failed to delete image');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IMAGE GALLERY</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload and manage images for your store</p>
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer group">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
          <span className="text-sm font-bold tracking-wider text-muted-foreground group-hover:text-primary">
            {uploading ? 'UPLOADING...' : 'DROP IMAGES HERE OR CLICK'}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Images grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-secondary/50">
          <p className="text-sm text-muted-foreground">No images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors group">
              <div className="aspect-video bg-secondary overflow-hidden">
                <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-3 space-y-2 border-t border-border">
                <p className="text-xs font-bold truncate">{img.filename}</p>
                <p className="text-[10px] text-muted-foreground">{(img.size / 1024).toFixed(1)} KB</p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(img.url)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                  >
                    {copied === img.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleDelete(img.url)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
