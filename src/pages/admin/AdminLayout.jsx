import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, Package, Tag, ShoppingBag, LogOut, Menu, X, Zap } from 'lucide-react';

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u || u.role !== 'admin') {
        navigate('/');
      } else {
        setUser(u);
      }
      setLoading(false);
    }).catch(() => {
      base44.auth.redirectToLogin('/admin');
    });
  }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
      {/* Sidebar */}
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
          <div className="px-3 py-2 mb-2">
            <p className="text-[10px] text-muted-foreground tracking-wider">{user?.email}</p>
            <p className="text-[9px] text-primary tracking-widest">ADMIN</p>
          </div>
          <button
            onClick={() => base44.auth.logout('/')}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded text-xs font-bold tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
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
