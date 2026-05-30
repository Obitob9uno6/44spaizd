(function () {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const formatMoney = (cents, currency = 'USD') => (Number(cents || 0) / 100).toLocaleString(undefined, { style: 'currency', currency });
  const escapeHTML = (value = '') => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

  document.documentElement.classList.remove('no-js');

  const menuToggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    $$('a', menu).forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }));
  }

  const gate = $('[data-age-gate]');
  if (gate && !localStorage.getItem('spaizd_age_ok')) {
    gate.hidden = false;
    $('[data-age-accept]', gate)?.addEventListener('click', () => {
      localStorage.setItem('spaizd_age_ok', '1');
      gate.hidden = true;
    });
  }

  const drawer = $('[data-cart-drawer]');
  const drawerPanel = $('.cart-drawer__panel', drawer || document);
  const openCart = () => {
    if (!drawer) return;
    drawer.hidden = false;
    document.body.classList.add('cart-open');
    drawerPanel?.focus();
  };
  const closeCart = () => {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.classList.remove('cart-open');
  };

  $$('[data-cart-open]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    refreshCart().then(openCart);
  }));
  $$('[data-cart-close]').forEach((button) => button.addEventListener('click', closeCart));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });

  function renderCart(cart) {
    $$('[data-cart-count]').forEach((el) => { el.textContent = cart.item_count; });
    $$('[data-cart-drawer-count]').forEach((el) => { el.textContent = `[${cart.item_count}]`; });
    $$('[data-cart-total]').forEach((el) => { el.textContent = formatMoney(cart.total_price, cart.currency); });
    $$('[data-cart-footer]').forEach((el) => { el.hidden = cart.item_count === 0; });
    const container = $('[data-cart-items]');
    if (!container) return;
    if (!cart.items.length) {
      container.innerHTML = '<div class="cart-empty" data-cart-empty><h3>YOUR TRIM ROOM IS EMPTY</h3><p>Add pieces to your trim room and we’ll get you sorted.</p><a class="button" href="/collections/all-products">EXPLORE COLLECTION</a></div>';
      return;
    }
    container.innerHTML = cart.items.map((item, index) => {
      const title = escapeHTML(item.product_title);
      const image = item.image ? `<img src="${item.image}" alt="${title}" loading="lazy">` : '';
      const variant = item.variant_title && item.variant_title !== 'Default Title' ? escapeHTML(item.variant_title) : '';
      return `<div class="cart-item" data-line="${index + 1}">${image}<div class="cart-item__body"><h3>${title}</h3><p>${variant}</p><div class="cart-item__controls"><button type="button" data-cart-change="${index + 1}" data-quantity="${Math.max(0, item.quantity - 1)}">−</button><span>${item.quantity}</span><button type="button" data-cart-change="${index + 1}" data-quantity="${item.quantity + 1}">+</button><button type="button" class="cart-item__remove" data-cart-change="${index + 1}" data-quantity="0">Remove</button></div></div><strong>${formatMoney(item.final_line_price, cart.currency)}</strong></div>`;
    }).join('');
  }

  async function refreshCart() {
    const cart = await fetch('/cart.js', { headers: { Accept: 'application/json' } }).then((response) => response.json());
    renderCart(cart);
    return cart;
  }

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-cart-change]');
    if (!button) return;
    button.disabled = true;
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: Number(button.dataset.cartChange), quantity: Number(button.dataset.quantity) })
      });
      await refreshCart();
    } finally {
      button.disabled = false;
    }
  });

  $$('.js-product-form').forEach((form) => {
    const section = form.closest('[data-product-section]');
    const variants = JSON.parse($('[data-product-json]', section)?.textContent || '[]');
    const variantInput = $('[data-variant-id]', form);
    const price = $('[data-product-price]', section);
    const submit = $('button[type="submit"]', form);

    function selectVariant() {
      const selected = $$('input[type="radio"]:checked', form).map((input) => input.value);
      const match = variants.find((variant) => variant.options.every((option, index) => option === selected[index])) || variants[0];
      if (!match || !variantInput) return;
      variantInput.value = match.id;
      if (price) price.textContent = formatMoney(match.price, window.Shopify?.currency?.active || 'USD');
      if (submit) {
        submit.disabled = !match.available;
        submit.textContent = match.available ? submit.dataset.addText : submit.dataset.soldText;
      }
    }

    form.addEventListener('change', selectVariant);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      try {
        submit?.setAttribute('aria-busy', 'true');
        const response = await fetch('/cart/add.js', { method: 'POST', headers: { Accept: 'application/json' }, body: data });
        if (!response.ok) throw new Error('Add failed');
        await refreshCart();
        openCart();
      } catch (error) {
        form.submit();
      } finally {
        submit?.removeAttribute('aria-busy');
      }
    });
    selectVariant();
  });
})();
