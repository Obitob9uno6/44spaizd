import { motion } from 'framer-motion';
import weed1 from '@/../attached_assets/weed1_1775650522818.jpg';
import weed2 from '@/../attached_assets/weed2_1775650522817.jpg';

const pageThemes = {
  shop: {
    image: weed1,
    gradient: 'linear-gradient(to bottom, rgba(8,6,18,0.75) 0%, rgba(8,6,18,0.5) 40%, rgba(8,6,18,0.9) 100%)',
  },
  about: {
    image: weed2,
    gradient: 'linear-gradient(to bottom, rgba(8,6,18,0.7) 0%, rgba(8,6,18,0.45) 40%, rgba(8,6,18,0.92) 100%)',
  },
  drops: {
    image: weed1,
    gradient: 'linear-gradient(135deg, rgba(8,6,18,0.8) 0%, rgba(8,6,18,0.45) 50%, rgba(8,6,18,0.9) 100%)',
  },
  vip: {
    image: weed2,
    gradient: 'linear-gradient(160deg, rgba(8,6,18,0.78) 0%, rgba(20,10,40,0.5) 40%, rgba(8,6,18,0.92) 100%)',
  },
  wishlist: {
    image: weed1,
    gradient: 'linear-gradient(to bottom, rgba(8,6,18,0.8) 0%, rgba(8,6,18,0.5) 50%, rgba(8,6,18,0.92) 100%)',
  },
};

export default function PageHero({ theme = 'shop', children, className = '' }) {
  const config = pageThemes[theme] || pageThemes.shop;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        <img
          src={config.image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: config.gradient }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
