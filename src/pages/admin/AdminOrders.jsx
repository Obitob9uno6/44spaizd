import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColor = (s) => ({
  confirmed: 'bg-green-500/15 text-green-400',
  shipped: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-primary/15 text-primary',
  cancelled: 'bg-destructive/15 text-destructive',
  pending: 'bg-yellow-500/15 text-yellow-400',
}[s] || 'bg-muted text-muted-foreground');

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    base44.entities.Order.list('-created_date').then(o => {
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await base44.entities.Order.update(id, { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdating(null);
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-widest mb-6">ORDERS</h1>

      {loading ? (
        <div className="text-center text-muted-foreground text-xs py-12">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-muted-foreground text-xs py-12">No orders yet.</div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="bg-card border border-border rounded overflow-hidden">
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">{order.id?.slice(0, 8)}...</span>
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${statusColor(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden sm:block">{order.shipping_address?.email}</span>
                  </div>
                  <p className="text-xs font-bold mt-0.5">${order.total?.toFixed(2)} · {order.items?.length} item(s)</p>
                </div>
                {expanded === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>

              {expanded === order.id && (
                <div className="border-t border-border px-4 py-4 space-y-4">
                  {/* Status updater */}
                  <div>
                    <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">UPDATE STATUS</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          disabled={updating === order.id || order.status === s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider border transition-colors ${order.status === s ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-foreground'}`}
                        >
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shipping address */}
                  {order.shipping_address && (
                    <div>
                      <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-1">SHIP TO</p>
                      <p className="text-xs">{order.shipping_address.name}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_address.email}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">ITEMS</p>
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {item.image && <img src={item.image} className="w-10 h-10 object-cover bg-secondary rounded" />}
                          <div className="flex-1">
                            <p className="text-xs font-bold">{item.product_name}</p>
                            <p className="text-[10px] text-muted-foreground">SIZE: {item.size} · QTY: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
