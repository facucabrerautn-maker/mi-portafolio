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
        for (var tries = 0; tries < 60 && textShade(s.x, s.y) > 0; tries++) {
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
     MOTOR 2: DAY SKY — Nubes procedurales (modo claro)
     ========================================================================== */
  var DaySkyEngine = (function () {
    // Configuración de capas de nubes
    var LAYERS = [
      { count: 12,  speed: 0.006,  scale: 0.00035,  baseAlpha: 0.18,  heightRange: [0.05, 0.35],  thickness: [0.08, 0.18] },  // lejanas
      { count: 18,  speed: 0.014,  scale: 0.00055,  baseAlpha: 0.28,  heightRange: [0.15, 0.55],  thickness: [0.06, 0.14] },  // medias
      { count: 24,  speed: 0.028,  scale: 0.00085,  baseAlpha: 0.38,  heightRange: [0.30, 0.75],  thickness: [0.04, 0.10] }   // cercanas
    ];

    var clouds = [];      // cada nube: { layer, x, y, w, h, seed, phase, alpha }
    var noiseCache = {};  // cache simple de ruido 1D
    var lastScrollY = 0;
    var scrollOffset = 0; // parallax accumulator

    // Ruido pseudo-aleatorio determinístico (hash simple)
    function hash1(x) {
      x = (x ^ 61) ^ (x >>> 16);
      x = x * 0x7feb352d;
      x = (x ^ x >>> 15) * 0x846ca68b;
      x = x ^ x >>> 16;
      return (x >>> 0) / 4294967296;
    }

    // Ruido 1D suave (value noise)
    function noise1D(x) {
      var i = Math.floor(x), f = x - i;
      var a = hash1(i), b = hash1(i + 1);
      var u = f * f * (3 - 2 * f); // smoothstep
      return a + (b - a) * u;
    }

    // Ruido 2D para forma de nube (fBm simplificado)
    function cloudNoise(x, y, seed, scale) {
      var nx = (x + seed * 1000) * scale;
      var ny = (y + seed * 2000) * scale;
      var sum = 0, amp = 1, freq = 1, max = 0;
      for (var o = 0; o < 4; o++) {
        var n = noise1D(nx * freq + noise1D(ny * freq + seed * 3000));
        sum += n * amp;
        max += amp;
        amp *= 0.55;
        freq *= 2.1;
      }
      return sum / max;
    }

    function createCloud(layer, layerIdx) {
      var lw = layer.widthRange || [0.15, 0.35];
      var lh = layer.thickness;
      return {
        layer: layerIdx,
        x: rand(-0.3, 1.3),           // empieza fuera de pantalla
        y: rand(layer.heightRange[0], layer.heightRange[1]),
        w: rand(lw[0], lw[1]),
        h: rand(lh[0], lh[1]),
        seed: rand(0, 10000),
        phase: rand(0, Math.PI * 2),
        alpha: layer.baseAlpha * rand(0.7, 1.1),
        speedMul: rand(0.85, 1.15)
      };
    }

    function populate() {
      clouds = [];
      for (var li = 0; li < LAYERS.length; li++) {
        var layer = LAYERS[li];
        for (var i = 0; i < layer.count; i++) {
          clouds.push(createCloud(layer, li));
        }
      }
      // Ordenar por capa (lejanas primero) y luego por y (altas primero = más atrás)
      clouds.sort(function (a, b) {
        if (a.layer !== b.layer) return a.layer - b.layer;
        return a.y - b.y;
      });
    }

    function measureZone() {
      var content = document.querySelector('.home__content');
      if (!content) return null;
      var hr = host.getBoundingClientRect(), cr = content.getBoundingClientRect();
      return { x0: cr.left - hr.left, y0: cr.top - hr.top, x1: cr.right - hr.left, y1: cr.bottom - hr.top };
    }

    var textZone = null;
    var PAD = 90;

    function textShade(nx, ny) {
      if (!textZone) return 0;
      var px = nx * w, py = ny * h;
      var dx = Math.max(textZone.x0 - px, 0, px - textZone.x1);
      var dy = Math.max(textZone.y0 - py, 0, py - textZone.y1);
      return clamp(1 - Math.sqrt(dx * dx + dy * dy) / PAD, 0, 1);
    }

    function drawCloud(cloud, now) {
      var cx = cloud.x * w;
      var cy = cloud.y * h;
      var cw = cloud.w * w;
      var ch = cloud.h * h;

      // Fade near text
      var shade = textShade(cloud.x, cloud.y);
      var alpha = cloud.alpha * (1 - 0.7 * shade);
      if (alpha < 0.02) return;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';

      // Dibujar nube como múltiples elipses superpuestas (billboarding)
      var segments = 5 + Math.floor(cloud.w * 8);
      for (var s = 0; s < segments; s++) {
        var tx = (s / (segments - 1) - 0.5) * cw;
        // Forma superior usando ruido
        var n = cloudNoise(tx * 0.02, 0, cloud.seed, LAYERS[cloud.layer].scale);
        var h = ch * (0.6 + 0.4 * n);
        var wSeg = cw / segments * 1.3;

        var grad = ctx.createRadialGradient(cx + tx, cy, 0, cx + tx, cy, wSeg * 0.6);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.ellipse(cx + tx, cy, wSeg * 0.6, h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    return {
      init: function () {
        textZone = measureZone();
        populate();
      },
      resize: function () {
        textZone = measureZone();
        populate();
      },
      draw: function (now) {
        ctx.clearRect(0, 0, w, h);

        // Parallax basado en scroll (suave)
        var targetScroll = window.scrollY || window.pageYOffset || 0;
        scrollOffset += (targetScroll - lastScrollY - scrollOffset) * 0.08;
        lastScrollY = targetScroll;

        var t = now * 0.001;

        for (var i = 0; i < clouds.length; i++) {
          var c = clouds[i];
          var layer = LAYERS[c.layer];

          // Deriva horizontal + parallax
          var drift = (t * layer.speed * c.speedMul) % 1.6;
          var parallax = scrollOffset * (0.05 + layer.speed * 2) * 0.001;
          var nx = (c.x + drift + parallax) % 1.6;
          if (nx > 1.3) nx -= 1.6;
          if (nx < -0.3) nx += 1.6;

          // Morphing vertical lento
          var morph = Math.sin(t * 0.07 * c.speedMul + c.phase) * 0.015;
          var ny = clamp(c.y + morph, layer.heightRange[0], layer.heightRange[1]);

          // Guardar posición original para dibujar
          var ox = c.x, oy = c.y;
          c.x = nx; c.y = ny;
          drawCloud(c, now);
          c.x = ox; c.y = oy; // restaurar para próximo frame
        }
      },
      start: function () { lastScrollY = window.scrollY || 0; scrollOffset = 0; },
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