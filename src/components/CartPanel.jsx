import { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, Scissors } from 'lucide-react';
import { getCart, removeFromCart, updateCartQuantity, getCartTotal, clearCart } from '../lib/cartStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import cartBg from '@/../attached_assets/cart2_1775651048981.jpg';

export default function CartPanel({ isOpen, onClose }) {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setCart(getCart());
    update();
    window.addEventListener('cart-update', update);
    return () => window.removeEventListener('cart-update', update);
  }, []);

  const total = getCartTotal(cart);
  const shipping = total >= 150 ? 0 : 12;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg border-l border-border flex flex-col h-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={cartBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold tracking-widest">TRIM ROOM [{cart.length}]</h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Scissors className="w-10 h-10 text-muted-foreground/30 mb-4" />
              <h3 className="text-sm font-bold tracking-wider mb-2">YOUR TRIM ROOM IS EMPTY</h3>
              <p className="text-xs text-muted-foreground mb-6 max-w-xs">
                Add some pieces to your trim room and we'll get you sorted.
              </p>
              <button
                onClick={() => { onClose(); navigate('/shop'); }}
                className="bg-primary text-primary-foreground px-8 py-3 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-border">
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover bg-secondary" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold tracking-wider">{item.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">SIZE: {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.size, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-border text-foreground hover:border-primary transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const stock = item.stock ?? Infinity;
                            if (stock !== Infinity && item.quantity >= stock) {
                              toast.error(`Only ${stock} in stock`);
                              return;
                            }
                            updateCartQuantity(item.product_id, item.size, item.quantity + 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center border border-border text-foreground hover:border-primary transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeFromCart(item.product_id, item.size)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="relative z-10 px-6 py-5 border-t border-border space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>SUBTOTAL</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>SHIPPING</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span>${(total + shipping).toFixed(2)}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/checkout'); }}
              className="w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors mt-2"
            >
              CHECKOUT THE HARVEST
            </button>
            <button
              onClick={() => clearCart()}
              className="w-full text-[10px] text-muted-foreground tracking-wider hover:text-foreground transition-colors text-center py-1"
            >
              CLEAR CART
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
