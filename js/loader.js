/* Pantalla de carga: el logo y el texto "made by facu" se dibujan en una sola
   animación de trazado y luego se rellenan. Los tiempos se calculan según el
   largo real de cada contorno. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var body = document.body;
  var loader = document.getElementById('loader');
  var main = document.getElementById('inicio');
  if (!loader || !main) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var timers = [];
  var finished = false;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  // Mientras carga, el contenido de atrás no es accesible
  main.setAttribute('inert', '');

  function done() {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
    main.removeAttribute('inert');
    body.classList.add('is-ready');
    try { main.focus({ preventScroll: true }); } catch (e) { /* sin foco */ }
  }

  function leave() {
    if (finished) return;
    finished = true;
    clearTimers();
    loader.classList.add('is-leaving');
    later(done, reduceMotion ? 0 : 650);
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function buildDrawing(data) {
    var svg = loader.querySelector('.loader__logo');
    svg.setAttribute('viewBox', data.viewBox);

    var fill = svgEl('path', {
      'class': 'fill',
      d: data.paths.map(function (p) { return p.d; }).join('')
    });
    var outline = svgEl('g', { 'class': 'outline' });
    var strokes = data.paths.map(function (p) {
      var el = svgEl('path', { 'class': 'stroke', d: p.d });
      outline.appendChild(el);
      return el;
    });

    svg.appendChild(fill);
    svg.appendChild(outline);
    return strokes;
  }

  // Construye el logo estático en la esquina superior izquierda (legacy) y en el header
  function buildStaticLogo(data) {
    // Logo legacy (por compatibilidad)
    var svgLegacy = document.querySelector('.site-logo__svg');
    if (svgLegacy) {
      svgLegacy.setAttribute('viewBox', data.viewBox);
      var fillLegacy = svgEl('path', {
        'class': 'logo-fill',
        d: data.paths.map(function (p) { return p.d; }).join('')
      });
      svgLegacy.appendChild(fillLegacy);
    }

    // Logo en el header (nuevo)
    var svgHeader = document.querySelector('.site-header__logo');
    if (svgHeader) {
      svgHeader.setAttribute('viewBox', data.viewBox);
      var fillHeader = svgEl('path', {
        'class': 'logo-fill',
        d: data.paths.map(function (p) { return p.d; }).join('')
      });
      svgHeader.appendChild(fillHeader);
    }
  }

  function start() {
    try {
      var data = window.LOGO_DATA;
      if (!data || !data.paths || !data.paths.length) throw new Error('Sin datos del logo');

      // Logo estático en esquina superior izquierda (se dibuja una sola vez, sin animación)
      buildStaticLogo(data);

      var strokes = buildDrawing(data);

      loader.querySelector('.loader__skip').addEventListener('click', leave);

      if (reduceMotion) {
        loader.classList.add('is-static');
        later(leave, 1200);
        return;
      }

      // Tiempos: cada contorno según su largo real.
      // El logo arranca primero; el texto se suma enseguida, de izquierda a derecha.
      var lens = strokes.map(function (el) { return el.getTotalLength(); });
      var maxLen = Math.max.apply(null, lens);
      var logoIndex = 0;
      var textIndex = 0;
      var end = 0;

      strokes.forEach(function (el, i) {
        var isText = data.paths[i].g === 'text';
        var delay = isText ? 450 + (textIndex++) * 40 : (logoIndex++) * 60;
        var dur = Math.min(1800, 800 + 1000 * Math.sqrt(lens[i] / maxLen));
        el.style.setProperty('--len', lens[i].toFixed(1));
        el.style.setProperty('--delay', delay + 'ms');
        el.style.setProperty('--dur', dur + 'ms');
        end = Math.max(end, delay + dur);
      });

      var tFill = Math.round(end + 120);  // el relleno empieza cuando todos los contornos terminaron
      var tLeave = tFill + 700 + 1300;    // relleno (700 ms) + pausa con el dibujo completo

      loader.style.setProperty('--t-fill', tFill + 'ms');

      // Dos frames para que el estado inicial se pinte antes de animar
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          loader.classList.add('is-playing');
          later(leave, tLeave);
        });
      });
    } catch (err) {
      // Si algo falla, nunca se bloquea el sitio
      finished = true;
      clearTimers();
      done();
    }
  }

  // No arrancar la animación con la pestaña en segundo plano
  if (document.visibilityState === 'hidden') {
    var onVisible = function () {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', onVisible);
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
  } else {
    start();
  }
})();
