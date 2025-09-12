/* header.js
   Shared header/nav/stars/cart utilities for Sai Balaji Tiles
   Drop this file in your project and include <script src="header.js"></script>
*/

(function () {
  'use strict';

  // -----------------------
  // Configuration
  // -----------------------
  const MAX_STARS = 220;           // upper limit for star DOM nodes
  const STARS_DENSITY = 1 / 18;    // 1 star per ~N px width (lower -> more stars)
  const STARS_CONTAINER_ID = 'stars-bg-global';

  // IDs that may appear across your pages - script will pick whichever are present
  const NAVBAR_IDS = {
    index: { toggleId: 'toggle-btn-index', navbarId: 'main-navbar-index' },
    detail: { toggleId: 'toggle-btn-detail', navbarId: 'main-navbar-detail' },
    cart: { toggleId: 'toggle-btn-cart', navbarId: 'main-navbar-cart' }
  };

  const CART_COUNT_IDS = ['cart-count-index', 'cart-count-detail', 'cart-count-cart'];

  // -----------------------
  // Utilities
  // -----------------------
  function $id(id) { return document.getElementById(id); }
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  // -----------------------
  // Stars background
  // -----------------------
  function createStarsGlobal() {
    const container = $id(STARS_CONTAINER_ID);
    if (!container) return;
    container.innerHTML = ''; // clear previous

    const width = Math.max(window.innerWidth || 1200, 800);
    const estimated = Math.floor(width * STARS_DENSITY);
    const numStars = Math.min(MAX_STARS, Math.max(20, estimated));

    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 0.5; // px
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.opacity = (Math.random() * 0.6 + 0.2).toString();
      star.style.animationDuration = `${(Math.random() * 3 + 3.5).toFixed(2)}s`;
      star.style.position = 'absolute';
      star.style.backgroundColor = 'rgba(255,255,255,0.8)';
      star.style.borderRadius = '50%';
      container.appendChild(star);
    }
  }

  // -----------------------
  // Navbar toggle (generic)
  // -----------------------
  function initNavbarToggle(toggleId, navbarId) {
    const toggleBtn = $id(toggleId);
    const navbar = $id(navbarId);
    if (!toggleBtn || !navbar) return;

    let visible = false;

    function setVisible(v) {
      visible = !!v;
      navbar.classList.toggle('translate-x-0', visible);
      navbar.classList.toggle('-translate-x-full', !visible);
      toggleBtn.classList.toggle('text-cyan-600', visible);
      toggleBtn.setAttribute('aria-expanded', String(visible));
    }

    function toggle() { setVisible(!visible); }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // Close when clicking outside
    document.addEventListener('click', (ev) => {
      if (!visible) return;
      if (!navbar.contains(ev.target) && ev.target !== toggleBtn && !toggleBtn.contains(ev.target)) {
        setVisible(false);
      }
    });

    // Close with Escape
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && visible) setVisible(false);
    });
  }

  // Initialize all navbars we detect on the page
  function initNavbars() {
    Object.values(NAVBAR_IDS).forEach(cfg => {
      initNavbarToggle(cfg.toggleId, cfg.navbarId);
    });
  }

  // -----------------------
  // Cart count syncing
  // -----------------------
  function getCartLength() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return Array.isArray(cart) ? cart.length : 0;
    } catch (e) {
      return 0;
    }
  }

  function updateCartCountUI() {
    const count = getCartLength();
    CART_COUNT_IDS.forEach(id => {
      const el = $id(id);
      if (el) el.textContent = String(count);
    });
  }

  // expose function for manual updates (pages can call headerShared.updateCartCount())
  window.headerShared = window.headerShared || {};
  window.headerShared.updateCartCount = updateCartCountUI;

  // -----------------------
  // Header padding fix for pages with main content
  // -----------------------
  function fixMainContentPadding() {
    const header = $id('main-header');
    const contentCandidates = [
      $id('page-main-content'), // index.html
      $id('page-main') // fallback if you use different id names
    ];
    const content = contentCandidates.find(Boolean);
    if (!header || !content) return;
    const setPadding = () => {
      const headerHeight = header.offsetHeight || 0;
      content.style.paddingTop = `${headerHeight}px`;
    };
    setPadding();
    window.addEventListener('resize', setPadding);
  }

  // -----------------------
  // Public init
  // -----------------------
  function initHeaderShared() {
    // Stars
    try { createStarsGlobal(); } catch (e) { console.warn('stars init failed', e); }
    window.addEventListener('resize', () => { try { createStarsGlobal(); } catch (e) {} });

    // Navbars
    try { initNavbars(); } catch (e) { console.warn('navbars init failed', e); }

    // Cart counts
    try { updateCartCountUI(); } catch (e) { console.warn('cart count update failed', e); }
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') updateCartCountUI();
    });

    // Header padding
    try { fixMainContentPadding(); } catch (e) { /* ignore */ }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderShared);
  } else {
    initHeaderShared();
  }

  // small convenience: when other scripts add to cart they can call:
  // window.headerShared.addToCart({ id:'polished', name:'Polished Vitrified', image:'images/tiles1.jpg' });
  // But avoid coupling here — keep cart modification in cart-specific scripts.
})();
