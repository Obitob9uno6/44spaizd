import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Star, Trash2, Check, MessageSquare, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-3 h-3 ${n <= rating ? 'fill-primary text-primary' : 'fill-none text-border'}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [moderationOn, setModerationOn] = useState(false);
  const [moderationSaving, setModerationSaving] = useState(false);

  const loadReviews = () => {
    setLoading(true);
    api.reviews.listAll()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
    api.settings.get('reviews_require_approval')
      .then(({ value }) => setModerationOn(value === 'true'))
      .catch(() => {});
  }, []);

  const toggleModeration = async () => {
    const newVal = !moderationOn;
    setModerationSaving(true);
    try {
      await api.settings.set('reviews_require_approval', String(newVal));
      setModerationOn(newVal);
      toast.success(newVal ? 'Review moderation enabled' : 'Review moderation disabled');
    } catch {
      toast.error('Failed to update moderation setting');
    } finally {
      setModerationSaving(false);
    }
  };

  const handleApprove = async (id) => {
    setActing(id + '_approve');
    try {
      const updated = await api.reviews.approve(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: updated.approved } : r));
      toast.success('Review approved');
    } catch {
      toast.error('Failed to approve review');
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async (id) => {
    setActing(id + '_delete');
    try {
      await api.reviews.adminDelete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setActing(null);
    }
  };

  const pending = reviews.filter(r => !r.approved).length;
  const approved = reviews.filter(r => r.approved).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold tracking-widest">REVIEWS</h1>
      </div>
      <p className="text-xs text-muted-foreground tracking-wide mb-4">
        Moderate customer reviews across all products.
      </p>

      {/* Stats + moderation toggle */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span><span className="text-foreground font-bold">{reviews.length}</span> total</span>
          <span>·</span>
          <span><span className="text-green-400 font-bold">{approved}</span> approved</span>
          {pending > 0 && (
            <>
              <span>·</span>
              <span><span className="text-yellow-400 font-bold">{pending}</span> pending</span>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            {moderationOn
              ? <Shield className="w-3.5 h-3.5 text-primary" />
              : <ShieldOff className="w-3.5 h-3.5 text-muted-foreground" />
            }
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
              REQUIRE APPROVAL
            </span>
          </div>
          <button
            onClick={toggleModeration}
            disabled={moderationSaving}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
              moderationOn ? 'bg-primary' : 'bg-muted'
            }`}
            role="switch"
            aria-checked={moderationOn}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                moderationOn ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {moderationOn && pending > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-xs text-yellow-400 font-bold">
          <Shield className="w-4 h-4 flex-shrink-0" />
          {pending} review{pending > 1 ? 's' : ''} awaiting approval
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-xs tracking-wider">
          NO REVIEWS YET
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map(review => {
            const isActingApprove = acting === review.id + '_approve';
            const isActingDelete = acting === review.id + '_delete';
            const date = new Date(review.created_date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });

            return (
              <div
                key={review.id}
                className={`bg-card border rounded p-4 ${
                  !review.approved ? 'border-yellow-500/30' : 'border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold tracking-wider">{review.reviewer_name}</span>
                      <StarDisplay rating={review.rating} />
                      {!review.approved && (
                        <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="text-primary font-bold">{review.product_name || `Product #${review.product_id}`}</span>
                      <span>·</span>
                      <span>{date}</span>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-1">{review.comment}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!review.approved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={isActingApprove || isActingDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-wider border border-green-500/40 text-green-400 bg-green-500/10 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        {isActingApprove ? '...' : 'APPROVE'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isActingApprove || isActingDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-wider border border-border text-muted-foreground rounded hover:border-destructive hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      {isActingDelete ? '...' : 'DELETE'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
