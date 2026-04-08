import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Package } from 'lucide-react';
import CannabisLeaf from './icons/CannabisLeaf';
import { Scissors } from 'lucide-react';
import { getCart, getCartCount } from '../lib/cartStore';
import { getWishlist } from '../lib/wishlistStore';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function Navbar({ onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [snipping, setSnipping] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
    const updateWishlist = () => setWishlistCount(getWishlist().length);
    updateWishlist();
    window.addEventListener('wishlist-update', updateWishlist);
    return () => window.removeEventListener('wishlist-update', updateWishlist);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    setUserMenuOpen(false);
  };

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
            <Link to="/" className="text-lg font-bold tracking-widest text-foreground hover:text-primary transition-colors">
              SPAIZD
            </Link>

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

            <div className="flex items-center gap-3">
              <Link
                to="/wishlist"
                className="relative p-2 text-foreground hover:text-primary transition-colors"
                title="Wishlist"
              >
                <CannabisLeaf className={`w-5 h-5 transition-colors ${wishlistCount > 0 ? 'fill-primary text-primary' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

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

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-2 text-foreground hover:text-primary transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="hidden sm:block text-[9px] font-bold tracking-widest text-muted-foreground">
                      {user?.name?.split(' ')[0]?.toUpperCase()}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-border shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-[10px] font-bold tracking-wider truncate">{user?.name}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-2 px-4 py-2.5 text-[10px] tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Package className="w-3 h-3" /> MY ORDERS
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <LogOut className="w-3 h-3" /> SIGN OUT
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-[9px] font-bold tracking-widest">SIGN IN</span>
                </button>
              )}

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
          {!isAuthenticated && (
            <button
              onClick={() => { navigate('/login'); setMenuOpen(false); }}
              className="text-2xl font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              SIGN IN
            </button>
          )}
        </div>
      )}
    </>
  );
}
