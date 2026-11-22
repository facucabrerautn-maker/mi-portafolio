/* Pantalla de carga: el logo se dibuja, se rellena y aparece "Made by Facu".
   Los tiempos se calculan según el largo real de cada contorno. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var TEXT = 'Made by Facu';
  var ACCENT_WORD = 'Facu';

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

  function buildLogo(data) {
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

  function buildText() {
    var p = loader.querySelector('.loader__text');
    var words = TEXT.split(' ');
    var index = 0;
    words.forEach(function (w, wi) {
      var word = document.createElement('span');
      word.className = 'word' + (w === ACCENT_WORD ? ' word--accent' : '');
      w.split('').forEach(function (c) {
        var ch = document.createElement('span');
        ch.className = 'ch';
        ch.style.setProperty('--i', index++);
        ch.textContent = c;
        word.appendChild(ch);
      });
      p.appendChild(word);
      if (wi < words.length - 1) {
        p.appendChild(document.createTextNode(' '));
        index++; // el espacio también cuenta en el ritmo
      }
    });
    return index;
  }

  function start() {
    try {
      var data = window.LOGO_DATA;
      if (!data || !data.paths || !data.paths.length) throw new Error('Sin datos del logo');

      var strokes = buildLogo(data);
      var letters = buildText();

      loader.querySelector('.loader__skip').addEventListener('click', leave);

      if (reduceMotion) {
        loader.classList.add('is-static');
        later(leave, 1200);
        return;
      }

      // Tiempos: cada contorno según su largo real
      var lens = strokes.map(function (el) { return el.getTotalLength(); });
      var maxLen = Math.max.apply(null, lens);
      var end = 0;
      strokes.forEach(function (el, i) {
        var delay = i * 70;
        var dur = 900 + 1000 * Math.min(1, lens[i] / maxLen);
        el.style.setProperty('--len', lens[i].toFixed(1));
        el.style.setProperty('--delay', delay + 'ms');
        el.style.setProperty('--dur', dur + 'ms');
        end = Math.max(end, delay + dur);
      });

      var tFill = Math.round(end + 120);      // el relleno empieza cuando todos los contornos terminaron
      var tText = tFill + 200;                // el texto aparece mientras se rellena
      var tTextEnd = tText + letters * 55 + 600;
      var tLeave = tTextEnd + 1100;           // pausa con el logo completo

      loader.style.setProperty('--t-fill', tFill + 'ms');
      loader.style.setProperty('--t-text', tText + 'ms');

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
