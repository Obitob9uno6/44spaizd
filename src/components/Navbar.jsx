import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Scissors } from 'lucide-react';
import { getCart, getCartCount } from '../lib/cartStore';

export default function Navbar({ onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [snipping, setSnipping] = useState(false);

  const handleCartClick = () => {
    setSnipping(true);
    setTimeout(() => setSnipping(false), 500);
    onCartOpen();
  };
  const location = useLocation();

  useEffect(() => {
    const updateCart = () => setCartCount(getCartCount(getCart()));
    updateCart();
    window.addEventListener('cart-update', updateCart);
    return () => window.removeEventListener('cart-update', updateCart);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/shop', label: 'SHOP' },
    { path: '/shop?category=tees', label: 'TEES' },
    { path: '/shop?category=hoodies', label: 'HOODIES' },
    { path: '/shop?category=outerwear', label: 'OUTERWEAR' },
    { path: '/vip', label: 'VIP CLUB' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border' : 'bg-background/60 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-lg font-bold tracking-widest text-foreground hover:text-primary transition-colors">
              SPAIZD
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-xs font-medium tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleCartClick}
                className="relative p-2 text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Scissors className={`w-5 h-5 ${snipping ? 'scissors-snip' : ''}`} />
                <span className="hidden sm:block text-[9px] font-bold tracking-widest text-muted-foreground">TRIM ROOM</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-foreground"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="text-2xl font-bold tracking-widest text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
