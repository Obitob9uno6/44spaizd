import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CannabisLeaf from './icons/CannabisLeaf';
import { isWishlisted, toggleWishlist } from '@/lib/wishlistStore';

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isWishlisted(product.id));
    const handler = () => setWishlisted(isWishlisted(product.id));
    window.addEventListener('wishlist-update', handler);
    return () => window.removeEventListener('wishlist-update', handler);
  }, [product.id]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    setWishlisted(added);
  };

  const badge = product.badge;
  const hasSecondImage = product.images && product.images.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative"
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="group relative overflow-hidden bg-secondary cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={hovered && hasSecondImage ? product.images[1] : product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 border border-primary/20" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/40" />
            </div>

            {badge && badge !== '' && (
              <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-widest ${
                badge === 'LIMITED' ? 'bg-primary text-primary-foreground' :
                badge === 'SOLD OUT' ? 'bg-muted text-muted-foreground' :
                'bg-foreground text-background'
              }`}>
                {badge}
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-background/80 backdrop-blur-sm border transition-all duration-200 ${
                wishlisted ? 'border-primary' : 'border-transparent opacity-0 group-hover:opacity-100'
              }`}
            >
              <CannabisLeaf
                className={`w-3.5 h-3.5 transition-colors ${
                  wishlisted ? 'fill-primary text-primary' : 'text-foreground'
                }`}
              />
            </button>

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[9px] text-muted-foreground tracking-wider">{product.sku}</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <h3 className="text-xs font-bold tracking-wider truncate">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">${product.price?.toFixed(2)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-[10px] text-muted-foreground line-through">
                  ${product.compare_price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
