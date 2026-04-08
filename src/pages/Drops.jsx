import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Zap } from 'lucide-react';
import { api } from '@/api/client';
import PageHero from '../components/PageHero';

function calcCountdown(target) {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return { d, h, m, s, diff };
}

export default function Drops() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'upcoming';
  const [dropAt, setDropAt] = useState(null);
  const [status, setStatus] = useState('loading');
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [products, setProducts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    api.settings.get('next_drop_at')
      .then(({ value }) => {
        if (!value) { setStatus('none'); return; }
        const ts = new Date(value).getTime();
        if (isNaN(ts)) { setStatus('none'); return; }
        setDropAt(ts);
        const { diff } = calcCountdown(ts);
        setStatus(diff === 0 ? 'live' : 'counting');
        setCountdown(calcCountdown(ts));
      })
      .catch(() => setStatus('none'));
  }, []);

  useEffect(() => {
    api.products.list()
      .then(data => setProducts(data.filter(p => p.is_active)))
      .catch(() => {});
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

  return (
    <div className="pt-16">
      <PageHero theme="drops" className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <span className="text-[10px] text-primary tracking-widest font-bold">LIMITED RELEASES</span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mt-2">DROPS</h1>
          <div className="flex gap-6 mt-6">
            <Link
              to="/drops?tab=upcoming"
              className={`text-xs font-bold tracking-widest pb-2 border-b-2 transition-colors ${
                tab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              UPCOMING
            </Link>
            <Link
              to="/drops?tab=out-now"
              className={`text-xs font-bold tracking-widest pb-2 border-b-2 transition-colors ${
                tab === 'out-now' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              OUT NOW
            </Link>
          </div>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {tab === 'upcoming' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {status === 'counting' ? (
              <div className="text-center py-16">
                <Clock className="w-8 h-8 text-primary mx-auto mb-6" />
                <h2 className="text-xl font-bold tracking-wider mb-2">NEXT DROP INCOMING</h2>
                <p className="text-sm text-muted-foreground mb-8">Mark your calendar. Limited pieces, first come first served.</p>
                <div className="flex justify-center gap-4 sm:gap-6 mb-8">
                  {[
                    { label: 'DAYS', value: pad(countdown.d) },
                    { label: 'HRS', value: pad(countdown.h) },
                    { label: 'MIN', value: pad(countdown.m) },
                    { label: 'SEC', value: pad(countdown.s) },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-border p-4 sm:p-6 min-w-[70px] sm:min-w-[90px]">
                      <div className="text-2xl sm:text-4xl font-bold tracking-tight text-primary">{value}</div>
                      <div className="text-[9px] tracking-widest text-muted-foreground mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/vip"
                  className="inline-flex items-center gap-2 border border-primary/40 text-foreground px-8 py-4 text-xs font-bold tracking-widest hover:border-primary hover:text-primary transition-colors"
                >
                  JOIN VIP FOR EARLY ACCESS
                </Link>
              </div>
            ) : status === 'live' ? (
              <div className="text-center py-16">
                <Zap className="w-8 h-8 text-green-400 mx-auto mb-6" />
                <h2 className="text-xl font-bold tracking-wider mb-2 text-green-400">DROP IS LIVE</h2>
                <p className="text-sm text-muted-foreground mb-8">The latest collection just dropped. Get it before it's gone.</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
                >
                  SHOP THE DROP
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-sm font-bold tracking-wider mb-2">NO UPCOMING DROPS</h2>
                <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
                  Stay tuned. Join the VIP Club to get notified first when the next drop is announced.
                </p>
                <Link
                  to="/vip"
                  className="inline-flex items-center gap-2 border border-primary/40 text-foreground px-6 py-3 text-xs font-bold tracking-widest hover:border-primary hover:text-primary transition-colors"
                >
                  JOIN VIP CLUB
                </Link>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product, i) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <div className="aspect-[3/4] bg-secondary overflow-hidden mb-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">NO IMG</div>
                        )}
                      </div>
                      <h3 className="text-xs font-bold tracking-wider truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">${Number(product.price).toFixed(2)}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-sm font-bold tracking-wider mb-2">NO CURRENT DROPS</h2>
                <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
                  Check back soon for new releases.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
                >
                  BROWSE SHOP
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
