import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Clock, Tag } from 'lucide-react';

const features = [
  { icon: Clock, title: 'EARLY ACCESS', desc: 'Get first pick on drops — 24 to 72 hours before everyone else.' },
  { icon: Zap, title: 'EXCLUSIVE DROPS', desc: 'Cali-only colorways, limited runs, and members-only pieces.' },
  { icon: Tag, title: 'MEMBER PRICING', desc: 'Up to 20% off every order, always. Plus free shipping.' },
];

export default function VIPPromo() {
  return (
    <section className="py-20 sm:py-32 border-t border-border relative overflow-hidden">
      {/* Cannabis bud background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src="https://media.base44.com/images/public/69c24a17aa6484141262ec29/2a2b9152a_generated_image.png"
          className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-[0.06]"
          alt="" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at right, rgba(120,50,200,0.08) 0%, transparent 60%)' }} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] text-primary tracking-widest font-bold mb-2 block">VIP EXCLUSIVE</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
              JOIN THE
              <br />
              <span className="text-primary">VIP CLUB</span>
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mb-8">
              Sun's out, drip's out. Get early access to drops, exclusive Cali colorways, and member-only pricing. Good things come to those who join.
            </p>
            <Link
              to="/vip"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              EXPLORE VIP
            </Link>
          </motion.div>

          {/* Right - features */}
          <div className="space-y-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className="border border-border p-6 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wider mb-1">{feature.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
