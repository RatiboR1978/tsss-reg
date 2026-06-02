/* ============================================================
   Modal: open / close / focus trap / a11y
   ============================================================ */
(function () {
  'use strict';

  var overlay    = document.getElementById('modal-overlay');
  var openBtns   = document.querySelectorAll('.js-open-modal');
  var closeBtn   = document.querySelector('.js-close-modal');
  var lastFocus  = null;

  // Time slot selection
  var selectedTime = '19';

  function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('.js-time-btn').forEach(function (btn) {
      btn.classList.toggle('date-chip--active', btn.dataset.time === time);
    });
    ['19', '12'].forEach(function (t) {
      var area = document.getElementById('widget-area-' + t);
      if (area) area.hidden = (t !== time);
    });
  }

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
    selectTime(selectedTime);
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

  // Time chips on main page: set time then open modal
  document.querySelectorAll('.hero__dates .js-time-btn, .final-cta__dates .js-time-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectedTime = btn.dataset.time;
      openModal(btn);
    });
  });

  // Time chips inside modal: switch widget, stay in modal
  overlay.addEventListener('click', function (e) {
    var btn = e.target.closest('.js-time-btn');
    if (btn) {
      e.stopPropagation();
      selectTime(btn.dataset.time);
    }
  }, true);

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
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('.anim-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ============================================================
     Count-up animation for stat numbers
     ============================================================ */
  var countEls = document.querySelectorAll('.stat-plate__num[data-count]');

  if (countEls.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);

        var el      = entry.target;
        var target  = parseInt(el.getAttribute('data-count'), 10);
        var suffix  = el.getAttribute('data-suffix') || '';
        var duration = 1600;
        var start    = null;

        function formatNum(n) {
          return n >= 1000
            ? Math.floor(n / 1000) + ' ' + String(n % 1000 === 0 ? '000' : String(n % 1000).padStart(3, '0'))
            : String(n);
        }

        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(ease * target);
          el.textContent = formatNum(current) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    countEls.forEach(function (el) { countObserver.observe(el); });
  }

  /* ============================================================
     Wave canvas animation for final-cta
     ============================================================ */
  var waveCanvas = document.querySelector('.wave-canvas');
  if (waveCanvas) {
    var wCtx = waveCanvas.getContext('2d');
    var wT = 0;

    function resizeWave() {
      waveCanvas.width  = waveCanvas.offsetWidth;
      waveCanvas.height = waveCanvas.offsetHeight;
    }

    function drawWave() {
      var w = waveCanvas.width;
      var h = waveCanvas.height;
      wT += 0.016;

      wCtx.clearRect(0, 0, w, h);
      wCtx.fillStyle = 'rgba(255,178,0,0.18)';

      var bars   = 120;
      var barW   = 2;
      var step   = w / bars;
      var cy     = h / 2;
      var maxAmp = h * 0.38;

      for (var i = 0; i < bars; i++) {
        var x = i * step + (step - barW) / 2;
        var nx = i / bars;

        // compound wave — несколько синусоид с разными частотами
        var amp =
          0.45 * Math.sin(nx * Math.PI * 6  + wT * 1.1) +
          0.30 * Math.sin(nx * Math.PI * 14 + wT * 0.7) +
          0.15 * Math.sin(nx * Math.PI * 26 + wT * 1.5) +
          0.10 * Math.sin(nx * Math.PI * 4  + wT * 0.4);

        // глобальный пульс амплитуды
        var pulse = 0.55 + 0.45 * Math.abs(Math.sin(wT * 0.6));
        var barH  = Math.abs(amp) * maxAmp * pulse;

        // скруглённые бары (rect с небольшим скруглением через arc)
        var r = Math.min(barW / 2, barH / 2, 3);
        wCtx.beginPath();
        wCtx.moveTo(x + r, cy - barH);
        wCtx.lineTo(x + barW - r, cy - barH);
        wCtx.arcTo(x + barW, cy - barH, x + barW, cy - barH + r, r);
        wCtx.lineTo(x + barW, cy + barH - r);
        wCtx.arcTo(x + barW, cy + barH, x + barW - r, cy + barH, r);
        wCtx.lineTo(x + r, cy + barH);
        wCtx.arcTo(x, cy + barH, x, cy + barH - r, r);
        wCtx.lineTo(x, cy - barH + r);
        wCtx.arcTo(x, cy - barH, x + r, cy - barH, r);
        wCtx.closePath();
        wCtx.fill();
      }

      requestAnimationFrame(drawWave);
    }

    resizeWave();
    window.addEventListener('resize', resizeWave);
    drawWave();
  }

})();
