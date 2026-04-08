import { useState, useEffect } from 'react';
import { Mail, Users, Download } from 'lucide-react';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = sessionStorage.getItem('spaizd_admin_token') || '';
    fetch('/api/subscribers', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => { setSubscribers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? subscribers : subscribers.filter(s => s.source === filter);

  const handleExport = () => {
    const csv = ['Email,Source,Joined'].concat(
      filtered.map(s => `${s.email},${s.source},${new Date(s.created_date).toLocaleDateString()}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const newsletterCount = subscribers.filter(s => s.source === 'newsletter').length;
  const vipCount = subscribers.filter(s => s.source === 'vip').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-wider">SUBSCRIBERS</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Collected email addresses from newsletter & VIP forms</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-bold tracking-wider hover:border-primary hover:text-primary transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1">
        {[
          { label: 'TOTAL', value: subscribers.length, icon: Users },
          { label: 'NEWSLETTER', value: newsletterCount, icon: Mail },
          { label: 'VIP', value: vipCount, icon: Mail },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] text-muted-foreground tracking-widest font-bold">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {['all', 'newsletter', 'vip'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-[10px] font-bold tracking-widest transition-colors border ${
              filter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-border p-16 text-center">
          <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-xs text-muted-foreground">No subscribers yet.</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                <th className="px-4 py-3 text-left font-bold tracking-wider text-[10px] text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-bold tracking-wider text-[10px] text-muted-foreground">EMAIL</th>
                <th className="px-4 py-3 text-left font-bold tracking-wider text-[10px] text-muted-foreground">SOURCE</th>
                <th className="px-4 py-3 text-left font-bold tracking-wider text-[10px] text-muted-foreground">JOINED</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${
                      s.source === 'vip'
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-secondary text-muted-foreground border border-border'
                    }`}>
                      {s.source?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
