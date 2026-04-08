import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/api/client';
import { getWishlist, toggleWishlist } from '@/lib/wishlistStore';
import { addToCart } from '@/lib/cartStore';
import { toast } from 'sonner';

function WishlistCard({ product, onRemove }) {
  const [adding, setAdding] = useState(false);
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : (() => { try { return JSON.parse(product.sizes || '[]'); } catch { return []; } })();
  const defaultSize = sizes[0] || 'ONE SIZE';
  const inStock = (parseInt(product.stock) || 0) > 0;

  const handleAddToCart = async () => {
    setAdding(true);
    const { limitReached } = addToCart({
      product_id: product.id,
      product_name: product.name,
      price: parseFloat(product.price),
      size: defaultSize,
      quantity: 1,
      image: product.images?.[0],
      stock: parseInt(product.stock) || 0,
    });
    if (limitReached) {
      toast.warning('Stock limit reached');
    } else {
      toast.success(`${product.name} added to cart`);
    }
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border rounded overflow-hidden flex flex-col sm:flex-row"
    >
      <Link to={`/product/${product.id}`} className="flex-shrink-0">
        <div className="w-full sm:w-36 h-48 sm:h-full bg-secondary overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              NO IMAGE
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/product/${product.id}`} className="text-xs font-bold tracking-wider hover:text-primary transition-colors">
                {product.name}
              </Link>
              <p className="text-[10px] text-muted-foreground mt-0.5">{product.category?.toUpperCase()}</p>
            </div>
            {product.badge && product.badge !== '' && (
              <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 flex-shrink-0 ${
                product.badge === 'LIMITED' ? 'bg-primary/15 text-primary border border-primary/30' :
                product.badge === 'SOLD OUT' ? 'bg-muted text-muted-foreground border border-border' :
                'bg-foreground/10 text-foreground border border-border'
              }`}>
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold">${parseFloat(product.price || 0).toFixed(2)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                ${parseFloat(product.compare_price).toFixed(2)}
              </span>
            )}
          </div>

          {!inStock && (
            <p className="text-[10px] text-muted-foreground mt-1 tracking-wider">OUT OF STOCK</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {inStock ? (adding ? 'ADDING...' : 'ADD TO CART') : 'OUT OF STOCK'}
          </button>
          <button
            onClick={() => onRemove(product.id)}
            className="p-2.5 border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            title="Remove from wishlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Wishlist() {
  const [wishlistIds, setWishlistIds] = useState(getWishlist());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = () => setWishlistIds(getWishlist());
    window.addEventListener('wishlist-update', handler);
    return () => window.removeEventListener('wishlist-update', handler);
  }, []);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(wishlistIds.map(id => api.products.get(id).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [wishlistIds.length]);

  const handleRemove = (productId) => {
    toggleWishlist(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Removed from wishlist');
  };

  return (
    <div className="pt-16">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-3 mb-1">
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-[10px] text-primary tracking-widest font-bold">SAVED ITEMS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">WISHLIST</h1>
          {!loading && wishlistIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">{products.length} item{products.length !== 1 ? 's' : ''} saved</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-secondary animate-pulse rounded" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-sm font-bold tracking-wider mb-2">YOUR WISHLIST IS EMPTY</h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
              Save items you love while browsing the shop. They'll be here waiting for you.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              EXPLORE COLLECTION
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {products.map(product => (
              <WishlistCard
                key={product.id}
                product={product}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
