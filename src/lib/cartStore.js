// Simple cart state management using localStorage
const CART_KEY = 'spaizd_cart';

export function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.product_id === item.product_id && i.size === item.size);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-update'));
  return cart;
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
    item.quantity = quantity;
    if (item.quantity <= 0) {
      return removeFromCart(product_id, size);
    }
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
