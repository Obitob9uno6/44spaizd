import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

const statusColor = (s) => ({
  confirmed: 'bg-green-500/15 text-green-400',
  shipped: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-primary/15 text-primary',
  cancelled: 'bg-destructive/15 text-destructive',
  pending: 'bg-yellow-500/15 text-yellow-400',
}[s] || 'bg-muted text-muted-foreground');

export default function AdminOverview() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.products.list('-created_date', 200),
      api.orders.list('-created_date', 50),
    ]).then(([p, o]) => {
      setProducts(p);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const outOfStock = products.filter(p => (parseInt(p.stock) || 0) === 0 && p.is_active).length;
  const lowStock = products.filter(p => { const s = parseInt(p.stock) || 0; return s > 0 && s <= 5 && p.is_active; }).length;

  const stats = [
    { label: 'TOTAL PRODUCTS', value: products.length, icon: Package, color: 'text-primary', to: '/admin/products' },
    { label: 'TOTAL ORDERS', value: orders.length, icon: ShoppingBag, color: 'text-blue-400', to: '/admin/orders' },
    { label: 'REVENUE', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', to: null },
    { label: 'PENDING ORDERS', value: pendingOrders, icon: TrendingUp, color: pendingOrders > 0 ? 'text-yellow-400' : 'text-muted-foreground', to: '/admin/orders' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-widest">OVERVIEW</h1>
        <p className="text-[10px] text-muted-foreground mt-1">Welcome back to your control room</p>
      </div>

      {/* Alerts */}
      {!loading && (outOfStock > 0 || lowStock > 0) && (
        <div className="mb-6 space-y-2">
          {outOfStock > 0 && (
            <Link to="/admin/inventory" className="flex items-center justify-between gap-3 bg-destructive/10 border border-destructive/20 rounded p-3 hover:bg-destructive/15 transition-colors group">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-xs font-bold text-destructive">{outOfStock} product{outOfStock > 1 ? 's' : ''} out of stock</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-destructive group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
          {lowStock > 0 && (
            <Link to="/admin/inventory" className="flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded p-3 hover:bg-yellow-500/15 transition-colors group">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <p className="text-xs font-bold text-yellow-400">{lowStock} product{lowStock > 1 ? 's' : ''} running low (≤5 units)</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-yellow-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, color, to }) => {
          const card = (
            <div className={`bg-card border border-border rounded p-4 ${to ? 'hover:border-primary/40 transition-colors' : ''}`}>
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-bold">{loading ? '—' : value}</p>
              <p className="text-[9px] text-muted-foreground tracking-widest mt-1">{label}</p>
            </div>
          );
          return to ? <Link key={label} to={to}>{card}</Link> : <div key={label}>{card}</div>;
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { to: '/admin/products', label: 'Manage Products', sub: 'Add, edit, and organize your catalog', icon: Package },
          { to: '/admin/drops', label: 'Drops Manager', sub: 'Control badges and featured items', icon: TrendingUp },
          { to: '/admin/inventory', label: 'Inventory', sub: 'Update stock levels across products', icon: Package },
        ].map(({ to, label, sub, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="bg-card border border-border rounded p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-4 h-4 text-primary" />
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs font-bold tracking-wider">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground mb-3">RECENT ORDERS</h2>
      <div className="bg-card border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">No orders yet.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">ORDER</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden sm:table-cell">CUSTOMER</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">STATUS</th>
                <th className="text-right px-4 py-3 text-muted-foreground tracking-wider font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map(order => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">#{order.id}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{order.shipping_address?.name || order.shipping_address?.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${statusColor(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">${parseFloat(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {orders.length > 10 && (
        <div className="text-center mt-3">
          <Link to="/admin/orders" className="text-xs text-primary font-bold tracking-wider hover:underline">
            VIEW ALL {orders.length} ORDERS →
          </Link>
        </div>
      )}
    </div>
  );
}
