const CART_KEY = 'spaizd_cart';

export function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.product_id === item.product_id && i.size === item.size);
  const stock = item.stock ?? Infinity;

  if (existing) {
    const newQty = existing.quantity + item.quantity;
    if (stock !== Infinity && newQty > stock) {
      existing.quantity = stock;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-update'));
      return { cart, limitReached: true };
    }
    existing.quantity = newQty;
    if (item.stock !== undefined) existing.stock = item.stock;
  } else {
    const capped = { ...item };
    let newItemLimitReached = false;
    if (stock !== Infinity && capped.quantity > stock) {
      capped.quantity = stock;
      newItemLimitReached = true;
    }
    cart.push(capped);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-update'));
    return { cart, limitReached: newItemLimitReached };
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-update'));
  return { cart, limitReached: false };
}

export function removeFromCart(product_id, size) {
  let cart = getCart();
  cart = cart.filter(i => !(i.product_id === product_id && i.size === size));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-update'));
  return cart;
}

export function updateCartQuantity(product_id, size, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.product_id === product_id && i.size === size);
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(product_id, size);
    }
    const stock = item.stock ?? Infinity;
    item.quantity = stock !== Infinity ? Math.min(quantity, stock) : quantity;
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-update'));
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-update'));
  return [];
}

export function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
