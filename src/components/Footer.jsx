import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold tracking-widest mb-4">SPAIZD</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              California-grown streetwear for the laid-back and deliberate. Good vibes, better fits. 🌿
            </p>
          </div>

          {/* Shop */}
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

          {/* Info */}
          <div>
            <h4 className="text-xs font-bold tracking-wider mb-4 text-muted-foreground">INFO</h4>
            <div className="flex flex-col gap-2">
              <Link to="/vip" className="text-xs text-foreground hover:text-primary transition-colors">VIP Access</Link>
              <Link to="/shipping" className="text-xs text-foreground hover:text-primary transition-colors">Shipping & Returns</Link>
              <span className="text-xs text-foreground">Size Guide</span>
              <span className="text-xs text-foreground">Contact</span>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold tracking-wider mb-4 text-muted-foreground">STAY CONNECTED</h4>
            <p className="text-xs text-muted-foreground mb-4">Get early access to drops and exclusives.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="EMAIL"
                className="flex-1 bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold tracking-wider hover:bg-primary/90 transition-colors">
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-muted-foreground tracking-wider">
            © 2026 SPAIZD. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-[10px] text-muted-foreground hover:text-foreground tracking-wider transition-colors">PRIVACY POLICY</Link>
            <Link to="/terms" className="text-[10px] text-muted-foreground hover:text-foreground tracking-wider transition-colors">TERMS</Link>
          </div>
          <p className="text-[10px] text-muted-foreground tracking-wider">
            CALI-GROWN STREETWEAR — EST. 2024 🌴
          </p>
        </div>
      </div>
    </footer>
  );
}
