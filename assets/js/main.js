/* =============================================================
   dhero.studio rebuild — interactions
   Mirrors the behaviours observed on the live site:
   particle hero, flicker grid, snap sliders, sticky stack cards,
   counters, segmented control, marquees (x and y).
   ============================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Header hide-on-scroll ---------------------------------- */
  (function () {
    var el = $('.header');
    if (!el) return;
    var last = window.scrollY, ticking = false;
    function update() {
      var y = window.scrollY;
      if (!document.body.classList.contains('nav-open')) {
        el.classList.toggle('is-hidden', y > last && y > 240);
      }
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  })();

  /* ---------- 2. Off-canvas nav ----------------------------------------- */
  (function () {
    var btn = $('[data-nav-toggle]'), panel = $('.offcanvas');
    if (!btn || !panel) return;
    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      document.body.classList.toggle('is-locked', open);
      btn.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      if (open) $('.header').classList.remove('is-hidden');
    }
    btn.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });
    $$('.offcanvas__link').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setOpen(false);
    });
    setOpen(false);
  })();

  /* ---------- 3. Hero particle field ------------------------------------ */
  (function () {
    var canvas = $('.hero__canvas');
    if (!canvas || reduced) return;
    var ctx = canvas.getContext('2d');
    var dots = [], w = 0, h = 0, raf = null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function seed() {
      var count = Math.min(190, Math.round((w * h) / 9000));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.25 + 0.25, a: Math.random() * 0.5 + 0.12,
          vy: -(Math.random() * 0.14 + 0.03), vx: (Math.random() - 0.5) * 0.06,
          tw: Math.random() * Math.PI * 2
        });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y += d.vy; d.x += d.vx; d.tw += 0.015;
        if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
        if (d.x < -4) d.x = w + 4;
        if (d.x > w + 4) d.x = -4;
        var alpha = d.a * (0.65 + 0.35 * Math.sin(d.tw));
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    size(); frame();
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(size, 150); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !raf) frame();
          else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 }).observe(canvas);
    }
  })();

  /* ---------- 4. Flicker grid (statement band) -------------------------- */
  (function () {
    $$('.statement__grid').forEach(function (host) {
      if (reduced) return;
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;width:100%;height:100%';
      host.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cell = 32, gap = 2, cols = 0, rows = 0, cells = [], raf = null, w = 0, h = 0;

      function size() {
        var r = host.getBoundingClientRect();
        w = r.width; h = r.height;
        if (!w || !h) return;
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
        cells = [];
        for (var i = 0; i < cols * rows; i++) {
          cells.push({ a: Math.random() * 0.14, v: (Math.random() - 0.5) * 0.004 });
        }
      }
      function frame() {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < cells.length; i++) {
          var c = cells[i];
          c.a += c.v;
          if (c.a <= 0.01) { c.a = 0.01; c.v = Math.abs(c.v); }
          if (c.a >= 0.16) { c.a = 0.16; c.v = -Math.abs(c.v); }
          if (Math.random() < 0.0012) c.v = (Math.random() - 0.5) * 0.006;
          var x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
          ctx.fillStyle = 'rgba(255,255,255,' + c.a.toFixed(3) + ')';
          ctx.fillRect(x, y, cell - gap, cell - gap);
        }
        raf = requestAnimationFrame(frame);
      }
      size(); if (cells.length) frame();
      var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(size, 150); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting && !raf) frame();
            else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
          });
        }, { threshold: 0 }).observe(host);
      }
    });
  })();

  /* ---------- 5. Reveal on scroll --------------------------------------- */
  (function () {
    var items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var d = parseInt(e.target.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { e.target.classList.add('is-visible'); }, d);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 6. Counters ----------------------------------------------- */
  (function () {
    var nums = $$('[data-count]');
    if (!nums.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced) { el.textContent = target + suffix; return; }
      var dur = 1800, start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 7. Snap sliders (prev/next) ------------------------------- */
  (function () {
    $$('[data-slider]').forEach(function (wrap) {
      var rail = $('.snap-slider', wrap);
      var prev = $('[data-slide-prev]', wrap);
      var next = $('[data-slide-next]', wrap);
      if (!rail) return;
      function step(dir) {
        var slide = rail.firstElementChild;
        if (!slide) return;
        var w = slide.getBoundingClientRect().width + 24;
        rail.scrollBy({ left: dir * w, behavior: reduced ? 'auto' : 'smooth' });
      }
      if (prev) prev.addEventListener('click', function () { step(-1); });
      if (next) next.addEventListener('click', function () { step(1); });

      function sync() {
        var max = rail.scrollWidth - rail.clientWidth - 2;
        if (prev) prev.disabled = rail.scrollLeft <= 2;
        if (next) next.disabled = rail.scrollLeft >= max;
        if (prev) prev.style.opacity = prev.disabled ? '.4' : '1';
        if (next) next.style.opacity = next.disabled ? '.4' : '1';
      }
      rail.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    });
  })();

  /* ---------- 8. Segmented control (contact) ---------------------------- */
  (function () {
    var group = $('[data-seg]');
    if (!group) return;
    var opts = $$('[role="tab"]', group);
    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        opts.forEach(function (b) {
          var on = b === btn;
          b.setAttribute('aria-selected', String(on));
          var p = document.getElementById(b.getAttribute('aria-controls'));
          if (p) p.hidden = !on;
        });
      });
    });
  })();

  /* ---------- 9. FAQ accordion ------------------------------------------ */
  (function () {
    $$('[data-accordion]').forEach(function (group) {
      var items = $$('[data-acc-item]', group);
      items.forEach(function (item) {
        var head = $('[data-acc-head]', item);
        if (!head) return;
        head.addEventListener('click', function () {
          var open = item.classList.contains('is-open');
          items.forEach(function (o) {
            o.classList.remove('is-open');
            var h = $('[data-acc-head]', o);
            if (h) h.setAttribute('aria-expanded', 'false');
          });
          item.classList.toggle('is-open', !open);
          head.setAttribute('aria-expanded', String(!open));
        });
      });
    });
  })();

  /* ---------- 10. Marquees: clone the group for a seamless loop --------- */
  (function () {
    $$('.marquee').forEach(function (m) {
      var track = $('.marquee__track', m), group = $('.marquee__group', track);
      if (track && group && track.children.length < 2) {
        var c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
      }
    });
    $$('.marquee-y').forEach(function (m) {
      var track = $('.marquee-y__track', m), group = $('.marquee-y__group', track);
      if (track && group && track.children.length < 2) {
        var c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
      }
    });
  })();

  /* ---------- 10b. Work filters (service + industry) -------------------- */
  (function () {
    var list = $('[data-filter-list]');
    if (!list) return;
    var groups = $$('[data-filter-group]');
    var empty = $('[data-filter-empty]');
    var state = {};
    groups.forEach(function (g) { state[g.getAttribute('data-filter-group')] = 'all'; });

    function apply() {
      var shown = 0;
      $$('[data-service]', list).forEach(function (card) {
        var ok = Object.keys(state).every(function (key) {
          return state[key] === 'all' || card.getAttribute('data-' + key) === state[key];
        });
        card.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    }

    groups.forEach(function (g) {
      var key = g.getAttribute('data-filter-group');
      $$('.filter', g).forEach(function (btn) {
        btn.addEventListener('click', function () {
          state[key] = btn.getAttribute('data-filter');
          $$('.filter', g).forEach(function (b) {
            b.setAttribute('aria-pressed', String(b === btn));
          });
          apply();
        });
      });
    });

    var reset = $('[data-filter-reset]');
    if (reset) {
      reset.addEventListener('click', function (e) {
        e.preventDefault();
        groups.forEach(function (g) {
          var key = g.getAttribute('data-filter-group');
          state[key] = 'all';
          $$('.filter', g).forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === 'all'));
          });
        });
        apply();
      });
    }

    apply();
  })();

  /* ---------- 11. Demo form -------------------------------------------- */
  (function () {
    $$('form[data-demo-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var note = $('[data-form-note]', form);
        if (note) {
          note.textContent = 'Demo form — connect this to your inbox or CRM before launch.';
          note.style.color = 'var(--lime)';
        }
      });
    });
  })();

  /* ---------- 12. Mark current page in nav ------------------------------ */
  (function () {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    $$('.offcanvas__link').forEach(function (a) {
      if (a.getAttribute('href') === path) a.classList.add('is-current');
    });
  })();
})();
