/* Pantalla de carga: el logo y el texto "made by facu" se dibujan en una sola
   animación de trazado y luego se rellenan. Los tiempos se calculan según el
   largo real de cada contorno. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var body = document.body;
  var loader = document.getElementById('loader');
  // Buscar el <main> principal (funciona en index.html, sobre-mi.html, stack.html, contacto.html)
  var main = document.querySelector('main');
  if (!main) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var timers = [];
  var finished = false;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  // Mientras carga, el contenido de atrás no es accesible
  if (loader) main.setAttribute('inert', '');

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

  // Logo estático de la cabecera (se dibuja una sola vez, sin animación)
  function buildStaticLogo(data) {
    var svg = document.querySelector('.site-header__logo');
    if (!svg) return;
    svg.setAttribute('viewBox', data.viewBox);
    svg.appendChild(svgEl('path', {
      'class': 'logo-fill',
      d: data.paths.map(function (p) { return p.d; }).join('')
    }));
  }

  // Intro ya vista en esta sesión (ver js/layout.js): solo logo y contenido, sin animación
  function skipIntro() {
    try {
      if (window.LOGO_DATA) buildStaticLogo(window.LOGO_DATA);
    } catch (err) { /* el logo es decorativo */ }
    body.classList.add('is-ready');
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
  if (!loader) {
    skipIntro();
  } else if (document.visibilityState === 'hidden') {
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
