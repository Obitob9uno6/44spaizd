import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { api } from '@/api/client';

const HERO_IMAGE = 'https://media.base44.com/images/public/69c24a17aa6484141262ec29/3bce5b7c6_generated_image.png';

function calcCountdown(target) {
  const diff = Math.max(0, target - Date.now());
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return { h, m, s, diff };
}

export default function HeroSection() {
  const [dropAt, setDropAt] = useState(null);
  const [status, setStatus] = useState('loading');
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });
  const intervalRef = useRef(null);

  useEffect(() => {
    api.settings.get('next_drop_at')
      .then(({ value }) => {
        if (!value) {
          setStatus('none');
          return;
        }
        const ts = new Date(value).getTime();
        if (isNaN(ts)) {
          setStatus('none');
          return;
        }
        setDropAt(ts);
        const { diff } = calcCountdown(ts);
        if (diff === 0) {
          setStatus('live');
        } else {
          setStatus('counting');
          setCountdown(calcCountdown(ts));
        }
      })
      .catch(() => setStatus('none'));
  }, []);

  useEffect(() => {
    if (status !== 'counting' || !dropAt) return;
    intervalRef.current = setInterval(() => {
      const result = calcCountdown(dropAt);
      setCountdown(result);
      if (result.diff === 0) {
        setStatus('live');
        clearInterval(intervalRef.current);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [status, dropAt]);

  const pad = (n) => String(n).padStart(2, '0');

  const dropLabel = () => {
    if (status === 'live') return '🌿 DROP IS LIVE — SHOP NOW';
    if (status === 'counting') return `🌿 NEXT DROP — ${pad(countdown.h)}:${pad(countdown.m)}:${pad(countdown.s)}`;
    return null;
  };

  const ghostLabel = () => {
    if (status === 'live') return 'LIVE';
    if (status === 'counting') return `${pad(countdown.h)}:${pad(countdown.m)}`;
    return null;
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="SPAIZD Collection"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient to remove white brightness */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,6,18,0.7) 0%, rgba(8,6,18,0.4) 40%, rgba(8,6,18,0.92) 100%)' }} />
      </div>

      {/* Smoke wisps over hero */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="smoke-1 absolute bottom-1/4 left-[20%] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(80,160,70,0.15) 0%, rgba(100,50,160,0.08) 60%, transparent 80%)', filter: 'blur(45px)' }} />
        <div className="smoke-2 absolute bottom-1/3 right-[15%] w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(110,50,180,0.12) 0%, rgba(60,130,60,0.06) 60%, transparent 80%)', filter: 'blur(55px)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Ghost countdown behind text */}
        {ghostLabel() && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] select-none">
            <span className="text-[100px] sm:text-[180px] font-bold tracking-tighter text-primary">
              {ghostLabel()}
            </span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {dropLabel() && (
            <div className="mb-4">
              <span className={`text-[10px] tracking-widest font-bold pulse-glow ${status === 'live' ? 'text-green-400' : 'text-primary'}`}>
                {dropLabel()}
              </span>
            </div>
          )}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-4">
            GOOD VIBES,
            <br />
            <span className="text-primary">BETTER FITS</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
            California-grown streetwear for the laid-back and deliberate. Sun-soaked fabrics, slow fashion, real culture.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              EXPLORE COLLECTION
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

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground tracking-widest">CALI GROWN 🌿</span>
          <span className="text-[10px] text-muted-foreground tracking-widest hidden sm:block">FREE SHIPPING OVER $150</span>
          <span className="text-[10px] text-muted-foreground tracking-widest">SLOW FASHION ☀️</span>
        </div>
      </div>
    </section>
  );
}
