import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, getCartTotal, clearCart } from '../lib/cartStore';
import { api } from '@/api/client';
import { motion } from 'framer-motion';
import { ChevronLeft, Lock, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
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

function PromoCodeInput({ onApply, appliedPromo }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setPromoError('');
    setApplying(true);
    try {
      const result = await api.promoCodes.validate(code.trim());
      onApply(result);
      setCode('');
      toast.success(`Promo code ${result.code} applied!`);
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code');
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => {
    onApply(null);
    setCode('');
    setPromoError('');
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(s => !s)}
        className="flex items-center gap-2 text-[10px] text-muted-foreground tracking-wider hover:text-foreground transition-colors"
      >
        <Tag className="w-3 h-3" />
        PROMO CODE
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3">
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-3 py-2">
              <div>
                <span className="text-xs font-bold tracking-widest text-primary">{appliedPromo.code}</span>
                <span className="text-[10px] text-muted-foreground ml-2">
                  {appliedPromo.type === 'percent'
                    ? `${appliedPromo.value}% off`
                    : `$${appliedPromo.value.toFixed(2)} off`}
                </span>
              </div>
              <button type="button" onClick={handleRemove} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setPromoError(''); }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApply())}
                placeholder="ENTER CODE"
                className="flex-1 bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary tracking-widest transition-colors"
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={applying || !code.trim()}
                className="bg-foreground text-background px-4 py-2 text-[10px] font-bold tracking-widest hover:bg-foreground/80 transition-colors disabled:opacity-50"
              >
                {applying ? '...' : 'APPLY'}
              </button>
            </div>
          )}
          {promoError && <p className="text-[10px] text-destructive mt-1">{promoError}</p>}
        </div>
      )}
    </div>
  );
}

function CheckoutForm({ cart, subtotal, shipping, discount, appliedPromo, onApplyPromo }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: 'US' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState(null);

  const finalTotal = Math.max(0, subtotal - discount) + shipping;

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
      const amountInCents = Math.round(finalTotal * 100);
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
          subtotal,
          shipping,
          total: finalTotal,
          status: 'paid',
          shipping_address: form,
          payment_intent_id: paymentIntent.id,
          promo_code: appliedPromo?.code || null,
          discount,
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

      <PromoCodeInput appliedPromo={appliedPromo} onApply={onApplyPromo} />

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
        {submitting ? 'PROCESSING...' : `PAY $${finalTotal.toFixed(2)}`}
      </button>
    </motion.form>
  );
}

function NoStripeCheckoutForm({ cart, subtotal, shipping, discount, appliedPromo, onApplyPromo }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: 'US' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const finalTotal = Math.max(0, subtotal - discount) + shipping;

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
        subtotal,
        shipping,
        total: finalTotal,
        status: 'pending',
        shipping_address: form,
        promo_code: appliedPromo?.code || null,
        discount,
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

      <PromoCodeInput appliedPromo={appliedPromo} onApply={onApplyPromo} />

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
  const [appliedPromo, setAppliedPromo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { setCart(getCart()); }, []);

  const subtotal = getCartTotal(cart);
  const shipping = subtotal >= 150 ? 0 : 12;

  const discount = appliedPromo
    ? appliedPromo.type === 'percent'
      ? Math.min(subtotal * (appliedPromo.value / 100), subtotal)
      : Math.min(appliedPromo.value, subtotal)
    : 0;

  const finalTotal = Math.max(0, subtotal - discount) + shipping;

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

  const formProps = {
    cart,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    onApplyPromo: setAppliedPromo,
  };

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
              <CheckoutForm {...formProps} />
            </Elements>
          ) : (
            <NoStripeCheckoutForm {...formProps} />
          )}

          {/* Order Summary */}
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
                <span>SUBTOTAL</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-primary">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {appliedPromo?.code}
                  </span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>SHIPPING</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                <span>TOTAL</span><span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
