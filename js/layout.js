/* ==========================================================================
   Layout compartido: <site-loader>, <site-header> y <site-footer>.
   Antes cada página repetía ~80 líneas de HTML; ahora se editan acá una sola vez.
   Se carga en el <head> (sin defer) para que los elementos se definan antes de
   que el parser los encuentre. Cada página declara <html data-page="home|about|stack|contact">.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var page = root.getAttribute('data-page') || 'home';
  var isHome = page === 'home';

  var NAV = [
    { key: 'projects', href: isHome ? '#proyectos' : 'index.html#proyectos', i18n: 'nav.projects', text: 'Proyectos' },
    { key: 'about',    href: 'sobre-mi.html', i18n: 'nav.about',   text: 'Sobre mí' },
    { key: 'stack',    href: 'stack.html',    i18n: 'nav.stack',   text: 'Stack' },
    { key: 'contact',  href: 'contacto.html', i18n: 'nav.contact', text: 'Contacto' }
  ];

  function navItems(cls) {
    return NAV.map(function (n) {
      var current = n.key === page ? ' aria-current="page"' : '';
      return '<li><a class="' + cls + '" href="' + n.href + '" data-i18n="' + n.i18n + '"' + current + '>' + n.text + '</a></li>';
    }).join('');
  }

  /* ---------- Intro: una sola vez por sesión ----------
     Se ve en la primera visita y al recargar; al navegar entre páginas se omite. */
  var INTRO_KEY = 'site-intro-seen';

  function shouldPlayIntro() {
    var reload = false;
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      reload = !!nav && nav.type === 'reload';
    } catch (e) { /* sin Navigation Timing */ }
    var seen = false;
    try { seen = sessionStorage.getItem(INTRO_KEY) === '1'; } catch (e) { /* sin storage */ }
    return reload || !seen;
  }

  var playIntro = shouldPlayIntro();
  if (playIntro) {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) { /* sin storage */ }
  } else {
    root.classList.add('intro-skipped');
  }

  /* ---------- Elementos (light DOM; el wrapper no genera caja: display:contents) ---------- */
  function define(name, render) {
    if (customElements.get(name)) return;
    customElements.define(name, class extends HTMLElement {
      connectedCallback() {
        if (this.hasAttribute('data-rendered')) return;
        this.setAttribute('data-rendered', '');
        this.innerHTML = render();
      }
    });
  }

  define('site-loader', function () {
    if (!playIntro) return '';
    return '' +
      '<div class="loader" id="loader">' +
        '<p class="sr-only" role="status" data-i18n="loader.status">Cargando el portafolio de Facu…</p>' +
        '<div class="loader__stage" aria-hidden="true">' +
          '<svg class="loader__logo" viewBox="0 0 1515 623" focusable="false"></svg>' +
        '</div>' +
        '<button class="loader__skip" type="button" data-i18n="loader.skip">Saltar intro</button>' +
      '</div>';
  });

  define('site-header', function () {
    return '' +
      '<a class="skip-link" href="#" data-skip-link data-i18n="a11y.skip">Saltar al contenido</a>' +
      '<header class="site-header" id="site-header">' +
        '<div class="site-header__inner">' +
          '<a class="site-header__brand" href="' + (isHome ? '#inicio' : 'index.html') + '" data-i18n-label="a11y.home" aria-label="Facu — Inicio">' +
            '<svg class="site-header__logo" viewBox="0 0 1515 623" focusable="false" aria-hidden="true"></svg>' +
          '</a>' +
          '<nav class="site-header__nav" data-i18n-label="a11y.mainNav" aria-label="Navegación principal">' +
            '<ul class="site-header__list">' + navItems('site-header__link') + '</ul>' +
          '</nav>' +
          '<div class="site-header__actions" role="group" data-i18n-label="a11y.controls" aria-label="Controles del sitio">' +
            /* aria-pressed="true" = sonido activado. Un solo ícono: las ondas se apagan y la X se dibuja al silenciar. */
            '<button class="site-header__btn site-header__btn--sound" type="button" aria-pressed="false" data-sound-btn>' +
              '<svg class="site-header__icon site-header__icon--sound" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">' +
                '<path class="sound-body" d="M11 5L6 9H2v6h4l5 4V5z"></path>' +
                '<path class="sound-wave sound-wave-1" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
                '<path class="sound-wave sound-wave-2" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>' +
                '<g class="sound-x">' +
                  '<line class="sound-x-1" pathLength="1" x1="23" y1="9" x2="17" y2="15"></line>' +
                  '<line class="sound-x-2" pathLength="1" x1="17" y1="9" x2="23" y2="15"></line>' +
                '</g>' +
              '</svg>' +
            '</button>' +
            '<button class="site-header__btn site-header__btn--theme" type="button" aria-pressed="false" data-theme-btn>' +
              '<svg class="site-header__icon site-header__icon--sun" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">' +
                '<circle cx="12" cy="12" r="5"></circle>' +
                '<line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>' +
                '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>' +
                '<line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>' +
                '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' +
              '</svg>' +
              '<svg class="site-header__icon site-header__icon--moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">' +
                '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' +
              '</svg>' +
            '</button>' +
            '<button class="site-header__btn site-header__btn--lang" type="button" aria-pressed="false" data-lang-btn>' +
              '<span class="site-header__lang-text" data-i18n="lang.current">ES</span>' +
              '<svg class="site-header__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">' +
                '<path d="M6 9l6 6 6-6"></path>' +
              '</svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</header>';
  });

  define('site-footer', function () {
    return '' +
      '<footer class="site-footer">' +
        '<div class="site-footer__inner">' +
          '<nav class="site-footer__nav" data-i18n-label="a11y.footerNav" aria-label="Navegación del pie de página">' +
            '<ul class="site-footer__list">' + navItems('site-footer__link') + '</ul>' +
          '</nav>' +
          '<p class="site-footer__copy">' +
            '<span class="footer-brand">Made by Facu</span> · <span data-i18n="footer.rights">Todos los derechos reservados</span>' +
          '</p>' +
        '</div>' +
      '</footer>';
  });
})();
