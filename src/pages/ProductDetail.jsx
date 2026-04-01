import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { motion } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Heart } from 'lucide-react';
import { addToCart } from '../lib/cartStore';
import { isWishlisted, toggleWishlist } from '@/lib/wishlistStore';
import { toast } from 'sonner';
import SizeGuideModal from '@/components/SizeGuideModal';
import RelatedProducts from '@/components/RelatedProducts';
import ReviewsSection from '@/components/ReviewsSection';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await api.products.get(id);
        setProduct(p);
        if (p.sizes?.length > 0) setSelectedSize(p.sizes[0]);
        setWishlisted(isWishlisted(p.id));
      } catch {
        setProduct(null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    const handler = () => product && setWishlisted(isWishlisted(product.id));
    window.addEventListener('wishlist-update', handler);
    return () => window.removeEventListener('wishlist-update', handler);
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
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

  const handleWishlist = () => {
    const added = toggleWishlist(product.id);
    setWishlisted(added);
    toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist');
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
  const isPants = product.category === 'pants';

  return (
    <div className="pt-16">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/shop" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground tracking-wider hover:text-foreground transition-colors">
            <ChevronLeft className="w-3 h-3" /> BACK TO SHOP
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
          {/* Images */}
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
            {product.images.length > 1 && (
              <div className="flex gap-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-[10px] text-muted-foreground tracking-widest">{product.category?.toUpperCase()}</span>
              <h1 className="text-2xl font-bold tracking-tight mt-1">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xl font-bold">${Number(product.price).toFixed(2)}</span>
                {product.compare_price && product.compare_price > product.price && (
                  <span className="text-sm text-muted-foreground line-through">${Number(product.compare_price).toFixed(2)}</span>
                )}
              </div>
            </div>

            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground tracking-widest">SIZE</span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-[9px] tracking-wider text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
                  >
                    SIZE GUIDE
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 text-xs font-bold tracking-wider border transition-colors ${
                        selectedSize === s
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-[10px] text-muted-foreground tracking-widest mb-2 block">QUANTITY</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="flex-1 bg-primary text-primary-foreground py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSoldOut ? 'SOLD OUT' : 'ADD TO TRIM ROOM'}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 flex items-center justify-center border transition-colors ${
                  wishlisted
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
                title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-primary' : ''}`} />
              </button>
            </div>

            {product.description && (
              <div>
                <span className="text-[10px] text-muted-foreground tracking-widest mb-2 block">DETAILS</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.materials && (
              <div>
                <span className="text-[10px] text-muted-foreground tracking-widest mb-1 block">MATERIALS</span>
                <p className="text-xs text-muted-foreground">{product.materials}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection productId={id} />

        {/* Related products */}
        <RelatedProducts currentProductId={id} category={product.category} />
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={isPants ? 'pants' : 'tops'}
      />
    </div>
  );
}
