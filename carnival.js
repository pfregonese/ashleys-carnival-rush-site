/* ================================================================
   TICKET BOOTH (JS) — marquee bulbs, printing ticket, tear-in rules,
   flip-in menu, ticket-counter stats, confetti. Vanilla, no deps.
   ================================================================ */
(function(){
  'use strict';
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ── 1. Marquee: bulbs every ~26px around the headline frame;
        three-phase chase via steps(), paused off-screen ── */
  (function(){
    var mq = document.querySelector('.marquee');
    if (!mq) return;
    var host = mq.querySelector('.marquee-bulbs');
    function build(){
      host.textContent = '';
      var w = mq.offsetWidth, h = mq.offsetHeight, inset = 10, gap = 26;
      var W = w - inset * 2, H = h - inset * 2;
      var per = 2 * (W + H), n = Math.max(12, Math.round(per / gap));
      for (var i = 0; i < n; i++){
        var d = (i / n) * per, x, y;
        if (d < W) { x = d; y = 0; }
        else if (d < W + H) { x = W; y = d - W; }
        else if (d < 2 * W + H) { x = W - (d - W - H); y = H; }
        else { x = 0; y = H - (d - 2 * W - H); }
        var b = document.createElement('span');
        b.className = 'mq-bulb p' + (i % 3);
        b.style.left = (inset + x) + 'px';
        b.style.top = (inset + y) + 'px';
        host.appendChild(b);
      }
    }
    build();
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(mq);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    if (hasIO) new IntersectionObserver(function(en){
      mq.classList.toggle('mq-paused', !en[0].isIntersecting);
    }).observe(mq);
  })();

  /* ── 2. The phone prints a ticket; tap the phone to reprint ── */
  (function(){
    var t = document.querySelector('.print-ticket');
    var phone = document.querySelector('.phone');
    if (!t) return;
    if (rm) return;                           // CSS shows it fully printed
    function print(){ t.classList.remove('printing'); void t.offsetWidth; t.classList.add('printing'); }
    print();
    if (phone) phone.addEventListener('click', print);
  })();

  /* ── 3–5. Scroll reveals that hand control back to hover once
        they finish (the class is dropped on animationend) ── */
  function revealGroup(sel, cls, step){
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!els.length || rm || !hasIO) return;
    els.forEach(function(el, i){
      el.classList.add('pending');
      el.style.setProperty('--d', ((i % 4) * step) + 'ms');
    });
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        el.classList.remove('pending');
        el.classList.add(cls);
        el.addEventListener('animationend', function done(ev){
          if (ev.target !== el) return;
          el.classList.remove(cls);
          el.removeEventListener('animationend', done);
        });
      });
    }, { threshold: .2 });
    els.forEach(function(el){ io.observe(el); });
  }
  if (!rm && hasIO) document.documentElement.classList.add('js-reveal');
  revealGroup('.section-head, .closing h2', 'popped', 0);
  revealGroup('.rule-ticket', 'torn', 110);
  revealGroup('.menu-item', 'flipped', 90);

  /* ── 6. Stats roll like a ticket counter ── */
  (function(){
    var nums = document.querySelectorAll('.stat .num');
    if (!nums.length) return;
    var cols = [], k = 0;
    nums.forEach(function(el){
      var v = el.textContent.trim();
      el.setAttribute('aria-label', v);
      el.textContent = '';
      for (var i = 0; i < v.length; i++){
        var ch = v[i];
        if (!/\d/.test(ch)) {
          var s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true');
          el.appendChild(s); continue;
        }
        var r = document.createElement('span'); r.className = 'roll'; r.setAttribute('aria-hidden', 'true');
        var strip = document.createElement('i');
        strip.style.setProperty('--d', (k++ * 110) + 'ms');
        var steps = 20 + (+ch), html = '';
        for (var j = 0; j <= steps; j++) html += '<b>' + (j % 10) + '</b>';
        strip.innerHTML = html; r.appendChild(strip); el.appendChild(r);
        cols.push({ el: strip, steps: steps });
      }
    });
    function land(){ cols.forEach(function(c){ c.el.style.transform = 'translateY(-' + (c.steps * 1.2) + 'em)'; }); }
    if (rm || !hasIO) { cols.forEach(function(c){ c.el.style.transition = 'none'; }); land(); return; }
    var io = new IntersectionObserver(function(en){
      if (!en.some(function(e){ return e.isIntersecting; })) return;
      land(); io.disconnect();
    }, { threshold: .5 });
    nums.forEach(function(n){ io.observe(n); });
  })();

  /* ── 7. Confetti from the App Store badge (the link still opens) ── */
  (function(){
    if (rm) return;
    var COLORS = ['#FCD959', '#DE3D4D', '#70D670', '#FFF7EC', '#FC9E3D', '#E296C4'];
    document.querySelectorAll('.badge').forEach(function(b){
      b.addEventListener('click', function(){
        var r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        for (var i = 0; i < 34; i++){
          var c = document.createElement('span');
          c.className = 'confetti';
          var a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 170;
          c.style.setProperty('--x', cx + 'px');
          c.style.setProperty('--y', cy + 'px');
          c.style.setProperty('--dx', (Math.cos(a) * sp) + 'px');
          c.style.setProperty('--dy', (Math.sin(a) * sp - 60 + Math.random() * 160) + 'px');
          c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
          c.style.setProperty('--c', COLORS[i % COLORS.length]);
          document.body.appendChild(c);
          setTimeout(function(n){ return function(){ n.remove(); }; }(c), 1200);
        }
      });
    });
  })();
})();
