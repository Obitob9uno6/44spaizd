import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmation() {
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
          <Link
            to="/"
            className="border border-border text-foreground px-8 py-3 text-xs font-bold tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            HOME
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
