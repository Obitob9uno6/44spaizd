import { motion } from 'framer-motion';
import leafImg from '@/../attached_assets/cannabis-leaf-transparent.png';

const pageThemes = {
  shop: {
    gradient: 'linear-gradient(135deg, rgba(8,6,18,0.85) 0%, rgba(20,40,15,0.7) 40%, rgba(8,6,18,0.95) 100%)',
    leaves: [
      { top: '10%', left: '-5%', size: 'w-64 sm:w-80', rotate: '-25deg', opacity: 0.08 },
      { top: '20%', right: '5%', size: 'w-48 sm:w-64', rotate: '35deg', opacity: 0.06 },
      { bottom: '10%', left: '30%', size: 'w-40 sm:w-56', rotate: '15deg', opacity: 0.04 },
    ],
    accentColor: 'rgba(80,160,70,0.15)',
  },
  about: {
    gradient: 'linear-gradient(180deg, rgba(8,6,18,0.9) 0%, rgba(30,20,50,0.7) 50%, rgba(8,6,18,0.95) 100%)',
    leaves: [
      { top: '5%', right: '-8%', size: 'w-72 sm:w-96', rotate: '20deg', opacity: 0.07 },
      { bottom: '15%', left: '-5%', size: 'w-56 sm:w-72', rotate: '-40deg', opacity: 0.05 },
    ],
    accentColor: 'rgba(110,50,180,0.12)',
  },
  drops: {
    gradient: 'linear-gradient(160deg, rgba(8,6,18,0.88) 0%, rgba(15,35,15,0.65) 50%, rgba(8,6,18,0.95) 100%)',
    leaves: [
      { top: '15%', left: '10%', size: 'w-52 sm:w-72', rotate: '45deg', opacity: 0.07 },
      { top: '5%', right: '15%', size: 'w-44 sm:w-60', rotate: '-15deg', opacity: 0.06 },
      { bottom: '5%', right: '-3%', size: 'w-36 sm:w-48', rotate: '60deg', opacity: 0.04 },
    ],
    accentColor: 'rgba(60,180,60,0.1)',
  },
  vip: {
    gradient: 'linear-gradient(145deg, rgba(8,6,18,0.9) 0%, rgba(50,20,70,0.6) 40%, rgba(8,6,18,0.95) 100%)',
    leaves: [
      { top: '0%', left: '50%', size: 'w-80 sm:w-[28rem]', rotate: '0deg', opacity: 0.05, translate: '-50%' },
      { bottom: '10%', left: '5%', size: 'w-40 sm:w-56', rotate: '-30deg', opacity: 0.06 },
      { bottom: '10%', right: '5%', size: 'w-40 sm:w-56', rotate: '30deg', opacity: 0.06 },
    ],
    accentColor: 'rgba(140,60,200,0.12)',
  },
  wishlist: {
    gradient: 'linear-gradient(170deg, rgba(8,6,18,0.85) 0%, rgba(25,50,20,0.6) 50%, rgba(8,6,18,0.95) 100%)',
    leaves: [
      { top: '10%', right: '10%', size: 'w-56 sm:w-72', rotate: '-20deg', opacity: 0.06 },
      { bottom: '20%', left: '15%', size: 'w-44 sm:w-60', rotate: '25deg', opacity: 0.05 },
    ],
    accentColor: 'rgba(80,160,70,0.1)',
  },
};

export default function PageHero({ theme = 'shop', children, className = '' }) {
  const config = pageThemes[theme] || pageThemes.shop;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{ background: config.gradient }} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {config.leaves.map((leaf, i) => {
          const style = {
            filter: 'brightness(0) invert(1)',
            transform: `rotate(${leaf.rotate})${leaf.translate ? ` translateX(${leaf.translate})` : ''}`,
          };
          const posClass = [
            leaf.top !== undefined && `top-[${leaf.top}]`,
            leaf.bottom !== undefined && `bottom-[${leaf.bottom}]`,
            leaf.left !== undefined && `left-[${leaf.left}]`,
            leaf.right !== undefined && `right-[${leaf.right}]`,
          ].filter(Boolean).join(' ');

          return (
            <img
              key={i}
              src={leafImg}
              alt=""
              className={`absolute ${leaf.size} ${posClass}`}
              style={{ ...style, opacity: leaf.opacity, top: leaf.top, bottom: leaf.bottom, left: leaf.left, right: leaf.right }}
            />
          );
        })}

        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(circle, ${config.accentColor} 0%, transparent 70%)`, filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: `radial-gradient(circle, ${config.accentColor} 0%, transparent 70%)`, filter: 'blur(50px)' }}
        />
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
