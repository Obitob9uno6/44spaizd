import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { ChevronDown, ChevronUp, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColor = (s) => ({
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  shipped: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  delivered: 'bg-primary/15 text-primary border-primary/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}[s] || 'bg-muted text-muted-foreground border-border');

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const o = await api.orders.list('-created_date', 200);
      setOrders(o);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.orders.update(id, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.orders.delete(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      if (expanded === id) setExpanded(null);
      toast.success('Order deleted');
    } catch {
      toast.error('Failed to delete order');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || (
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_address?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_address?.email?.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = STATUSES.reduce((acc, s) => ({
    ...acc,
    [s]: orders.filter(o => o.status === s).length,
  }), {});

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-widest">ORDERS</h1>
          <p className="text-[10px] text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`px-2.5 py-1 text-[9px] font-bold tracking-wider border rounded transition-colors ${filterStatus === s ? statusColor(s) : 'border-border text-muted-foreground hover:border-foreground'}`}
            >
              {s.toUpperCase()} {counts[s] > 0 && `(${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or order ID..."
          className="w-full bg-secondary border border-border pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded"
        />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => (
            <div key={order.id} className="bg-card border border-border rounded overflow-hidden">
              {/* Order row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/40 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  order.status === 'confirmed' ? 'bg-green-400' :
                  order.status === 'shipped' ? 'bg-blue-400' :
                  order.status === 'delivered' ? 'bg-primary' :
                  order.status === 'cancelled' ? 'bg-destructive' :
                  'bg-yellow-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">#{order.id}</span>
                    <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border ${statusColor(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span>
                    {order.shipping_address?.name && (
                      <span className="text-xs font-bold hidden sm:block">{order.shipping_address.name}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground hidden md:block">{order.shipping_address?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs font-bold">${parseFloat(order.total || 0).toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                    {order.promo_code && (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30 hidden sm:inline-block">
                        {order.promo_code}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground hidden lg:block">{formatDate(order.created_date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); deleteOrder(order.id); }}
                    disabled={deleting === order.id}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                    title="Delete order"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expanded === order.id
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="border-t border-border px-4 py-5 space-y-5 bg-secondary/20">
                  {/* Status updater */}
                  <div>
                    <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">UPDATE STATUS</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          disabled={updating === order.id || order.status === s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider border rounded transition-colors ${
                            order.status === s
                              ? statusColor(s)
                              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                          } disabled:opacity-50`}
                        >
                          {updating === order.id && order.status !== s ? '...' : s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Shipping address */}
                    <div>
                      <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">SHIP TO</p>
                      {order.shipping_address ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold">{order.shipping_address.name}</p>
                          <p className="text-xs text-muted-foreground">{order.shipping_address.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.shipping_address.city}{order.shipping_address.state ? `, ${order.shipping_address.state}` : ''} {order.shipping_address.zip}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.shipping_address.country || 'US'}</p>
                          <p className="text-xs text-primary mt-1">{order.shipping_address.email}</p>
                        </div>
                      ) : <p className="text-xs text-muted-foreground">No address</p>}
                    </div>

                    {/* Order totals */}
                    <div>
                      <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">ORDER TOTAL</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                        </div>
                        {order.promo_code && (
                          <div className="flex justify-between text-green-400">
                            <span>Promo ({order.promo_code})</span>
                            <span>-${parseFloat(order.discount || 0).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>Shipping</span>
                          <span>{parseFloat(order.shipping || 0) === 0 ? 'FREE' : `$${parseFloat(order.shipping).toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-border pt-1 mt-1">
                          <span>Total</span>
                          <span>${parseFloat(order.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-3">{formatDate(order.created_date)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground tracking-widest font-bold mb-2">ITEMS ({order.items.length})</p>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-background/50 rounded p-2">
                            {item.image ? (
                              <img src={item.image} className="w-12 h-12 object-cover bg-secondary rounded flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 bg-secondary rounded flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{item.product_name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                SIZE: {item.size} · QTY: {item.quantity}
                              </p>
                            </div>
                            <p className="text-xs font-bold flex-shrink-0">${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
