/* Shared interaction layer: momentum scroll, cursor ring, magnetic buttons.
   Everything is gated behind prefers-reduced-motion and pointer:fine. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer:fine)').matches;

  /* momentum smooth-scroll (Lenis) */
  if (!reduce && window.Lenis) {
    document.documentElement.style.scrollBehavior = 'auto';
    var lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains('skip')) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -64, duration: 1.2 });
      history.pushState(null, '', id);
    });
  }

  /* trailing cursor ring (system cursor stays — the ring is an accent) */
  if (fine && !reduce) {
    var st = document.createElement('style');
    st.textContent =
      '.cring{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:80;will-change:transform}' +
      '.cring i{position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:32px;height:32px;border:1.5px solid rgba(23,122,107,.38);border-radius:50%;opacity:0;transition:width .3s,height .3s,border-color .3s,opacity .3s,background .3s}' +
      '.cring.on i{opacity:1}' +
      '.cring.hot i{width:52px;height:52px;border-color:rgba(23,122,107,.7);background:rgba(23,122,107,.05)}';
    document.head.appendChild(st);
    var ring = document.createElement('div');
    ring.className = 'cring'; ring.setAttribute('aria-hidden', 'true');
    ring.appendChild(document.createElement('i'));
    document.body.appendChild(ring);
    var tx = -100, ty = -100, cx = -100, cy = -100, seen = false;
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; cx = tx; cy = ty; ring.classList.add('on'); }
      var hot = e.target.closest && e.target.closest('a,button,.btn,.nbtn,.tile,input,textarea');
      ring.classList.toggle('hot', !!hot);
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { ring.classList.remove('on'); seen = false; });
    (function loop() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      ring.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* magnetic buttons */
  if (fine && !reduce) {
    document.querySelectorAll('.btn,.nbtn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (dx * 0.16).toFixed(1) + 'px,' + (dy * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }
})();
