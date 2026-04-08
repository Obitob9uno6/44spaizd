import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Search, Package, Tag } from 'lucide-react';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const email = state?.email;
  const promoCode = state?.promoCode;
  const discount = state?.discount || 0;
  const subtotal = state?.subtotal;
  const shipping = state?.shipping;
  const total = state?.total;

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        <div className="w-16 h-16 mx-auto mb-6 border border-primary flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">ORDER CONFIRMED</h1>
        {orderId && (
          <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-wider">
            ORDER #{orderId}
          </p>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
          Your order has been placed. You'll receive a confirmation email shortly with tracking details.
        </p>

        {(subtotal != null || discount > 0) && (
          <div className="border border-border mb-8 text-left">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[9px] text-muted-foreground tracking-widest font-bold">ORDER SUMMARY</p>
            </div>
            <div className="px-5 py-4 space-y-2 text-xs">
              {subtotal != null && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${Number(subtotal).toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {promoCode || 'Discount'}
                  </span>
                  <span>-${Number(discount).toFixed(2)}</span>
                </div>
              )}
              {shipping != null && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{Number(shipping) === 0 ? 'FREE' : `$${Number(shipping).toFixed(2)}`}</span>
                </div>
              )}
              {total != null && (
                <div className="flex justify-between font-bold border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span>${Number(total).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/shop"
            className="bg-primary text-primary-foreground px-8 py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
          {orderId && email ? (
            <Link
              to={`/order-lookup?id=${orderId}&email=${encodeURIComponent(email)}`}
              className="border border-border text-foreground px-8 py-3 text-xs font-bold tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-3 h-3" /> TRACK ORDER
            </Link>
          ) : (
            <Link
              to="/order-lookup"
              className="border border-border text-foreground px-8 py-3 text-xs font-bold tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-3 h-3" /> LOOK UP ORDER
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
