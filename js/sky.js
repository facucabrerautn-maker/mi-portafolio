/* ==========================================================================
   SKY SYSTEM — Cielo unificado para modo oscuro (estrellas) y claro (nubes).
   - Un único canvas (#sky) en #inicio que cubre portada + proyectos.
   - Se auto-detecta el tema y cambia de motor sin recargar.
   - Comparte ResizeObserver, IntersectionObserver, visibilitychange.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  var host = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  if (!ctx || !host) return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Estado compartido ---------- */
  var w = 0, h = 0, dpr = 1;
  var running = false, inView = true, raf = 0;
  var currentMode = null;           // 'dark' | 'light'
  var modeEngine = null;            // { init, resize, draw, start, stop, destroy }

  /* ---------- Utilidades ---------- */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- Detección de tema ---------- */
  function detectMode() {
    return document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
  }

  /* ==========================================================================
     MOTOR 1: STARFIELD (modo oscuro)
     ========================================================================== */
  var StarfieldEngine = (function () {
    var DENSITY = 1 / 5200;
    var MAX_DPR = 2;
    var stars = [];
    var shooting = null;
    var nextShooting = 0;
    var lastCount = 0;

    var TINTS_DARK = [
      [214, 232, 255], [214, 232, 255], [214, 232, 255], [255, 236, 190]
    ];

    var PAD = 70;
    var HEADER_BAND = 110;   // las estrellas grandes no se dibujan bajo la cabecera
    var zone = null;

    function makeStar(kind) {
      var tint = TINTS_DARK[Math.floor(Math.random() * TINTS_DARK.length)];
      var s = {
        x: Math.random(), y: Math.random(),
        kind: kind, tint: tint,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.5, 1.6)
      };
      if (kind === 0) { s.r = rand(0.35, 0.95); s.a = rand(0.25, 0.8); }
      if (kind === 1) { s.r = rand(1.0, 1.7);  s.a = rand(0.55, 0.95); }
      if (kind === 2) {
        s.r = rand(4.5, 8.5); s.a = rand(0.8, 1); s.rot = rand(-0.2, 0.2);
        s.tint = Math.random() < 0.7 ? [255, 236, 190] : [255, 255, 255];
      }
      return s;
    }

    function populate() {
      var total = clamp(Math.round(w * h * DENSITY), 60, 420);
      if (stars.length && Math.abs(total - lastCount) / lastCount < 0.35) return;
      lastCount = total;
      stars = [];
      var big = clamp(Math.round(total / 26), 4, 14);
      var mid = Math.round(total * 0.16);
      for (var i = 0; i < total; i++) {
        stars.push(makeStar(i < big ? 2 : (i < big + mid ? 1 : 0)));
      }
    }

    function measureZone() {
      var content = document.querySelector('.home__content');
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

    function scheduleShooting(now) { nextShooting = now + rand(7000, 15000); }

    function launchShooting(now) {
      var fromLeft = Math.random() < 0.5;
      var ang = rand(0.42, 0.62);
      shooting = {
        x: fromLeft ? rand(0.05, 0.4) * w : rand(0.6, 0.95) * w,
        y: rand(0.05, 0.95) * h,
        dir: fromLeft ? 1 : -1, ang: ang,
        len: rand(110, 190), speed: rand(0.75, 1.05),
        born: now, life: rand(700, 1000)
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
      var fade = Math.sin(k * Math.PI);
      var g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(255,244,214,' + (0.85 * fade).toFixed(3) + ')');
      ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = 'rgba(255,248,230,' + (0.9 * fade).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(hx, hy, 1.7, 0, 6.2832); ctx.fill();
    }

    return {
      init: function () {
        measureZone();
        populate();
        keepBigStarsClear();
      },
      resize: function () {
        measureZone();
        populate();
        keepBigStarsClear();
      },
      draw: function (now) {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < stars.length; i++) drawStar(stars[i], now);
        if (!reduceMotion) {
          if (!nextShooting) scheduleShooting(now);
          if (!shooting && now >= nextShooting) launchShooting(now);
          drawShooting(now);
        }
      },
      start: function () {},
      stop: function () { shooting = null; nextShooting = 0; },
      destroy: function () { stars = []; shooting = null; }
    };
  })();

  /* ==========================================================================
     MOTOR 2: DAY SKY — Nubes con sprites pre-renderizados (modo claro)
     El degradé azul del cielo lo pone el CSS; acá solo se dibujan las nubes.
     ========================================================================== */
  var DaySkyEngine = (function () {
    var SPRITE_COUNT = 6;
    var LAYERS = [
      // far: chicas, lentas y translúcidas · near: grandes y más rápidas
      { count: 6, speed: 5,  scale: [0.4, 0.65], alpha: [0.5, 0.7],  y: [0.02, 0.5] },
      { count: 5, speed: 11, scale: [0.65, 0.95], alpha: [0.7, 0.85], y: [0.08, 0.7] },
      { count: 3, speed: 20, scale: [0.95, 1.3], alpha: [0.8, 0.95],  y: [0.2, 0.9] }
    ];
    var SW = 460, SH = 200;          // tamaño de cada sprite (px)
    var sprites = [];
    var clouds = [];
    var textZone = null;
    var PAD = 60;

    // Una nube = varias bolitas con la base plana, luz arriba y sombra azulada abajo
    function makeSprite() {
      var c = document.createElement('canvas');
      c.width = SW; c.height = SH;
      var g = c.getContext('2d');
      var base = SH * 0.78;
      var puffs = 6 + Math.floor(Math.random() * 4);
      g.fillStyle = '#fff';
      for (var i = 0; i < puffs; i++) {
        var t = (i + 0.5) / puffs;
        var px = SW * (0.12 + 0.76 * t) + rand(-12, 12);
        var hump = Math.sin(t * Math.PI);                 // más alta en el centro
        var r = SH * (0.16 + 0.2 * hump) * rand(0.8, 1.15);
        g.beginPath(); g.arc(px, base - r * 0.75, r, 0, 6.2832); g.fill();
      }
      g.fillRect(SW * 0.14, base - SH * 0.12, SW * 0.72, SH * 0.12);  // panza llena
      g.globalCompositeOperation = 'source-atop';
      var sh = g.createLinearGradient(0, SH * 0.25, 0, base);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(1, 'rgba(120,156,206,0.42)');
      g.fillStyle = sh; g.fillRect(0, 0, SW, SH);
      return c;
    }

    function populate() {
      if (!sprites.length) for (var i = 0; i < SPRITE_COUNT; i++) sprites.push(makeSprite());
      clouds = [];
      var tune = clamp(w / 1280, 0.6, 1.2);
      for (var li = 0; li < LAYERS.length; li++) {
        var L = LAYERS[li];
        for (var k = 0; k < L.count; k++) {
          clouds.push({
            sprite: sprites[Math.floor(Math.random() * sprites.length)],
            x: Math.random(),                      // posición inicial (fracción del recorrido)
            y: rand(L.y[0], L.y[1]),
            s: rand(L.scale[0], L.scale[1]) * tune,
            a: rand(L.alpha[0], L.alpha[1]),
            v: L.speed * rand(0.8, 1.2),
            flip: Math.random() < 0.5
          });
        }
      }
      clouds.sort(function (a, b) { return a.s - b.s; });  // lejanas primero
    }

    function measureZone() {
      var content = document.querySelector('.home__content');
      if (!content) return null;
      var hr = host.getBoundingClientRect(), cr = content.getBoundingClientRect();
      return { x0: cr.left - hr.left, y0: cr.top - hr.top, x1: cr.right - hr.left, y1: cr.bottom - hr.top };
    }

    // Las nubes se apagan un poco detrás del mensaje de la portada
    function textFade(px, py) {
      if (!textZone) return 1;
      var dx = Math.max(textZone.x0 - px, 0, px - textZone.x1);
      var dy = Math.max(textZone.y0 - py, 0, py - textZone.y1);
      return 1 - 0.65 * clamp(1 - Math.sqrt(dx * dx + dy * dy) / PAD, 0, 1);
    }

    return {
      init: function () { textZone = measureZone(); populate(); },
      resize: function () { textZone = measureZone(); populate(); },
      draw: function (now) {
        ctx.clearRect(0, 0, w, h);
        var t = reduceMotion ? 0 : now * 0.001;
        for (var i = 0; i < clouds.length; i++) {
          var c = clouds[i];
          var cw = SW * c.s, ch = SH * c.s;
          var span = w + cw;
          var x = ((c.x * span + t * c.v) % span) - cw;
          var y = c.y * h - ch / 2;
          ctx.globalAlpha = c.a * textFade(x + cw / 2, y + ch / 2);
          if (c.flip) {
            ctx.save(); ctx.translate(x + cw, y); ctx.scale(-1, 1);
            ctx.drawImage(c.sprite, 0, 0, cw, ch);
            ctx.restore();
          } else {
            ctx.drawImage(c.sprite, x, y, cw, ch);
          }
        }
        ctx.globalAlpha = 1;
      },
      start: function () {},
      stop: function () {},
      destroy: function () { clouds = []; }
    };
  })();

  /* ==========================================================================
     Ciclo de vida principal
     ========================================================================== */
  function resize() {
    var rect = host.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (modeEngine && modeEngine.resize) modeEngine.resize();
    if (!running && modeEngine) modeEngine.draw(performance.now());
  }

  function switchMode(newMode) {
    if (newMode === currentMode) return;

    // Detener motor anterior
    if (modeEngine && modeEngine.stop) modeEngine.stop();
    if (modeEngine && modeEngine.destroy) modeEngine.destroy();

    currentMode = newMode;
    modeEngine = newMode === 'light' ? DaySkyEngine : StarfieldEngine;

    // Inicializar nuevo motor
    if (modeEngine.init) modeEngine.init();
    if (modeEngine.start) modeEngine.start();

    if (running && modeEngine.draw) {
      modeEngine.draw(performance.now());
    }
  }

  function frame(now) {
    if (!running || !modeEngine) return;
    modeEngine.draw(now);
    raf = requestAnimationFrame(frame);
  }

  function setRunning(on) {
    if (reduceMotion) return;
    if (on && !running) { running = true; raf = requestAnimationFrame(frame); }
    if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }

  function sync() { setRunning(inView && !document.hidden); }

  /* ---------- Init ---------- */
  // Modo inicial
  switchMode(detectMode());

  // Observer de tema
  var themeObserver = new MutationObserver(function () {
    switchMode(detectMode());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Resize
  resize();
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { resize(); });
    ro.observe(host);
    var content = host.querySelector('.home__content');
    if (content) ro.observe(content);
  } else {
    window.addEventListener('resize', resize);
  }

  // Visibility / Intersection
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(host);
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();