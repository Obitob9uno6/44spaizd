import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);

  const badge = product.badge;
  const hasSecondImage = product.images && product.images.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="group relative overflow-hidden bg-secondary cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={hovered && hasSecondImage ? product.images[1] : product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Hover overlay - RGB shift effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 border border-primary/20" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/40" />
            </div>

            {/* Badge */}
            {badge && badge !== '' && (
              <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-widest ${
                badge === 'LIMITED' ? 'bg-primary text-primary-foreground' :
                badge === 'SOLD OUT' ? 'bg-muted text-muted-foreground' :
                'bg-foreground text-background'
              }`}>
                {badge}
              </div>
            )}

            {/* SKU overlay */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[9px] text-muted-foreground tracking-wider">{product.sku}</span>
            </div>
          </div>

          {/* Info */}
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
