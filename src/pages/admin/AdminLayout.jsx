import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingBag, LogOut, Menu, X, Zap } from 'lucide-react';

export default function AdminLayout() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('spaizd_admin');
    if (stored === 'true') { setAuthed(true); }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('spaizd_admin', 'true');
        setAuthed(true);
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Connection error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('spaizd_admin');
    setAuthed(false);
    navigate('/');
  };

  if (loading) return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!authed) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-bold tracking-widest text-primary mb-8 text-center">SPAIZD ADMIN</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="ADMIN PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          {error && <p className="text-[10px] text-destructive">{error}</p>}
          <button type="submit" className="w-full bg-primary text-primary-foreground py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors">
            ENTER
          </button>
        </form>
      </div>
    </div>
  );

  const navItems = [
    { path: '/admin', label: 'OVERVIEW', icon: LayoutDashboard },
    { path: '/admin/products', label: 'PRODUCTS', icon: Package },
    { path: '/admin/drops', label: 'DROPS', icon: Zap },
    { path: '/admin/orders', label: 'ORDERS', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <Link to="/" className="text-sm font-bold tracking-widest text-primary">SPAIZD</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-3 py-2 flex-1">
          <p className="text-[9px] text-muted-foreground tracking-widest px-3 py-2">CONTROL ROOM</p>
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold tracking-wider transition-colors mb-1 ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded text-xs font-bold tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          <span className="text-xs font-bold tracking-widest text-primary">ADMIN</span>
          <div />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
