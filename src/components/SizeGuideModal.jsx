import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEES_HOODIES = [
  { size: 'XS', chest: '32–34', length: '26', shoulder: '16' },
  { size: 'S',  chest: '35–37', length: '27', shoulder: '17' },
  { size: 'M',  chest: '38–40', length: '28', shoulder: '18' },
  { size: 'L',  chest: '41–43', length: '29', shoulder: '19' },
  { size: 'XL', chest: '44–46', length: '30', shoulder: '20.5' },
  { size: 'XXL',chest: '47–50', length: '31', shoulder: '22' },
];

const PANTS = [
  { size: 'XS', waist: '26–28', hip: '34–36', inseam: '30' },
  { size: 'S',  waist: '29–31', hip: '37–39', inseam: '30' },
  { size: 'M',  waist: '32–34', hip: '40–42', inseam: '31' },
  { size: 'L',  waist: '35–37', hip: '43–45', inseam: '31' },
  { size: 'XL', waist: '38–40', hip: '46–48', inseam: '32' },
  { size: 'XXL',waist: '41–44', hip: '49–52', inseam: '32' },
];

export default function SizeGuideModal({ open, onClose, category = 'tees' }) {
  const isPants = category === 'pants';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="bg-background border border-border w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <p className="text-[9px] tracking-[0.3em] text-muted-foreground">SPAIZD</p>
                <h2 className="text-sm font-bold tracking-wider mt-0.5">SIZE GUIDE</h2>
              </div>
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-[10px] text-muted-foreground tracking-wider mb-4">
                ALL MEASUREMENTS IN INCHES — SPAIZD RUNS TRUE TO SIZE
              </p>

              {!isPants ? (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">SIZE</th>
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">CHEST</th>
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">LENGTH</th>
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">SHOULDER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEES_HOODIES.map((row, i) => (
                      <tr key={row.size} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-secondary/30' : ''}`}>
                        <td className="py-2.5 font-bold">{row.size}</td>
                        <td className="py-2.5 text-muted-foreground">{row.chest}"</td>
                        <td className="py-2.5 text-muted-foreground">{row.length}"</td>
                        <td className="py-2.5 text-muted-foreground">{row.shoulder}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">SIZE</th>
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">WAIST</th>
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">HIP</th>
                      <th className="text-left py-2 text-[9px] tracking-widest text-muted-foreground font-normal">INSEAM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PANTS.map((row, i) => (
                      <tr key={row.size} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-secondary/30' : ''}`}>
                        <td className="py-2.5 font-bold">{row.size}</td>
                        <td className="py-2.5 text-muted-foreground">{row.waist}"</td>
                        <td className="py-2.5 text-muted-foreground">{row.hip}"</td>
                        <td className="py-2.5 text-muted-foreground">{row.inseam}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <p className="text-[9px] text-muted-foreground mt-5 leading-relaxed">
                For oversized fits, size down. Measurements are of the garment, not the body.
                If you're between sizes, go up for a relaxed fit.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
