import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Zap, ShoppingBag, LogOut, Menu, X, Boxes, ExternalLink, Mail } from 'lucide-react';

export default function AdminLayout() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('spaizd_admin');
    if (stored === 'true') setAuthed(true);
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('spaizd_admin', 'true');
        setAuthed(true);
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Connection error — is the server running?');
    } finally {
      setSubmitting(false);
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 rounded mb-4">
            <span className="text-primary font-bold text-lg">S</span>
          </div>
          <h1 className="text-sm font-bold tracking-widest text-foreground">SPAIZD</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest mt-1">ADMIN CONTROL ROOM</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded transition-colors"
            />
          </div>
          {error && (
            <p className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full bg-primary text-primary-foreground py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors rounded disabled:opacity-50"
          >
            {submitting ? 'VERIFYING...' : 'ENTER'}
          </button>
        </form>
      </div>
    </div>
  );

  const navItems = [
    { path: '/admin', label: 'OVERVIEW', icon: LayoutDashboard, exact: true },
    { path: '/admin/products', label: 'PRODUCTS', icon: Package },
    { path: '/admin/inventory', label: 'INVENTORY', icon: Boxes },
    { path: '/admin/drops', label: 'DROPS', icon: Zap },
    { path: '/admin/orders', label: 'ORDERS', icon: ShoppingBag },
    { path: '/admin/subscribers', label: 'SUBSCRIBERS', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-bold tracking-widest text-primary">SPAIZD</span>
            <p className="text-[9px] text-muted-foreground tracking-widest">ADMIN</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="px-3 py-3 flex-1 overflow-y-auto">
          <p className="text-[9px] text-muted-foreground tracking-widest px-3 pb-2">NAVIGATION</p>
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold tracking-wider transition-colors mb-0.5 ${
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-border space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 w-full rounded text-xs font-bold tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            VIEW STORE
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded text-xs font-bold tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold tracking-widest text-primary">ADMIN</span>
          <div className="w-5" />
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
