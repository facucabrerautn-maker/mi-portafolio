/* ==========================================================================
   Site Header: Theme toggle, Sound toggle, Language switcher
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Theme Toggle ---------- */
  var themeBtn = document.querySelector('[data-theme-btn]');
  var html = document.documentElement;
  var THEME_KEY = 'site-theme';

  function getInitialTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      html.classList.add('light-mode');
      themeBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
      themeBtn.setAttribute('aria-pressed', 'true');
    } else {
      html.classList.remove('light-mode');
      themeBtn.setAttribute('aria-label', 'Cambiar a modo claro');
      themeBtn.setAttribute('aria-pressed', 'false');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    var theme = getInitialTheme();
    applyTheme(theme);

    // Escuchar cambios del sistema
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });

    themeBtn.addEventListener('click', function () {
      var current = html.classList.contains('light-mode') ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- Sound Toggle (placeholder) ---------- */
  var soundBtn = document.querySelector('[data-sound-btn]');
  var SOUND_KEY = 'site-sound-enabled';

  function initSound() {
    var enabled = localStorage.getItem(SOUND_KEY) !== 'false'; // default true
    soundBtn.setAttribute('aria-pressed', enabled.toString());

    soundBtn.addEventListener('click', function () {
      var newState = soundBtn.getAttribute('aria-pressed') !== 'true';
      soundBtn.setAttribute('aria-pressed', newState.toString());
      localStorage.setItem(SOUND_KEY, newState.toString());

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
    var stored = localStorage.getItem(LANG_KEY);
    if (stored === 'es' || stored === 'en') return stored;
    // Detectar por navigator.language
    return navigator.language.startsWith('es') ? 'es' : 'en';
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    if (langText) langText.textContent = lang.toUpperCase();
    langBtn.setAttribute('aria-label', lang === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish');
    langBtn.setAttribute('aria-pressed', lang === 'en');
    localStorage.setItem(LANG_KEY, lang);

    // Disparar evento personalizado para que i18n.js actualice los textos
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
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

  /* ---------- Mobile menu toggle (para futuro hamburger) ---------- */
  // Se deja preparado por si se añade un botón hamburguesa

  /* ---------- Init ---------- */
  initTheme();
  initSound();
  initLang();
  initSmoothScroll();

  /* Exponer funciones para debugging si se necesita */
  window.SiteHeader = {
    setTheme: applyTheme,
    setLang: applyLang,
    toggleSound: function (enabled) {
      soundBtn.setAttribute('aria-pressed', enabled.toString());
      localStorage.setItem(SOUND_KEY, enabled.toString());
    }
  };
})();