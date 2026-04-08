import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sprout, Flame, Handshake } from 'lucide-react';
import PageHero from '../components/PageHero';

export default function About() {
  return (
    <div className="pt-16">
      <PageHero theme="about" className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <span className="text-[10px] text-primary tracking-widest font-bold">PREMIUM CANNABIS-INSPIRED STREETWEAR</span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mt-2">ABOUT SPAIZD</h1>
          <p className="text-sm text-muted-foreground mt-4 max-w-xl leading-relaxed">
            Premium cannabis-inspired streetwear for the cultivation community. Where passion meets fashion in the grow room.
          </p>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">OUR STORY</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Born from the underground cultivation scene, Spaizd represents the intersection of cannabis culture
              and high-end streetwear. We understand the dedication, precision, and artistry that goes into every grow.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our designs celebrate the grower's journey — from seed to harvest, from passion project to lifestyle.
              Every piece tells the story of late nights under grow lights, the satisfaction of a perfect cure,
              and the community that binds us together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">OUR MISSION</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To create premium apparel that honors the craft of cultivation while pushing the boundaries of
              streetwear design. We're not just making clothes — we're building a culture.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every drop is limited, every design is intentional, and every piece is crafted for those who
              understand that growing isn't just a hobby — it's a way of life.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-12">OUR VALUES</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="border border-border p-8 text-center">
              <Sprout className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-xs font-bold tracking-widest mb-3">QUALITY FIRST</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Like a perfect grow, we never compromise on quality. Premium materials, precise construction, exceptional results.
              </p>
            </div>
            <div className="border border-border p-8 text-center">
              <Flame className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-xs font-bold tracking-widest mb-3">LIMITED DROPS</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exclusivity drives desire. Our limited releases ensure you're wearing something truly special and rare.
              </p>
            </div>
            <div className="border border-border p-8 text-center">
              <Handshake className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-xs font-bold tracking-widest mb-3">COMMUNITY</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built by growers, for growers. We're part of a community that shares knowledge, passion, and respect for the craft.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 pt-16 border-t border-border text-center"
        >
          <h2 className="text-xl font-bold tracking-wider mb-4">READY TO JOIN THE CULTURE?</h2>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              SHOP COLLECTION
            </Link>
            <Link
              to="/vip"
              className="inline-flex items-center gap-2 border border-primary/40 text-foreground px-8 py-4 text-xs font-bold tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              JOIN VIP
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
