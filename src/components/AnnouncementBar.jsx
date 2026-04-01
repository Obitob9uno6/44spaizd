import { motion } from 'framer-motion';

export default function AnnouncementBar() {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-primary text-primary-foreground text-center text-[9px] py-2 font-bold tracking-widest z-50"
    >
      FREE SHIPPING ON ALL ORDERS OVER $150 🌿 FREE RETURNS · CALI GROWN ☀️
    </motion.div>
  );
}
