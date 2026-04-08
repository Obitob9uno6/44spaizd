import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter' }),
      });
      if (res.ok) {
        toast.success('Welcome to the inner circle.');
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
    <section className="py-20 sm:py-32 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 text-center"
      >
        <span className="text-[10px] text-accent tracking-widest font-bold mb-2 block">NEWSLETTER</span>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
          CATCH GOOD VIBES
        </h2>
        <p className="text-xs text-muted-foreground mb-8">
          Early access, restock alerts, and Cali energy delivered straight to your inbox. No spam, just the goods.
        </p>
        <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="YOUR EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="flex-1 bg-secondary border border-border px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="bg-primary text-primary-foreground px-6 py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? '...' : 'SUBSCRIBE'}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
