import { useEffect, useState, useMemo } from 'react';
import { api } from '@/api/client';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle, ArrowRight, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const statusColor = (s) => ({
  confirmed: 'bg-green-500/15 text-green-400',
  shipped: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-primary/15 text-primary',
  cancelled: 'bg-destructive/15 text-destructive',
  pending: 'bg-yellow-500/15 text-yellow-400',
}[s] || 'bg-muted text-muted-foreground');

function buildDailyRevenue(orders) {
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ key, label, revenue: 0 });
  }
  const map = {};
  for (const day of days) map[day.key] = day;

  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    const key = new Date(o.created_date).toISOString().slice(0, 10);
    if (map[key]) map[key].revenue += parseFloat(o.total) || 0;
  }
  return days;
}

function buildTopProducts(orders) {
  const units = {};
  const names = {};
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    const items = Array.isArray(o.items)
      ? o.items
      : (() => { try { return JSON.parse(o.items || '[]'); } catch { return []; } })();
    for (const item of items) {
      const id = item.product_id;
      if (!id) continue;
      units[id] = (units[id] || 0) + (parseInt(item.quantity) || 0);
      names[id] = item.product_name || item.name || `Product #${id}`;
    }
  }
  return Object.entries(units)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => ({ id, name: names[id], units: qty }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-[10px]">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-primary">${payload[0].value.toFixed(2)}</p>
    </div>
  );
};

export default function AdminOverview() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.products.list('-created_date', 200),
      api.orders.list('-created_date', 200),
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

  const dailyRevenue = useMemo(() => buildDailyRevenue(orders), [orders]);
  const topProducts = useMemo(() => buildTopProducts(orders), [orders]);

  const stats = [
    { label: 'TOTAL PRODUCTS', value: products.length, icon: Package, color: 'text-primary', to: '/admin/products' },
    { label: 'TOTAL ORDERS', value: orders.length, icon: ShoppingBag, color: 'text-blue-400', to: '/admin/orders' },
    { label: 'REVENUE', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', to: null },
    { label: 'PENDING ORDERS', value: pendingOrders, icon: TrendingUp, color: pendingOrders > 0 ? 'text-yellow-400' : 'text-muted-foreground', to: '/admin/orders' },
  ];

  const hasRevenue = dailyRevenue.some(d => d.revenue > 0);

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

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded p-4 mb-6">
        <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground mb-4">REVENUE — LAST 30 DAYS</h2>
        {loading ? (
          <div className="h-44 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
          </div>
        ) : !hasRevenue ? (
          <div className="h-44 flex items-center justify-center">
            <p className="text-xs text-muted-foreground tracking-wider">NO REVENUE DATA YET</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={dailyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#666' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#666' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products + Quick links in 2-col on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Best Sellers */}
        <div className="bg-card border border-border rounded p-4">
          <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Star className="w-3 h-3 text-primary" />
            BEST SELLERS
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-8 bg-secondary animate-pulse rounded" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold truncate">{p.name}</div>
                    <div
                      className="h-1 bg-primary/20 rounded-full mt-1 overflow-hidden"
                      title={`${p.units} units`}
                    >
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, (p.units / topProducts[0].units) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-primary">{p.units}</span>
                  <span className="text-[9px] text-muted-foreground">units</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          {[
            { to: '/admin/products', label: 'Manage Products', sub: 'Add, edit, and organize your catalog', icon: Package },
            { to: '/admin/drops', label: 'Drops Manager', sub: 'Control badges and featured items', icon: TrendingUp },
            { to: '/admin/reviews', label: 'Reviews', sub: 'Moderate customer reviews', icon: Star },
          ].map(({ to, label, sub, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex bg-card border border-border rounded p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors group items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-bold tracking-wider">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
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
              {orders.slice(0, 10).map(order => {
                const addr = typeof order.shipping_address === 'string'
                  ? (() => { try { return JSON.parse(order.shipping_address); } catch { return {}; } })()
                  : (order.shipping_address || {});
                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">#{order.id}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{addr.name || addr.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${statusColor(order.status)}`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">${parseFloat(order.total || 0).toFixed(2)}</td>
                  </tr>
                );
              })}
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
