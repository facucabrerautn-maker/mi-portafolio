/* Carrete 3D de proyectos (WebGL2, sin librerías).
   - Tarjetas curvas sobre un recorrido elíptico; se mueven arrastrando con el
     clic izquierdo (o con el dedo), con las flechas del teclado, o haciendo
     clic en una tarjeta lateral. La rueda del mouse NO lo mueve: la página
     sigue haciendo scroll normal.
   - Los datos salen de window.PROJECTS (js/projects-data.js).
   - Si WebGL2 no está disponible, se muestra una grilla estática. */
(function () {
  'use strict';

  var PROJECTS = window.PROJECTS || [];
  var section = document.getElementById('proyectos');
  var canvas = document.getElementById('reel');
  var grid = document.getElementById('reel-fallback');
  var hint = document.getElementById('reel-hint');
  var live = document.getElementById('reel-live');
  if (!section || !canvas || !PROJECTS.length) return;

  var N = PROJECTS.length;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Constantes de la escena ---------- */
  var FOV = 65.7 * Math.PI / 180;
  var CAM_Z = 8.1, NEAR = 0.1, FAR = 40;
  var PW = 2.38, PH = 1.5771;          // tamaño de cada tarjeta
  var SEG_X = 48, SEG_Y = 24;
  var HALF_W = PW / 2;
  var BASE_BEND = 0.30, MAX_BEND = 0.42;
  var STEP = 0.73;                     // ángulo entre proyectos consecutivos
  var TRACK_DEPTH = 1.2;
  var PLANE_ASPECT = PW / PH;
  var RADIUS = 0.085;                  // esquinas redondeadas

  /* ---------- Portadas provisionales (se dibujan en un canvas 2D) ---------- */
  // TONES para modo oscuro (fondos claros, textos oscuros)
  var TONES_DARK = [
    ['#ebe7de', '#1b1b1b', '#c9c2b3'],
    ['#dfe4e8', '#16202a', '#b3bfca'],
    ['#e6dfd2', '#2a1f14', '#cdbfa6'],
    ['#dde5dc', '#16241a', '#b2c4b3'],
    ['#e5e0ea', '#221a2c', '#c6bdd3'],
    ['#e4e2dd', '#202020', '#bcb8ae']
  ];
  // TONES para modo claro (fondos oscuros, textos claros)
  var TONES_LIGHT = [
    ['#1a1a2e', '#fafafa', '#2d2d4a'],
    ['#16202a', '#fafafa', '#1f3a4a'],
    ['#2a1f14', '#fafafa', '#4a2d1a'],
    ['#16241a', '#fafafa', '#1f3a2a'],
    ['#221a2c', '#fafafa', '#3a2a4a'],
    ['#202020', '#fafafa', '#3a3a3a']
  ];
  var FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function getTones() {
    return document.documentElement.classList.contains('light-mode') ? TONES_LIGHT : TONES_DARK;
  }

  function placeholderCanvas(index, project) {
    var w = 1280, h = 848;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    var t = getTones()[index % getTones().length];

    g.fillStyle = t[0];
    g.fillRect(0, 0, w, h);

    // Barra de navegación
    g.fillStyle = t[1];
    g.beginPath(); g.arc(80, 70, 16, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.55;
    for (var k = 0; k < 3; k++) g.fillRect(w - 440 + k * 120, 64, 76, 10);
    g.globalAlpha = 1;

    // Número y título
    g.fillStyle = t[1];
    g.textBaseline = 'alphabetic';
    g.font = '800 170px ' + FONT;
    g.fillText(('0' + (index + 1)).slice(-2), 72, 400);
    g.font = '700 58px ' + FONT;
    g.fillText(project.name, 72, 492);
    g.globalAlpha = 0.6;
    g.font = '400 32px ' + FONT;
    g.fillText(project.category || '', 72, 544);
    g.globalAlpha = 1;

    // Bloque de imagen
    g.fillStyle = t[2];
    roundRect(g, 690, 150, 520, 520, 28);
    g.fill();
    g.strokeStyle = t[0];
    g.lineWidth = 3;
    g.globalAlpha = 0.7;
    g.beginPath(); g.moveTo(690, 670); g.lineTo(1210, 150);
    g.moveTo(690, 150); g.lineTo(1210, 670); g.stroke();
    g.globalAlpha = 1;

    // Pie
    g.fillStyle = t[1];
    g.globalAlpha = 0.25;
    g.fillRect(72, h - 96, w - 144, 2);
    g.globalAlpha = 0.5;
    g.fillRect(72, h - 64, 180, 8);
    g.fillRect(w - 252, h - 64, 180, 8);
    g.globalAlpha = 1;
    return c;
  }

  /* ---------- Alternativa sin WebGL: grilla estática ---------- */
  var fallbackShown = false;
  function showFallback() {
    if (fallbackShown) return;
    fallbackShown = true;
    section.classList.add('is-fallback');
    canvas.hidden = true;
    if (hint) hint.hidden = true;
    if (!grid) return;
    grid.hidden = false;
    PROJECTS.forEach(function (p, i) {
      var li = document.createElement('li');
      li.className = 'work__card';
      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.src = p.cover || placeholderCanvas(i, p).toDataURL('image/jpeg', 0.82);
      var name = document.createElement('h3');
      name.textContent = p.name;
      var cat = document.createElement('p');
      cat.textContent = p.category || '';
      var box = p.url ? document.createElement('a') : document.createElement('div');
      if (p.url) { box.href = p.url; box.target = '_blank'; box.rel = 'noopener'; }
      box.appendChild(img); box.appendChild(name); box.appendChild(cat);
      li.appendChild(box);
      grid.appendChild(li);
    });
  }

  /* ---------- Contexto WebGL2 ---------- */
  var gl = null;
  try {
    gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
  } catch (e) { gl = null; }
  if (!gl) { showFallback(); return; }

  var VERT = [
    '#version 300 es',
    'in vec2 aPos; in vec2 aUv;',
    'uniform mat4 uMVP; uniform float uBend; uniform float uTime; uniform float uRipple; uniform float uSeed;',
    'out vec2 vUv; out float vCurve;',
    'void main(){',
    '  float halfW = ' + HALF_W.toFixed(4) + ';',
    '  float ang = (aPos.x / halfW) * uBend;',
    '  float rad = halfW / uBend;',
    '  vec3 p = vec3(sin(ang) * rad, aPos.y, (cos(ang) - 1.0) * rad);',
    '  p.y += sin(aPos.x * 1.6 + uTime * 0.7 + uSeed) * uRipple;',
    '  vCurve = cos(ang); vUv = aUv;',
    '  gl_Position = uMVP * vec4(p, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 vUv; in float vCurve;',
    'uniform sampler2D uTex; uniform vec2 uUvScale; uniform vec2 uUvOff; uniform float uLight; uniform float uAlpha;',
    'out vec4 outColor;',
    'void main(){',
    '  vec2 p = (vUv - 0.5) * vec2(' + PW.toFixed(4) + ', ' + PH.toFixed(4) + ');',
    '  vec2 b = vec2(' + (PW / 2).toFixed(5) + ', ' + (PH / 2).toFixed(5) + ') - vec2(' + RADIUS + ');',
    '  float d = length(max(abs(p) - b, 0.0)) - ' + RADIUS + ';',
    '  float aa = max(fwidth(d), 0.0005);',
    '  float mask = 1.0 - smoothstep(-aa, aa, d);',
    '  vec3 col = texture(uTex, vUv * uUvScale + uUvOff).rgb;',
    '  float shade = 0.90 + 0.10 * clamp((vCurve - 0.91) / 0.09, 0.0, 1.0);',
    '  col *= shade * (1.02 - 0.07 * vUv.y) * uLight;',
    '  float a = mask * uAlpha;',
    '  outColor = vec4(col * a, a);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || 'Error de shader');
    }
    return s;
  }

  var program, vao, vbo, ibo, indexCount, U = {}, aniso = null;
  var cards = [];

  function initGL() {
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'aPos');
    gl.bindAttribLocation(program, 1, 'aUv');
    gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Error al enlazar');
    }
    ['uMVP', 'uBend', 'uTime', 'uRipple', 'uSeed', 'uTex', 'uUvScale', 'uUvOff', 'uLight', 'uAlpha']
      .forEach(function (n) { U[n] = gl.getUniformLocation(program, n); });

    // Malla de 48 x 24 segmentos
    var verts = new Float32Array((SEG_X + 1) * (SEG_Y + 1) * 4);
    var o = 0, ix, iy;
    for (iy = 0; iy <= SEG_Y; iy++) {
      for (ix = 0; ix <= SEG_X; ix++) {
        var u = ix / SEG_X, v = iy / SEG_Y;
        verts[o++] = (u - 0.5) * PW;
        verts[o++] = (v - 0.5) * PH;
        verts[o++] = u;
        verts[o++] = v;
      }
    }
    var idx = new Uint16Array(SEG_X * SEG_Y * 6);
    o = 0;
    for (iy = 0; iy < SEG_Y; iy++) {
      for (ix = 0; ix < SEG_X; ix++) {
        var a = iy * (SEG_X + 1) + ix, b = a + 1, c = a + SEG_X + 1, d = c + 1;
        idx[o++] = a; idx[o++] = b; idx[o++] = c;
        idx[o++] = b; idx[o++] = d; idx[o++] = c;
      }
    }
    indexCount = idx.length;

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    aniso = gl.getExtension('EXT_texture_filter_anisotropic');

    // Texturas: primero la portada provisional; si hay imagen propia, la reemplaza
    PROJECTS.forEach(function (p, i) {
      var card = { tex: null, uvScale: [1, 1], uvOff: [0, 0] };
      card.tex = makeTexture(placeholderCanvas(i, p));
      cards.push(card);
      if (p.cover) loadCover(card, p.cover);
    });
  }

  function makeTexture(source) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) {
      var max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
    }
    return tex;
  }

  function loadCover(card, src) {
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      if (destroyed || !gl) return;
      var old = card.tex;
      card.tex = makeTexture(img);
      gl.deleteTexture(old);
      // Mantiene la proporción de la imagen (recorte centrado, sin deformar)
      var ta = img.naturalWidth / img.naturalHeight;
      if (ta > PLANE_ASPECT) {
        var sx = PLANE_ASPECT / ta;
        card.uvScale = [sx, 1]; card.uvOff = [(1 - sx) / 2, 0];
      } else {
        var sy = ta / PLANE_ASPECT;
        card.uvScale = [1, sy]; card.uvOff = [0, (1 - sy) / 2];
      }
      invalidate();
    };
    img.src = src; // si falla, se conserva la portada provisional
  }

  // Regenerar texturas placeholder al cambiar de tema
  function refreshPlaceholders() {
    if (destroyed || !gl) return;
    PROJECTS.forEach(function (p, i) {
      if (!p.cover) { // solo si usa placeholder
        var card = cards[i];
        var old = card.tex;
        card.tex = makeTexture(placeholderCanvas(i, p));
        gl.deleteTexture(old);
      }
    });
    invalidate();
  }

  /* ---------- Matrices (column-major) ---------- */
  function ident() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) {
      for (var r = 0; r < 4; r++) {
        var s = 0;
        for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
    }
    return o;
  }
  function persp(fovy, aspect, n, f) {
    var t = 1 / Math.tan(fovy / 2), o = new Float32Array(16);
    o[0] = t / aspect; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
    return o;
  }
  function trans(x, y, z) { var o = ident(); o[12] = x; o[13] = y; o[14] = z; return o; }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  function scl(s) { var o = ident(); o[0] = o[5] = o[10] = s; return o; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smoothstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- Layout según el tamaño del lienzo ---------- */
  var cssW = 1, cssH = 1, scale = 1, pitch = 0.5, trackR = 5, pxPerProject = 300;
  var VP = ident();

  function layout() {
    var rect = canvas.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pw = Math.round(cssW * dpr), ph = Math.round(cssH * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
    var aspect = cssW / cssH;
    var phone = cssW < 640;
    var frac = phone ? 0.77 : 0.37;                       // ancho de la tarjeta central
    var d0 = CAM_Z - (TRACK_DEPTH - 0.28);
    var worldW = 2 * d0 * Math.tan(FOV / 2) * aspect;     // ancho visible a esa distancia
    scale = frac * worldW / (PW * 0.985);
    pitch = 0.52 * scale;                                 // paso vertical poco profundo
    trackR = worldW * (phone ? 0.80 : 0.50);              // radio horizontal generoso
    pxPerProject = Math.max(120, cssW * frac * 0.85);
    VP = mul(persp(FOV, aspect, NEAR, FAR), trans(0, 0, -CAM_Z));
    invalidate();
  }

  /* ---------- Estado y animación ---------- */
  var phase = 0, target = 0, velSmooth = 0, bend = BASE_BEND;
  var active = false, raf = 0, last = 0, destroyed = false, needsFrame = false;
  var visibleCards = [];
  var drag = null;
  var announced = -1;

  function wrap(x) {
    var h = N / 2;
    return ((((x + h) % N) + N) % N) - h;
  }

  function currentIndex() { return ((Math.round(target) % N) + N) % N; }

  function announce(initial) {
    var i = currentIndex();
    if (i === announced) return;
    announced = i;
    var p = PROJECTS[i];
    canvas.dataset.index = String(i);
    var vars = { i: i + 1, n: N, name: p.name + (p.category ? ', ' + p.category : '') };
    canvas.setAttribute('aria-label', I18n.format('reel.label', vars));
    if (live && !initial) live.textContent = I18n.format('reel.live', { i: i + 1, n: N, name: p.name });
  }

  // Al cambiar de idioma se vuelve a anunciar el proyecto actual en el idioma nuevo
  document.addEventListener('langchange', function () { announced = -1; announce(true); });

  function update(dt) {
    var prev = phase;
    phase += (target - phase) * (1 - Math.exp(-13 * dt));
    if (reduceMotion || Math.abs(target - phase) < 0.0005) phase = target;
    var vel = (phase - prev) / Math.max(dt, 0.001);
    velSmooth += (vel - velSmooth) * 0.2;
    bend = reduceMotion ? BASE_BEND : BASE_BEND + clamp(Math.abs(velSmooth) * 0.05, 0, MAX_BEND - BASE_BEND);
  }

  function draw(timeSec) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var lean = reduceMotion ? 0 : clamp(velSmooth * 0.035, -0.12, 0.12);
    var ripple = reduceMotion ? 0 : 0.006;
    var list = [];
    for (var i = 0; i < N; i++) {
      var rel = wrap(i - phase);
      var th = rel * STEP;
      var ct = Math.cos(th);
      if (ct < 0.06) continue;                            // de canto o de espaldas: no se dibuja
      var x = Math.sin(th) * trackR;
      var y = rel * pitch;
      var z = ct * TRACK_DEPTH - 0.28;
      var ry = Math.atan2(TRACK_DEPTH * Math.sin(th), trackR * ct) - lean;
      var rx = rel * -0.01;
      var M = mul(trans(x, y, z), mul(rotY(ry), mul(rotX(rx), mul(rotZ(-lean * 0.25), scl(scale)))));
      list.push({ i: i, rel: rel, z: z, ct: ct, M: M, MVP: mul(VP, M) });
    }
    list.sort(function (a, b) { return a.z - b.z; });     // de atrás hacia adelante

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform1i(U.uTex, 0);
    gl.uniform1f(U.uBend, bend);
    gl.uniform1f(U.uTime, timeSec);
    gl.uniform1f(U.uRipple, ripple);
    gl.activeTexture(gl.TEXTURE0);

    visibleCards = [];
    list.forEach(function (c) {
      var card = cards[c.i];
      gl.bindTexture(gl.TEXTURE_2D, card.tex);
      gl.uniformMatrix4fv(U.uMVP, false, c.MVP);
      gl.uniform1f(U.uSeed, c.i * 1.7);
      gl.uniform2f(U.uUvScale, card.uvScale[0], card.uvScale[1]);
      gl.uniform2f(U.uUvOff, card.uvOff[0], card.uvOff[1]);
      gl.uniform1f(U.uLight, 0.62 + 0.38 * clamp(c.ct, 0, 1));
      gl.uniform1f(U.uAlpha, smoothstep(0.08, 0.42, c.ct));  // se desvanecen antes de quedar de canto
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

      // Caja en pantalla para detectar clics
      var xs = [], ys = [];
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
        var px = s[0] * HALF_W * 0.985, py = s[1] * PH / 2;
        var m = c.MVP;
        var X = m[0] * px + m[4] * py + m[12];
        var Y = m[1] * px + m[5] * py + m[13];
        var W = m[3] * px + m[7] * py + m[15];
        xs.push((X / W * 0.5 + 0.5) * cssW);
        ys.push((1 - (Y / W * 0.5 + 0.5)) * cssH);
      });
      visibleCards.push({
        i: c.i, rel: c.rel,
        x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs),
        y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys)
      });
    });
    gl.bindVertexArray(null);
  }

  function frame(now) {
    raf = 0;
    if (!active || destroyed) return;
    var dt = clamp((now - last) / 1000 || 0.016, 0.001, 0.05);
    last = now;
    update(dt);
    draw(now / 1000);
    var settled = Math.abs(target - phase) < 0.0005;
    if (!reduceMotion || !settled || needsFrame) {
      needsFrame = false;
      raf = requestAnimationFrame(frame);
    }
  }

  function invalidate() {
    needsFrame = true;
    if (active && !raf && !destroyed) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function setActive(v) {
    if (v === active) return;
    active = v;
    if (active) {
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  /* ---------- Entradas: arrastre, clic, teclado ---------- */
  function hideHint() { if (hint) hint.classList.add('is-hidden'); }

  function goTo(t) {
    target = t;
    announce(false);
    invalidate();
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;   // solo clic izquierdo
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: target, lastX: e.clientX,
             lastT: performance.now(), v: 0, moved: false };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
    canvas.classList.add('is-dragging');
    invalidate();
  }

  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0;
    if (Math.abs(dx) > 5 || Math.abs(e.clientY - drag.y0) > 5) {
      if (!drag.moved) hideHint();
      drag.moved = true;
    }
    var now = performance.now();
    var dtms = Math.max(1, now - drag.lastT);
    var inst = (-(e.clientX - drag.lastX) / pxPerProject) / (dtms / 1000);
    drag.v += (inst - drag.v) * 0.35;
    drag.lastX = e.clientX; drag.lastT = now;
    target = drag.t0 - dx / pxPerProject;                      // arrastrar a la izquierda avanza
    announce(false);
    invalidate();
  }

  function endDrag(e, commit) {
    if (!drag) return;
    var d = drag;
    drag = null;
    canvas.classList.remove('is-dragging');
    try { if (e && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); } catch (err) { /* nada */ }
    if (commit && !d.moved) {
      // Clic simple: si cae sobre una tarjeta lateral, se centra
      var rect = canvas.getBoundingClientRect();
      var px = e.clientX - rect.left, py = e.clientY - rect.top;
      for (var k = visibleCards.length - 1; k >= 0; k--) {
        var c = visibleCards[k];
        if (px >= c.x0 && px <= c.x1 && py >= c.y0 && py <= c.y1) {
          goTo(Math.round(target) + Math.round(c.rel));
          return;
        }
      }
      goTo(Math.round(target));
      return;
    }
    // Al soltar, se acomoda en el proyecto más cercano (con algo de inercia)
    goTo(Math.round(target + clamp(d.v * 0.18, -1, 1)));
  }

  function onKeyDown(e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); hideHint(); goTo(Math.round(target) + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); hideHint(); goTo(Math.round(target) - 1); }
    else if (k === 'Home') { e.preventDefault(); goTo(Math.round(target / N) * N); }
  }

  var onUp = function (e) { endDrag(e, true); };
  var onCancel = function (e) { endDrag(e, false); };

  /* ---------- Ciclo de vida ---------- */
  var io = null, ro = null;

  function onVisibility() { setActive(!document.hidden && inView); }
  var inView = false;

  function onContextLost(e) {
    e.preventDefault();
    setActive(false);
    destroy(true);
    showFallback();
  }

  function destroy(keepFallback) {
    if (destroyed) return;
    destroyed = true;
    setActive(false);
    if (io) io.disconnect();
    if (ro) ro.disconnect();
    window.removeEventListener('resize', layout);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onCancel);
    canvas.removeEventListener('lostpointercapture', onCancel);
    canvas.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    if (gl) {
      try {
        cards.forEach(function (c) { gl.deleteTexture(c.tex); });
        gl.deleteBuffer(vbo); gl.deleteBuffer(ibo);
        gl.deleteVertexArray(vao); gl.deleteProgram(program);
        var ext = gl.getExtension('WEBGL_lose_context');
        if (ext && !keepFallback) ext.loseContext();
      } catch (err) { /* ya liberado */ }
    }
  }

  try {
    initGL();
  } catch (err) {
    destroy(true);
    showFallback();
    return;
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  canvas.addEventListener('lostpointercapture', onCancel);
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('webglcontextlost', onContextLost);
  window.addEventListener('resize', layout);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', function () { destroy(false); });

  if (window.ResizeObserver) {
    ro = new ResizeObserver(layout);
    ro.observe(canvas);
  }
  if (window.IntersectionObserver) {
    io = new IntersectionObserver(function (entries) {
      inView = entries[entries.length - 1].isIntersecting;
      onVisibility();
    }, { threshold: 0 });
    io.observe(section);
  } else {
    inView = true;
  }

  // Observar cambios de tema para regenerar placeholders
  var themeObserver = new MutationObserver(function () {
    refreshPlaceholders();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  layout();
  announce(true);
  onVisibility();
  invalidate();
})();
