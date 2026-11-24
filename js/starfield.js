/* ==========================================================================
   Cielo estrellado de la portada (canvas 2D, sin librerías).
   - Estrellas de tres tipos: puntitos, puntos con brillo y unas pocas con forma
     de estrella de cinco puntas (como las de la ilustración del personaje).
   - Titilan suavemente; de vez en cuando cruza una estrella fugaz.
   - Cerca del texto central las estrellas se atenúan para no pelear con él.
   - Se pausa cuando la portada no se ve o la pestaña está en segundo plano.
   - Con "reducir movimiento" se dibuja un cuadro fijo, sin animación.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  var host = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var DENSITY = 1 / 5200;            // estrellas por px² de portada
  var MAX_DPR = 2;
  var stars = [];
  var shooting = null;
  var nextShooting = 0;
  var w = 0, h = 0, dpr = 1;
  var running = false, inView = true, raf = 0, lastCount = 0;

  var TINTS = [
    [214, 232, 255],   // blanco azulado (la mayoría)
    [214, 232, 255],
    [214, 232, 255],
    [255, 236, 190]    // blanco cálido, como las estrellas de la ilustración
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function makeStar(kind) {
    var tint = TINTS[Math.floor(Math.random() * TINTS.length)];
    var s = {
      x: Math.random(), y: Math.random(),          // posición normalizada 0..1
      kind: kind,
      tint: tint,
      phase: rand(0, Math.PI * 2),
      speed: rand(0.5, 1.6)
    };
    if (kind === 0) { s.r = rand(0.35, 0.95); s.a = rand(0.25, 0.8); }
    if (kind === 1) { s.r = rand(1.0, 1.7);  s.a = rand(0.55, 0.95); }
    if (kind === 2) { s.r = rand(4.5, 8.5);  s.a = rand(0.8, 1); s.rot = rand(-0.2, 0.2); s.tint = Math.random() < 0.7 ? [255, 236, 190] : [255, 255, 255]; }
    return s;
  }

  function populate() {
    var total = clamp(Math.round(w * h * DENSITY), 60, 420);
    if (stars.length && Math.abs(total - lastCount) / lastCount < 0.35) return;   // conservar la distribución
    lastCount = total;
    stars = [];
    var big = clamp(Math.round(total / 26), 4, 14);
    var mid = Math.round(total * 0.16);
    for (var i = 0; i < total; i++) {
      stars.push(makeStar(i < big ? 2 : (i < big + mid ? 1 : 0)));
    }
  }

  function resize() {
    var rect = host.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measureZone();
    populate();
    keepBigStarsClear();
    if (!running) draw(performance.now());
  }

  /* Zona del texto central: rectángulo real del bloque de texto (en px, relativo a la portada).
     textShade devuelve 1 dentro del bloque y baja a 0 a ~PAD px de distancia. */
  var PAD = 70;
  var HEADER_BAND = 110;           // franja de la cabecera: sin estrellas grandes para no tapar el logo ni el menú
  var zone = null;

  function measureZone() {
    var content = host.querySelector('.home__content');
    if (!content) { zone = null; return; }
    var hr = host.getBoundingClientRect(), cr = content.getBoundingClientRect();
    zone = { x0: cr.left - hr.left, y0: cr.top - hr.top, x1: cr.right - hr.left, y1: cr.bottom - hr.top };
  }

  function textShade(nx, ny) {
    if (!zone) return 0;
    var px = nx * w, py = ny * h;
    var dx = Math.max(zone.x0 - px, 0, px - zone.x1);
    var dy = Math.max(zone.y0 - py, 0, py - zone.y1);
    return clamp(1 - Math.sqrt(dx * dx + dy * dy) / PAD, 0, 1);
  }

  /* Las estrellas grandes con forma de estrella nunca se ubican sobre el texto */
  function keepBigStarsClear() {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (s.kind !== 2) continue;
      for (var tries = 0; tries < 60 && (textShade(s.x, s.y) > 0 || s.y * h < HEADER_BAND); tries++) {
        s.x = Math.random(); s.y = Math.random();
      }
    }
  }

  function starPath(cx, cy, R, rot) {
    var r = R * 0.46;
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + rot + i * Math.PI / 5;
      var rad = i % 2 === 0 ? R : r;
      var px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawStar(s, t) {
    var px = s.x * w, py = s.y * h;
    var shade = textShade(s.x, s.y);
    var dim = 1 - 0.8 * shade;
    var tw = reduceMotion ? 1 : 0.62 + 0.38 * Math.sin(t * 0.001 * s.speed + s.phase);
    var alpha = s.a * tw * dim;
    if (alpha < 0.02) return;
    var c = s.tint, rgb = c[0] + ',' + c[1] + ',' + c[2];

    if (s.kind === 0) {
      ctx.fillStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, 6.2832); ctx.fill();
    } else if (s.kind === 1) {
      var g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 5);
      g.addColorStop(0, 'rgba(' + rgb + ',' + (alpha * 0.55).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, s.r * 5, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, 6.2832); ctx.fill();
    } else {
      var R = s.r * (0.94 + 0.06 * tw);
      var halo = ctx.createRadialGradient(px, py, 0, px, py, R * 3.4);
      halo.addColorStop(0, 'rgba(' + rgb + ',' + (alpha * 0.42).toFixed(3) + ')');
      halo.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(px, py, R * 3.4, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
      starPath(px, py, R, s.rot);
      ctx.lineJoin = 'round'; ctx.lineWidth = R * 0.22;
      ctx.strokeStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
      ctx.fill(); ctx.stroke();
    }
  }

  /* ---------- Estrella fugaz ---------- */
  function scheduleShooting(now) { nextShooting = now + rand(7000, 15000); }

  function launchShooting(now) {
    var fromLeft = Math.random() < 0.5;
    var ang = rand(0.42, 0.62);                       // bajada suave
    shooting = {
      x: fromLeft ? rand(0.05, 0.4) * w : rand(0.6, 0.95) * w,
      y: rand(0.04, 0.3) * h,
      dir: fromLeft ? 1 : -1,
      ang: ang,
      len: rand(110, 190),
      speed: rand(0.75, 1.05),                        // px por ms
      born: now,
      life: rand(700, 1000)
    };
    scheduleShooting(now);
  }

  function drawShooting(now) {
    if (!shooting) return;
    var k = (now - shooting.born) / shooting.life;
    if (k >= 1) { shooting = null; return; }
    var travel = (now - shooting.born) * shooting.speed;
    var hx = shooting.x + shooting.dir * Math.cos(shooting.ang) * travel;
    var hy = shooting.y + Math.sin(shooting.ang) * travel;
    var tx = hx - shooting.dir * Math.cos(shooting.ang) * shooting.len;
    var ty = hy - Math.sin(shooting.ang) * shooting.len;
    var fade = Math.sin(k * Math.PI);                 // aparece y se apaga
    var g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,244,214,' + (0.85 * fade).toFixed(3) + ')');
    ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = 'rgba(255,248,230,' + (0.9 * fade).toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(hx, hy, 1.7, 0, 6.2832); ctx.fill();
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) drawStar(stars[i], now);
    if (!reduceMotion) {
      if (!nextShooting) scheduleShooting(now);
      if (!shooting && now >= nextShooting) launchShooting(now);
      drawShooting(now);
    }
  }

  /* ---------- Ciclo de animación ---------- */
  function frame(now) {
    if (!running) return;
    draw(now);
    raf = requestAnimationFrame(frame);
  }

  function setRunning(on) {
    if (reduceMotion) return;
    if (on && !running) { running = true; raf = requestAnimationFrame(frame); }
    if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }

  function sync() { setRunning(inView && !document.hidden); }

  resize();
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { resize(); });
    ro.observe(host);
    var content = host.querySelector('.home__content');
    if (content) ro.observe(content);
  } else {
    window.addEventListener('resize', resize);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(host);
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();
