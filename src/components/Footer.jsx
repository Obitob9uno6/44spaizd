import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Ruler, Mail } from 'lucide-react';
import { toast } from 'sonner';

function SizeGuideModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-background border border-border max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold tracking-widest">SIZE GUIDE</h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold tracking-wider mb-3">TOPS (TEES, HOODIES, OUTERWEAR)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-bold tracking-wider">SIZE</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-bold tracking-wider">CHEST</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-bold tracking-wider">LENGTH</th>
                    <th className="text-left py-2 text-muted-foreground font-bold tracking-wider">SLEEVE</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S', '36-38"', '27"', '33"'],
                    ['M', '38-40"', '28"', '34"'],
                    ['L', '40-42"', '29"', '35"'],
                    ['XL', '42-44"', '30"', '36"'],
                    ['XXL', '44-46"', '31"', '37"'],
                  ].map(([size, chest, length, sleeve]) => (
                    <tr key={size} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-bold">{size}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{chest}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{length}</td>
                      <td className="py-2 text-muted-foreground">{sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider mb-3">PANTS</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-bold tracking-wider">SIZE</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-bold tracking-wider">WAIST</th>
                    <th className="text-left py-2 text-muted-foreground font-bold tracking-wider">INSEAM</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S (28-30)', '28-30"', '30"'],
                    ['M (30-32)', '30-32"', '31"'],
                    ['L (32-34)', '32-34"', '32"'],
                    ['XL (34-36)', '34-36"', '32"'],
                    ['XXL (36-38)', '36-38"', '33"'],
                  ].map(([size, waist, inseam]) => (
                    <tr key={size} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-bold">{size}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{waist}</td>
                      <td className="py-2 text-muted-foreground">{inseam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider mb-3">HEADWEAR</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All caps are one-size-fits-most with adjustable snapback or strapback closure. Fits head circumference 21.5" – 24".
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Measurements are approximate. For an oversized fit, size up. For questions, reach out at hello@spaizd.com.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterError('');
    if (!newsletterEmail.trim()) {
      setNewsletterError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'footer' }),
      });
      if (res.ok) {
        toast.success('You\'re in! Welcome to the crew.');
        setNewsletterEmail('');
      } else {
        toast.error('Something went wrong — try again.');
      }
    } catch {
      toast.error('Connection error — try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <>
      <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold tracking-widest mb-4">SPAIZD</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                California-grown streetwear for the laid-back and deliberate. Good vibes, better fits.
              </p>
              <div className="flex gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors" aria-label="Instagram">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors" aria-label="X">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors" aria-label="TikTok">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.44 6.28 6.28 0 001.86-4.48V8.76a8.26 8.26 0 004.84 1.56V6.88a4.84 4.84 0 01-1.12-.19z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider mb-4 text-muted-foreground">SHOP</h4>
              <div className="flex flex-col gap-2">
                <Link to="/shop?category=tees" className="text-xs text-foreground hover:text-primary transition-colors">Tees</Link>
                <Link to="/shop?category=hoodies" className="text-xs text-foreground hover:text-primary transition-colors">Hoodies</Link>
                <Link to="/shop?category=outerwear" className="text-xs text-foreground hover:text-primary transition-colors">Outerwear</Link>
                <Link to="/shop?category=pants" className="text-xs text-foreground hover:text-primary transition-colors">Pants</Link>
                <Link to="/shop?category=headwear" className="text-xs text-foreground hover:text-primary transition-colors">Headwear</Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider mb-4 text-muted-foreground">INFO</h4>
              <div className="flex flex-col gap-2">
                <Link to="/vip" className="text-xs text-foreground hover:text-primary transition-colors">VIP Access</Link>
                <Link to="/shipping" className="text-xs text-foreground hover:text-primary transition-colors">Shipping & Returns</Link>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-foreground hover:text-primary transition-colors text-left"
                >
                  Size Guide
                </button>
                <a href="mailto:hello@spaizd.com" className="text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Contact
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider mb-4 text-muted-foreground">STAY CONNECTED</h4>
              <p className="text-xs text-muted-foreground mb-4">Get early access to drops and exclusives.</p>
              <form onSubmit={handleNewsletterSubmit}>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="EMAIL"
                    value={newsletterEmail}
                    onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterError(''); }}
                    disabled={newsletterLoading}
                    className="flex-1 bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {newsletterLoading ? '...' : 'JOIN'}
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-[10px] text-destructive mt-1.5">{newsletterError}</p>
                )}
              </form>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-muted-foreground tracking-wider">
              &copy; 2026 SPAIZD. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-4">
              <Link to="/privacy" className="text-[10px] text-muted-foreground hover:text-foreground tracking-wider transition-colors">PRIVACY POLICY</Link>
              <Link to="/terms" className="text-[10px] text-muted-foreground hover:text-foreground tracking-wider transition-colors">TERMS</Link>
              <Link to="/shipping" className="text-[10px] text-muted-foreground hover:text-foreground tracking-wider transition-colors">SHIPPING</Link>
            </div>
            <p className="text-[10px] text-muted-foreground tracking-wider">
              CALI-GROWN STREETWEAR
            </p>
          </div>
        </div>
      </footer>
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
