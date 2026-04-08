import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Search, Tag } from 'lucide-react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';

const STATUS_STYLES = {
  pending:   'bg-yellow-400/15 text-yellow-600 border-yellow-400/30',
  paid:      'bg-blue-400/15 text-blue-600 border-blue-400/30',
  confirmed: 'bg-blue-400/15 text-blue-600 border-blue-400/30',
  shipped:   'bg-primary/15 text-primary border-primary/30',
  delivered: 'bg-green-400/15 text-green-600 border-green-400/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
};

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : (order.shipping_address || {});

  return (
    <div className="border border-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold font-mono">#{order.id}</span>
            <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
              {order.status?.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {new Date(order.created_date).toLocaleDateString()} · {items.length} item{items.length !== 1 ? 's' : ''} · ${Number(order.total).toFixed(2)}
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt={item.product_name || item.name} className="w-10 h-10 object-cover bg-secondary flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{item.product_name || item.name}</p>
                  <p className="text-[10px] text-muted-foreground">SIZE: {item.size} · QTY: {item.quantity}</p>
                </div>
                <p className="text-xs font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {order.promo_code || 'Discount'}
                </span>
                <span>-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span><span>${Number(order.shipping).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Address */}
          {addr.address && (
            <div className="border-t border-border pt-3">
              <p className="text-[9px] text-muted-foreground tracking-widest mb-1">SHIPPED TO</p>
              <p className="text-xs">{addr.name}</p>
              <p className="text-[10px] text-muted-foreground">{addr.address}, {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</p>
            </div>
          )}

          <Link
            to={`/order-lookup?id=${order.id}&email=${encodeURIComponent(addr.email || '')}`}
            className="flex items-center gap-1.5 text-[10px] text-primary font-bold tracking-wider hover:underline"
          >
            <Search className="w-3 h-3" /> LOOKUP THIS ORDER
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AccountOrders() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.orders.my()
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err.message || 'Failed to load orders'); setLoading(false); });
  }, [isAuthenticated, navigate]);

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <span className="text-[10px] text-primary tracking-widest font-bold mb-2 block">ACCOUNT</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">MY ORDERS</h1>
            {user?.name && (
              <p className="text-xs text-muted-foreground">Signed in as {user.name}</p>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-secondary animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-xs text-muted-foreground mb-4">No orders yet.</p>
              <Link
                to="/shop"
                className="bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
              >
                START SHOPPING
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/order-lookup" className="text-[10px] text-muted-foreground tracking-wider hover:text-primary transition-colors">
              Looking for an order placed as a guest? → ORDER LOOKUP
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
