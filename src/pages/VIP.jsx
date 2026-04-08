import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Tag, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const tiers = [
  {
    name: 'CORE',
    price: 'FREE',
    desc: 'Basic access to the SPAIZD ecosystem.',
    features: ['Newsletter access', 'Standard shipping rates', 'Public drop access'],
    cta: 'JOIN FREE',
    highlighted: false,
  },
  {
    name: 'ELEVATED',
    price: '$15/mo',
    desc: 'Early access and exclusive perks.',
    features: ['24hr early access to drops', '10% off all orders', 'Free shipping on orders $100+', 'Exclusive colorways', 'Priority support'],
    cta: 'GET ELEVATED',
    highlighted: true,
  },
  {
    name: 'INNER CIRCLE',
    price: '$30/mo',
    desc: 'The ultimate SPAIZD experience.',
    features: ['72hr early access to drops', '20% off all orders', 'Free shipping always', 'VIP-only products', '1-on-1 styling consult', 'First access to collabs'],
    cta: 'ENTER THE CIRCLE',
    highlighted: false,
  },
];

const perks = [
  { icon: Clock, title: 'EARLY DROP ACCESS', desc: 'Shop new releases before anyone else. Up to 72 hours head start.' },
  { icon: Tag, title: 'MEMBER PRICING', desc: 'Exclusive discounts from 10-20% on every purchase, every time.' },
  { icon: Zap, title: 'EXCLUSIVE PRODUCTS', desc: 'Access colorways and pieces only available to VIP members.' },
  { icon: Shield, title: 'PRIORITY EVERYTHING', desc: 'Priority shipping, support, and restocking notifications.' },
];

export default function VIP() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = (tier) => {
    toast.success(`${tier} membership — coming soon.`);
  };

  const handleVipSignup = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'vip' }),
      });
      if (res.ok) {
        toast.success('VIP waitlist joined.');
        setEmail('');
      } else {
        toast.error('Something went wrong — try again.');
      }
    } catch {
      toast.error('Connection error — try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="text-[10px] text-accent tracking-widest font-bold mb-2 block">VIP CLUB 🌿</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              THE GOOD
              <br />
              <span className="text-primary">LIFE CLUB</span>
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Join the community that moves first and stays chillest. Early access, Cali-exclusive drops, and member-only pricing — because good things come to those who roll right.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
            {perks.map((perk, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="border border-border p-8 hover:border-primary/40 transition-colors"
              >
                <perk.icon className="w-5 h-5 text-primary mb-4" />
                <h3 className="text-xs font-bold tracking-wider mb-2">{perk.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">CHOOSE YOUR LEVEL</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {tiers.map((tier, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className={`border p-8 flex flex-col ${
                  tier.highlighted ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                {tier.highlighted && (
                  <span className="text-[9px] text-primary tracking-widest font-bold mb-4">MOST POPULAR</span>
                )}
                <h3 className="text-lg font-bold tracking-wider mb-1">{tier.name}</h3>
                <p className="text-2xl font-bold mb-2">{tier.price}</p>
                <p className="text-[11px] text-muted-foreground mb-6">{tier.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="text-[11px] text-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleJoin(tier.name)}
                  className={`w-full py-3 text-xs font-bold tracking-widest transition-colors ${
                    tier.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border text-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-4">READY TO ELEVATE?</h2>
          <p className="text-xs text-muted-foreground mb-8">
            Enter your email to get started with VIP access.
          </p>
          <form onSubmit={handleVipSignup} className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="YOUR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="bg-primary text-primary-foreground px-6 py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? '...' : <><span>JOIN</span> <ArrowRight className="w-3 h-3" /></>}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
