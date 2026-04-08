import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, getCartTotal, clearCart } from '../lib/cartStore';
import { api } from '@/api/client';
import { motion } from 'framer-motion';
import { ChevronLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CARD_STYLE = {
  style: {
    base: {
      color: 'hsl(var(--foreground))',
      fontFamily: '"Inter", sans-serif',
      fontSize: '12px',
      letterSpacing: '0.05em',
      '::placeholder': { color: 'hsl(var(--muted-foreground))' },
    },
    invalid: { color: 'hsl(var(--destructive))' },
  },
};

function CheckoutForm({ cart, total, shipping }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: 'US' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.zip.trim()) e.zip = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setCardError(null);

    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    setSubmitting(true);
    try {
      const amountInCents = Math.round((total + shipping) * 100);
      const { clientSecret } = await api.payments.createIntent({
        amount: amountInCents,
        currency: 'usd',
      });

      const cardEl = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardEl,
          billing_details: {
            name: form.name,
            email: form.email,
            address: {
              line1: form.address,
              city: form.city,
              state: form.state,
              postal_code: form.zip,
              country: form.country,
            },
          },
        },
      });

      if (error) {
        setCardError(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const order = await api.orders.create({
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
          status: 'paid',
          shipping_address: form,
          payment_intent_id: paymentIntent.id,
        });
        clearCart();
        toast.success('Payment successful! Order placed.');
        navigate('/order-confirmation', { state: { orderId: order.id, email: form.email } });
      }
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key, placeholder, type = 'text') => (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full bg-secondary border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${errors[key] ? 'border-destructive' : 'border-border'}`}
      />
      {errors[key] && <p className="text-[10px] text-destructive mt-1">{errors[key]}</p>}
    </div>
  );

  return (
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
          {field('name', 'FULL NAME *')}
          {field('email', 'EMAIL *', 'email')}
          {field('address', 'ADDRESS *')}
          <div className="grid grid-cols-2 gap-3">
            {field('city', 'CITY *')}
            {field('state', 'STATE')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('zip', 'ZIP CODE *')}
            <div>
              <select
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="US">United States</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <span className="text-[10px] text-muted-foreground tracking-widest mb-4 block">PAYMENT</span>
        <div className="bg-secondary border border-border px-4 py-3.5">
          <CardElement options={CARD_STYLE} onChange={e => setCardError(e.error?.message || null)} />
        </div>
        {cardError && <p className="text-[10px] text-destructive mt-1">{cardError}</p>}
        <div className="flex items-center gap-1.5 mt-2">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground tracking-wider">SECURED BY STRIPE</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'PROCESSING...' : `PAY $${(total + shipping).toFixed(2)}`}
      </button>
    </motion.form>
  );
}

function NoStripeCheckoutForm({ cart, total, shipping }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: 'US' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.zip.trim()) e.zip = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const order = await api.orders.create({
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
      toast.success('Order placed successfully!');
      navigate('/order-confirmation', { state: { orderId: order.id, email: form.email } });
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key, placeholder, type = 'text') => (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full bg-secondary border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${errors[key] ? 'border-destructive' : 'border-border'}`}
      />
      {errors[key] && <p className="text-[10px] text-destructive mt-1">{errors[key]}</p>}
    </div>
  );

  return (
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
          {field('name', 'FULL NAME *')}
          {field('email', 'EMAIL *', 'email')}
          {field('address', 'ADDRESS *')}
          <div className="grid grid-cols-2 gap-3">
            {field('city', 'CITY *')}
            {field('state', 'STATE')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('zip', 'ZIP CODE *')}
            <div>
              <select
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                className="w-full bg-secondary border border-border px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="US">United States</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-dashed border-border p-4 text-center">
        <p className="text-[10px] text-muted-foreground tracking-wider">STRIPE PAYMENT NOT CONFIGURED</p>
        <p className="text-[9px] text-muted-foreground mt-1">Connect Stripe to enable card payments</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
      </button>
    </motion.form>
  );
}

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { setCart(getCart()); }, []);

  const total = getCartTotal(cart);
  const shipping = total >= 150 ? 0 : 12;

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
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm cart={cart} total={total} shipping={shipping} />
            </Elements>
          ) : (
            <NoStripeCheckoutForm cart={cart} total={total} shipping={shipping} />
          )}

          <div className="lg:col-span-2">
            <span className="text-[10px] text-muted-foreground tracking-widest mb-4 block">ORDER SUMMARY</span>
            <div className="space-y-3">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-secondary" />
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-wider">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">SIZE: {item.size} · QTY: {item.quantity}</p>
                    <p className="text-xs font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>SUBTOTAL</span><span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>SHIPPING</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                <span>TOTAL</span><span>${(total + shipping).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
