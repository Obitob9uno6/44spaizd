import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { api } from '@/api/client';
import { toast } from 'sonner';

function StarRating({ value, onChange, size = 'sm' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={onChange ? 'button' : undefined}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`${sz} transition-colors ${
              n <= (hovered || value)
                ? 'fill-primary text-primary'
                : 'fill-none text-border'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border pb-6"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-bold tracking-wider">{review.reviewer_name}</p>
          {review.verified_purchase && (
            <span className="text-[9px] text-primary tracking-wider">VERIFIED PURCHASE</span>
          )}
        </div>
        <span className="text-[9px] text-muted-foreground tracking-wider">
          {new Date(review.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </span>
      </div>
      <StarRating value={review.rating} />
      {review.comment && (
        <p className="text-xs text-muted-foreground leading-relaxed mt-3">{review.comment}</p>
      )}
    </motion.div>
  );
}

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ reviewer_name: '', rating: 0, comment: '' });
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    api.reviews.list(productId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [productId]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reviewer_name.trim()) { setFormError('Please enter your name.'); return; }
    if (form.rating === 0) { setFormError('Please select a star rating.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      await api.reviews.create(productId, form);
      toast.success('Review submitted — thanks!');
      setForm({ reviewer_name: '', rating: 0, comment: '' });
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-border mt-16 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground block mb-1">CUSTOMER REVIEWS</span>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-xs text-muted-foreground">
                {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="text-[10px] font-bold tracking-widest border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors"
        >
          {showForm ? 'CANCEL' : 'WRITE A REVIEW'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="border border-border p-6 mb-8 space-y-4">
              <span className="text-[10px] tracking-widest text-muted-foreground block">YOUR REVIEW</span>

              <div>
                <label className="text-[9px] tracking-widest text-muted-foreground block mb-2">RATING *</label>
                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size="lg" />
              </div>

              <div>
                <label className="text-[9px] tracking-widest text-muted-foreground block mb-2">NAME *</label>
                <input
                  type="text"
                  placeholder="YOUR NAME"
                  value={form.reviewer_name}
                  onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                  className="w-full bg-secondary border border-border px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-[9px] tracking-widest text-muted-foreground block mb-2">COMMENT</label>
                <textarea
                  placeholder="WHAT DID YOU THINK?"
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  className="w-full bg-secondary border border-border px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {formError && <p className="text-[10px] text-destructive">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3 text-[11px] font-bold tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => <div key={i} className="h-16 bg-secondary animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xs text-muted-foreground tracking-wider">NO REVIEWS YET — BE THE FIRST</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
