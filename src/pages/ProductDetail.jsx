import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { addToCart } from '../lib/cartStore';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function load() {
      const results = await base44.entities.Product.filter({ id }, '', 1);
      if (results.length > 0) {
        setProduct(results[0]);
        if (results[0].sizes?.length > 0) {
          setSelectedSize(results[0].sizes[0]);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({
      product_id: product.id,
      name: product.name,
      size: selectedSize,
      quantity,
      price: product.price,
      image: product.images[0],
    });
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xs text-muted-foreground tracking-wider">PRODUCT NOT FOUND</p>
        <Link to="/shop" className="text-xs text-primary font-bold tracking-wider">← BACK TO SHOP</Link>
      </div>
    );
  }

  const isSoldOut = product.badge === 'SOLD OUT' || product.stock === 0;

  return (
    <div className="pt-16">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/shop" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground tracking-wider hover:text-foreground transition-colors">
            <ChevronLeft className="w-3 h-3" /> BACK TO SHOP
          </Link>
        </div>
      </div>

      {/* PDP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
          {/* Images - 60% */}
          <div className="lg:col-span-3 space-y-1">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-[3/4] bg-secondary overflow-hidden relative"
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && product.badge !== '' && (
                <div className={`absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold tracking-widest ${
                  product.badge === 'LIMITED' ? 'bg-primary text-primary-foreground' :
                  product.badge === 'SOLD OUT' ? 'bg-muted text-muted-foreground' :
                  'bg-foreground text-background'
                }`}>
                  {product.badge}
                </div>
              )}
            </motion.div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-24 bg-secondary overflow-hidden border-2 transition-colors ${
                      activeImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Spec Sheet - 40% */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Title & Price */}
              <div>
                <span className="text-[10px] text-muted-foreground tracking-widest mb-1 block">
                  {product.category?.toUpperCase()} — {product.sku}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{product.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">${product.price?.toFixed(2)}</span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.compare_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-6">
                  {product.description}
                </p>
              )}

              {/* Technical Specs */}
              <div className="border border-border divide-y divide-border">
                {product.materials && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-[10px] text-muted-foreground tracking-wider">MATERIAL</span>
                    <span className="text-[10px] tracking-wider">{product.materials}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-[10px] text-muted-foreground tracking-wider">WEIGHT</span>
                    <span className="text-[10px] tracking-wider">{product.weight}</span>
                  </div>
                )}
                {product.origin && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-[10px] text-muted-foreground tracking-wider">ORIGIN</span>
                    <span className="text-[10px] tracking-wider">{product.origin}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-3">
                  <span className="text-[10px] text-muted-foreground tracking-wider">STOCK</span>
                  <span className={`text-[10px] tracking-wider ${product.stock <= 5 ? 'text-primary' : ''}`}>
                    {isSoldOut ? 'SOLD OUT' : product.stock <= 5 ? `ONLY ${product.stock} LEFT` : 'IN STOCK'}
                  </span>
                </div>
              </div>

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div>
                  <span className="text-[10px] text-muted-foreground tracking-widest mb-3 block">SELECT SIZE</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-10 px-3 text-[10px] font-bold tracking-wider border transition-colors ${
                          selectedSize === size
                            ? 'border-primary text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <span className="text-[10px] text-muted-foreground tracking-widest mb-3 block">QUANTITY</span>
                <div className="flex items-center gap-0 border border-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-xs font-bold border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`w-full py-4 text-xs font-bold tracking-widest transition-colors ${
                  isSoldOut
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isSoldOut ? 'SOLD OUT' : 'ADD TO CART'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
