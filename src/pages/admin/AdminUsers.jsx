import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Users, Search } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.users.list()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-widest">USERS</h1>
        <p className="text-[10px] text-muted-foreground mt-1">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-secondary border border-border pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded"
        />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-border p-16 text-center rounded">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-xs text-muted-foreground">{search ? 'No users match your search.' : 'No registered users yet.'}</p>
        </div>
      ) : (
        <div className="border border-border rounded overflow-hidden overflow-x-auto">
          <table className="w-full text-xs min-w-[500px]">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                <th className="px-4 py-3 text-left font-bold tracking-wider text-[10px] text-muted-foreground">USER</th>
                <th className="px-4 py-3 text-left font-bold tracking-wider text-[10px] text-muted-foreground">EMAIL</th>
                <th className="px-4 py-3 text-left font-bold tracking-wider text-[10px] text-muted-foreground">JOINED</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-primary">{(u.name || '?')[0].toUpperCase()}</span>
                        </div>
                      )}
                      <span className="font-medium truncate">{u.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
