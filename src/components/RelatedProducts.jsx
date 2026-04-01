import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

export default function RelatedProducts({ currentProductId, category }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!category) return;
    api.products.filter({ category, is_active: true }, '-created_date', 8)
      .then(all => setProducts(all.filter(p => p.id !== parseInt(currentProductId)).slice(0, 4)))
      .catch(() => {});
  }, [currentProductId, category]);

  if (products.length === 0) return null;

  return (
    <div className="border-t border-border mt-16 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground">YOU MAY ALSO LIKE</span>
          <div className="flex-1 h-px bg-border mx-4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
