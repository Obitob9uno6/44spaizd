const WISHLIST_KEY = 'spaizd_wishlist';

export function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function isWishlisted(productId) {
  return getWishlist().some(id => id === productId);
}

export function toggleWishlist(productId) {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx === -1) {
    list.push(productId);
  } else {
    list.splice(idx, 1);
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('wishlist-update', { detail: { productId } }));
  return idx === -1;
}
