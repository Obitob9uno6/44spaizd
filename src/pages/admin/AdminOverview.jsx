import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminOverview() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list(),
      base44.entities.Order.list('-created_date', 20),
    ]).then(([p, o]) => {
      setProducts(p);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    { label: 'TOTAL PRODUCTS', value: products.length, icon: Package, color: 'text-primary' },
    { label: 'TOTAL ORDERS', value: orders.length, icon: ShoppingBag, color: 'text-accent' },
    { label: 'REVENUE', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'ACTIVE DROPS', value: products.filter(p => p.badge === 'LIMITED' || p.badge === 'NEW').length, icon: TrendingUp, color: 'text-yellow-400' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold tracking-widest mb-6">OVERVIEW</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded p-4">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-2xl font-bold">{loading ? '—' : value}</p>
            <p className="text-[10px] text-muted-foreground tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xs font-bold tracking-widest mb-3 text-muted-foreground">RECENT ORDERS</h2>
      <div className="bg-card border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">No orders yet.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">ORDER ID</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold hidden sm:table-cell">CUSTOMER</th>
                <th className="text-left px-4 py-3 text-muted-foreground tracking-wider font-bold">STATUS</th>
                <th className="text-right px-4 py-3 text-muted-foreground tracking-wider font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map(order => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{order.id?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{order.shipping_address?.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${
                      order.status === 'confirmed' ? 'bg-green-500/15 text-green-400' :
                      order.status === 'shipped' ? 'bg-blue-500/15 text-blue-400' :
                      order.status === 'delivered' ? 'bg-primary/15 text-primary' :
                      order.status === 'cancelled' ? 'bg-destructive/15 text-destructive' :
                      'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">${order.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
