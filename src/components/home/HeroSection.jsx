import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const DEFAULT_HERO = {
  heading1: 'GOOD VIBES,',
  heading2: 'BETTER FITS',
  subheading: 'California-grown streetwear for the laid-back and deliberate. Sun-soaked fabrics, slow fashion, real culture.',
  buttonText: 'EXPLORE COLLECTION',
  buttonLink: '/shop',
};

const HERO_IMAGE = '/images/hero-default.jpg';

export default function HeroSection() {
  const [heroContent, setHeroContent] = useState(DEFAULT_HERO);

  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        const res = await fetch('/api/content/hero');
        if (res.ok) {
          const data = await res.json();
          if (data.data && Object.keys(data.data).length > 0) {
            setHeroContent(data.data);
          }
        }
      } catch (err) {
        console.warn('[v0] Failed to load hero content:', err);
      }
    };
    loadHeroContent();
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="SPAIZD Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,6,18,0.7) 0%, rgba(8,6,18,0.4) 40%, rgba(8,6,18,0.92) 100%)' }} />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="smoke-1 absolute bottom-1/4 left-[20%] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(80,160,70,0.15) 0%, rgba(100,50,160,0.08) 60%, transparent 80%)', filter: 'blur(45px)' }} />
        <div className="smoke-2 absolute bottom-1/3 right-[15%] w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(110,50,180,0.12) 0%, rgba(60,130,60,0.06) 60%, transparent 80%)', filter: 'blur(55px)' }} />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-4">
            {heroContent.heading1}
            <br />
            <span className="text-primary">{heroContent.heading2}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
            {heroContent.subheading}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={heroContent.buttonLink}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              {heroContent.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/vip"
              className="inline-flex items-center gap-2 border border-primary/40 text-foreground px-8 py-4 text-xs font-bold tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              VIP CLUB
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground tracking-widest">CALI GROWN</span>
          <span className="text-[10px] text-muted-foreground tracking-widest hidden sm:block">FREE SHIPPING OVER $150</span>
          <span className="text-[10px] text-muted-foreground tracking-widest">SLOW FASHION</span>
        </div>
      </div>
    </section>
  );
}
