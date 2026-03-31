import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, getCartTotal, clearCart } from '../lib/cartStore';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: 'US' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = getCartTotal(cart);
  const shipping = total >= 150 ? 0 : 12;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address || !form.city || !form.zip) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);

    await base44.entities.Order.create({
      items: cart.map(item => ({
        product_id: item.product_id,
        product_name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      subtotal: total,
      shipping,
      total: total + shipping,
      status: 'pending',
      shipping_address: form,
    });

    clearCart();
    setSubmitting(false);
    toast.success('Order placed successfully!');
    navigate('/order-confirmation');
  };

  if (cart.length === 0) {
    return (
      <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xs text-muted-foreground tracking-wider">YOUR CART IS EMPTY</p>
        <button onClick={() => navigate('/shop')} className="text-xs text-primary font-bold tracking-wider">
          ← EXPLORE COLLECTION
        </button>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground tracking-wider hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-3 h-3" /> BACK
          </button>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">CHECKOUT</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-6"
          >
            <div>
              <span className="text-[10px] text-muted-foreground tracking-widest mb-4 block">SHIPPING INFORMATION</span>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="FULL NAME *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="EMAIL *"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="ADDRESS *"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="CITY *"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="STATE"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ZIP CODE *"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="COUNTRY"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'PROCESSING...' : `PLACE ORDER — $${(total + shipping).toFixed(2)}`}
            </button>
          </motion.form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="border border-border p-6 lg:sticky lg:top-24">
              <h3 className="text-xs font-bold tracking-widest mb-6">ORDER SUMMARY</h3>
              <div className="space-y-4 mb-6">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-16 object-cover bg-secondary" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold tracking-wider">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground">SIZE: {item.size} × {item.quantity}</p>
                      <p className="text-[10px] font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>SUBTOTAL</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>SHIPPING</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-t border-border pt-2 mt-2">
                  <span>TOTAL</span>
                  <span>${(total + shipping).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
