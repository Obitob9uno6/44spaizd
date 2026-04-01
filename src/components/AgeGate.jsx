import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const confirmed = localStorage.getItem('spaizd_age_confirmed');
    if (!confirmed) setVisible(true);
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('spaizd_age_confirmed', 'true');
    setVisible(false);
  };

  const handleDeny = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--accent)/0.08)_0%,transparent_70%)] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative text-center max-w-sm mx-4 px-8 py-12 border border-border bg-background/80 backdrop-blur"
          >
            <div className="mb-8">
              <p className="text-[9px] tracking-[0.4em] text-muted-foreground mb-3">SPAIZD</p>
              <div className="w-8 h-px bg-primary mx-auto mb-6" />
              <h1 className="text-3xl font-bold tracking-tight mb-2">21+</h1>
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase">Age Verification Required</p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-8">
              This site contains content intended for adults 21 and over.
              By entering, you confirm you are of legal age.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] font-bold tracking-[0.2em] hover:bg-primary/90 transition-colors"
              >
                I AM 21 OR OLDER — ENTER
              </button>
              <button
                onClick={handleDeny}
                className="w-full border border-border text-muted-foreground py-3 text-[10px] tracking-widest hover:border-foreground hover:text-foreground transition-colors"
              >
                I AM UNDER 21 — EXIT
              </button>
            </div>

            <p className="text-[9px] text-muted-foreground mt-6 leading-relaxed">
              By entering this site you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
