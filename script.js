/* ============================================================
   Modal: open / close / focus trap / a11y
   ============================================================ */
(function () {
  'use strict';

  var overlay    = document.getElementById('modal-overlay');
  var openBtns   = document.querySelectorAll('.js-open-modal');
  var closeBtn   = document.querySelector('.js-close-modal');
  var lastFocus  = null;

  // Focusable elements selector
  var FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function getFocusable() {
    return Array.prototype.slice.call(overlay.querySelectorAll(FOCUSABLE));
  }

  function openModal(triggerEl) {
    lastFocus = triggerEl || document.activeElement;
    overlay.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    // Move focus to first focusable inside modal
    var focusable = getFocusable();
    if (focusable.length) {
      focusable[0].focus();
    } else {
      overlay.focus();
    }
  }

  function closeModal() {
    overlay.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
    // Restore focus to triggering element
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  // Open on any CTA button
  openBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn);
    });
  });

  // Close on ✕ button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close on overlay click (but not on modal itself)
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && !overlay.hasAttribute('hidden')) {
      closeModal();
    }
  });

  // Focus trap: Tab / Shift+Tab cycle within modal
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusable();
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      // Shift+Tab: if focus is on first → wrap to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if focus is on last → wrap to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ============================================================
     Intersection Observer: staggered section reveal
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('.anim-reveal');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      // Pause until in view
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

})();
