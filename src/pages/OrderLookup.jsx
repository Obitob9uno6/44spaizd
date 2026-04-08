import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/api/client';

const STATUS_STYLES = {
  pending:   'bg-yellow-400/15 text-yellow-600 border-yellow-400/30',
  paid:      'bg-blue-400/15 text-blue-600 border-blue-400/30',
  confirmed: 'bg-blue-400/15 text-blue-600 border-blue-400/30',
  shipped:   'bg-primary/15 text-primary border-primary/30',
  delivered: 'bg-green-400/15 text-green-600 border-green-400/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
};

export default function OrderLookup() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: searchParams.get('email') || '', id: searchParams.get('id') || '' });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemsOpen, setItemsOpen] = useState(true);

  // Auto-submit if both params are pre-filled from OrderConfirmation
  useEffect(() => {
    if (form.email && form.id) {
      handleSubmit(null, form.email, form.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e, preEmail, preId) => {
    if (e) e.preventDefault();
    const email = preEmail ?? form.email;
    const id = preId ?? form.id;
    if (!email || !id) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const result = await api.orders.lookup(email.trim(), id.trim());
      setOrder(result);
    } catch (err) {
      setError(err.status === 404 ? 'No order found with that email and order ID.' : 'Something went wrong — try again.');
    } finally {
      setLoading(false);
    }
  };

  const items = order
    ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) || []
    : [];

  const addr = order
    ? (typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address) || {}
    : {};

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <span className="text-[10px] text-primary tracking-widest font-bold mb-2 block">ORDERS</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">ORDER LOOKUP</h1>
            <p className="text-xs text-muted-foreground">Enter your email and order ID to check your order status.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mb-8">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              placeholder="ORDER ID (e.g. 42)"
              value={form.id}
              onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
              required
              className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              {loading ? 'SEARCHING...' : 'LOOK UP ORDER'}
            </button>
          </form>

          {error && (
            <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive mb-6">
              {error}
            </div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border border-border space-y-0"
            >
              {/* Order header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-widest mb-1">ORDER</p>
                  <p className="text-lg font-bold font-mono">#{order.id}</p>
                </div>
                <span className={`text-[9px] font-bold tracking-wider px-3 py-1 rounded border ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                  {order.status?.toUpperCase()}
                </span>
              </div>

              {/* Order date + totals */}
              <div className="px-5 py-4 border-b border-border grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[9px] text-muted-foreground tracking-widest mb-1">DATE</p>
                  <p className="font-medium">{new Date(order.created_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground tracking-widest mb-1">ITEMS</p>
                  <p className="font-medium">{items.length}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground tracking-widest mb-1">TOTAL</p>
                  <p className="font-bold">${Number(order.total).toFixed(2)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-b border-border">
                <button
                  onClick={() => setItemsOpen(o => !o)}
                  className="w-full px-5 py-3 flex items-center justify-between text-[10px] font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  ITEMS ({items.length})
                  {itemsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {itemsOpen && (
                  <div className="px-5 pb-4 space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.product_name || item.name} className="w-12 h-12 object-cover bg-secondary flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{item.product_name || item.name}</p>
                          <p className="text-[10px] text-muted-foreground">SIZE: {item.size} · QTY: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3 space-y-1 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span><span>${Number(order.shipping).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping address */}
              <div className="px-5 py-4">
                <p className="text-[9px] text-muted-foreground tracking-widest mb-2">SHIP TO</p>
                <p className="text-xs font-medium">{addr.name}</p>
                <p className="text-xs text-muted-foreground">{addr.address}</p>
                <p className="text-xs text-muted-foreground">{[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</p>
              </div>
            </motion.div>
          )}

          {!order && !loading && !error && (
            <div className="text-center py-16 border border-dashed border-border">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-xs text-muted-foreground">Enter your email and order ID above to get started.</p>
              <Link to="/shop" className="text-[10px] text-primary tracking-wider font-bold mt-3 block hover:underline">
                BROWSE THE SHOP →
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
