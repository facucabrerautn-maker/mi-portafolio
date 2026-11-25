/* ==========================================================================
   Site Header: Theme toggle, Sound toggle, Language switcher
   ========================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;

  // Texto localizado (i18n.js se carga antes que este archivo)
  function t(key) { return window.I18n ? window.I18n.translate(key, window.I18n.getLang()) : key; }

  /* ---------- Theme Toggle ---------- */
  var themeBtn = document.querySelector('[data-theme-btn]');
  var THEME_KEY = 'site-theme';

  function readStored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function getInitialTheme() {
    var stored = readStored(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    html.classList.toggle('light-mode', theme === 'light');
    themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
    themeBtn.setAttribute('aria-label', t(theme === 'light' ? 'a11y.themeToDark' : 'a11y.themeToLight'));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#86c6f3' : '#0a0a0a');
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* sin storage */ }
  }

  function initTheme() {
    var theme = getInitialTheme();
    applyTheme(theme);

    // Escuchar cambios del sistema
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (!readStored(THEME_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });

    themeBtn.addEventListener('click', function () {
      var current = html.classList.contains('light-mode') ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- Sound Toggle (placeholder) ----------
   aria-pressed="true" = sonido activado; el ícono se anima solo desde CSS. */
  var soundBtn = document.querySelector('[data-sound-btn]');
  var SOUND_KEY = 'site-sound-enabled';

  function setSound(enabled) {
    soundBtn.setAttribute('aria-pressed', String(enabled));
    soundBtn.setAttribute('aria-label', t(enabled ? 'a11y.soundOn' : 'a11y.soundOff'));
    try { localStorage.setItem(SOUND_KEY, String(enabled)); } catch (e) { /* sin storage */ }
  }

  function initSound() {
    // Por defecto silenciado: todavía no hay sonidos y los navegadores exigen un gesto del usuario para reproducir
    setSound(readStored(SOUND_KEY) === 'true');

    soundBtn.addEventListener('click', function () {
      var newState = soundBtn.getAttribute('aria-pressed') !== 'true';
      setSound(newState);

      // Placeholder para futura implementación de sonidos
      if (newState && window.AudioContext) {
        // Aquí se inicializaría el AudioContext cuando se implemente
        // var ctx = new AudioContext();
        // playClickSound(ctx);
      }
    });
  }

  /* ---------- Language Switcher ---------- */
  var langBtn = document.querySelector('[data-lang-btn]');
  var langText = langBtn?.querySelector('.site-header__lang-text');
  var LANG_KEY = 'site-lang';

  function getInitialLang() {
    var stored = readStored(LANG_KEY);
    if (stored === 'es' || stored === 'en') return stored;
    // Detectar por navigator.language
    return navigator.language.startsWith('es') ? 'es' : 'en';
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    if (langText) langText.textContent = lang.toUpperCase();
    langBtn.setAttribute('aria-pressed', String(lang === 'en'));
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* sin storage */ }

    // i18n.js actualiza los textos; después se refrescan las etiquetas que dependen del estado
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    refreshLabels();
  }

  function refreshLabels() {
    langBtn.setAttribute('aria-label', t('a11y.langTo'));
    themeBtn.setAttribute('aria-label', t(html.classList.contains('light-mode') ? 'a11y.themeToDark' : 'a11y.themeToLight'));
    soundBtn.setAttribute('aria-label', t(soundBtn.getAttribute('aria-pressed') === 'true' ? 'a11y.soundOn' : 'a11y.soundOff'));
  }

  function initLang() {
    var lang = getInitialLang();
    applyLang(lang);

    langBtn.addEventListener('click', function () {
      var current = document.documentElement.lang || 'es';
      applyLang(current === 'es' ? 'en' : 'es');
    });
  }

  /* ---------- Smooth scroll para anclas del nav ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('.site-header__link[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Cerrar menú móvil si está abierto
        var list = document.querySelector('.site-header__list');
        if (list) list.classList.remove('site-header__list--visible');
      });
    });
  }

  /* ---------- Cabecera con fondo al hacer scroll ---------- */
  function initScrollState() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function update() { header.classList.toggle('is-scrolled', (window.scrollY || 0) > 24); }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Enlace "saltar al contenido" ---------- */
  function initSkipLink() {
    var link = document.querySelector('[data-skip-link]');
    var main = document.querySelector('main');
    if (!link || !main) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      main.focus();
      main.scrollIntoView();
    });
  }

  /* ---------- Init ---------- */
  initTheme();
  initSound();
  initLang();
  initSmoothScroll();
  initScrollState();
  initSkipLink();

  /* Exponer funciones para debugging si se necesita */
  window.SiteHeader = {
    setTheme: applyTheme,
    setLang: applyLang,
    toggleSound: setSound
  };
})();