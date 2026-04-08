import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Search, Package } from 'lucide-react';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const email = state?.email;

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
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
        <p className="text-xs text-muted-foreground leading-relaxed mb-8">
          Your order has been placed. You'll receive a confirmation email shortly with tracking details.
        </p>
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
