/* ==========================================================================
   i18n: Internacionalización simple ES/EN
   ========================================================================== */
(function () {
  'use strict';

  var translations = {
    es: {
      nav: { projects: 'Proyectos', about: 'Sobre mí', stack: 'Stack', contact: 'Contacto' },
      home: {
        message: 'Si tenés una idea en mente o querés que <em>trabajemos juntos</em>, me encantará escucharte.',
        hint: 'Arrastrá para explorar'
      },
      meta: {
        home: {
          title: 'Facundo Cabrera — Estudiante de programación | Portafolio',
          description: 'Portafolio de Facundo Cabrera, estudiante de programación: proyectos web, stack tecnológico y contacto.'
        },
        about: {
          title: 'Sobre mí — Facundo Cabrera',
          description: 'Facundo Cabrera, estudiante de programación apasionado por crear experiencias digitales funcionales, bonitas y accesibles.'
        },
        stack: {
          title: 'Stack tecnológico — Facundo Cabrera',
          description: 'Tecnologías que uso habitualmente: frontend, backend y bases de datos, y herramientas de desarrollo.'
        },
        contact: {
          title: 'Contacto — Facundo Cabrera',
          description: 'Contactá a Facundo Cabrera: GitHub, email y WhatsApp.'
        }
      },
      about: {
        content: '<p>Soy Facundo, estudiante de programación apasionado por crear experiencias digitales que sean funcionales, bonitas y accesibles.</p><p>Me gusta entender cómo funcionan las cosas por dentro: desde el navegador hasta el servidor, pasando por la base de datos. Disfruto escribir código limpio, bien estructurado y que otros puedan leer y mantener.</p><p>Cuando no estoy programando, me encontrarás aprendiendo algo nuevo, jugando videojuegos o tomando mate.</p>'
      },
      stack: {
        title: 'Stack tecnológico',
        intro: 'Estas son las tecnologías con las que diseño, desarrollo y despliego mis proyectos',
        frontend: 'Frontend',
        backend: 'Backend y Base de datos',
        tools: 'Herramientas'
      },
      contact: {
        title: 'Contacto',
        github: 'GitHub',
        email: 'Email',
        whatsapp: 'WhatsApp',
        cvLabel: 'CV / Curriculum',
        downloadCv: 'Descargar CV'
      },
      loader: { status: 'Cargando el portafolio de Facu… Made by Facu', skip: 'Saltar intro' },
      a11y: {
        skip: 'Saltar al contenido',
        home: 'Facu — Inicio',
        mainNav: 'Navegación principal',
        footerNav: 'Navegación del pie de página',
        controls: 'Controles del sitio',
        contactMethods: 'Métodos de contacto',
        reel: 'Carrete de proyectos',
        soundOn: 'Silenciar sonidos',
        soundOff: 'Activar sonidos',
        themeToLight: 'Cambiar a modo claro',
        themeToDark: 'Cambiar a modo oscuro',
        langTo: 'Cambiar a inglés'
      },
      reel: {
        label: 'Carrete de proyectos. Proyecto {i} de {n}: {name}. Arrastrá o usá las flechas del teclado para explorar.',
        live: 'Proyecto {i} de {n}: {name}'
      },
      lang: { current: 'ES' },
      footer: { rights: 'Todos los derechos reservados' }
    },
    en: {
      nav: { projects: 'Projects', about: 'About', stack: 'Stack', contact: 'Contact' },
      home: {
        message: 'If you have an idea in mind or want us to <em>work together</em>, I\'d love to hear from you.',
        hint: 'Drag to explore'
      },
      meta: {
        home: {
          title: 'Facundo Cabrera — Programming student | Portfolio',
          description: 'Portfolio of Facundo Cabrera, programming student: web projects, tech stack and contact.'
        },
        about: {
          title: 'About me — Facundo Cabrera',
          description: 'Facundo Cabrera, a programming student passionate about building functional, beautiful and accessible digital experiences.'
        },
        stack: {
          title: 'Tech stack — Facundo Cabrera',
          description: 'Technologies I use regularly: frontend, backend and databases, and development tools.'
        },
        contact: {
          title: 'Contact — Facundo Cabrera',
          description: 'Get in touch with Facundo Cabrera: GitHub, email and WhatsApp.'
        }
      },
      about: {
        content: '<p>I\'m Facundo, a programming student passionate about creating digital experiences that are functional, beautiful, and accessible.</p><p>I like understanding how things work under the hood: from the browser to the server, through the database. I enjoy writing clean, well-structured code that others can read and maintain.</p><p>When I\'m not coding, you\'ll find me learning something new, playing video games, or drinking mate.</p>'
      },
      stack: {
        title: 'Tech Stack',
        intro: 'These are the technologies I use to design, develop, and deploy my projects',
        frontend: 'Frontend',
        backend: 'Backend & Databases',
        tools: 'Tools'
      },
      contact: {
        title: 'Contact',
        github: 'GitHub',
        email: 'Email',
        whatsapp: 'WhatsApp',
        cvLabel: 'CV / Resume',
        downloadCv: 'Download CV'
      },
      loader: { status: 'Loading Facu\'s portfolio… Made by Facu', skip: 'Skip intro' },
      a11y: {
        skip: 'Skip to content',
        home: 'Facu — Home',
        mainNav: 'Main navigation',
        footerNav: 'Footer navigation',
        controls: 'Site controls',
        contactMethods: 'Contact methods',
        reel: 'Project reel',
        soundOn: 'Mute sounds',
        soundOff: 'Turn sounds on',
        themeToLight: 'Switch to light mode',
        themeToDark: 'Switch to dark mode',
        langTo: 'Switch to Spanish'
      },
      reel: {
        label: 'Project reel. Project {i} of {n}: {name}. Drag or use the arrow keys to explore.',
        live: 'Project {i} of {n}: {name}'
      },
      lang: { current: 'EN' },
      footer: { rights: 'All rights reserved' }
    }
  };

  var currentLang = document.documentElement.lang || 'es';

  function translate(key, lang) {
    var keys = key.split('.');
    var obj = translations[lang] || translations.es;
    for (var i = 0; i < keys.length; i++) {
      if (!obj) return key;
      obj = obj[keys[i]];
    }
    return obj || key;
  }

  // Reemplaza {marcadores} en una traducción: format('reel.live', {i: 1})
  function format(key, vars) {
    return translate(key, currentLang).replace(/\{(\w+)\}/g, function (m, k) {
      return vars && vars[k] != null ? vars[k] : m;
    });
  }

  function applyTranslations(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      // Las traducciones son texto propio del sitio (a veces con <em>/<p>), por eso innerHTML
      el.innerHTML = translate(el.getAttribute('data-i18n'), lang);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      el.setAttribute('aria-label', translate(el.getAttribute('data-i18n-label'), lang));
    });

    // Título y descripción de la página actual (también para compartir en redes)
    var page = document.documentElement.getAttribute('data-page') || 'home';
    var title = translate('meta.' + page + '.title', lang);
    var desc = translate('meta.' + page + '.description', lang);
    if (title.indexOf('meta.') !== 0) document.title = title;
    [['meta[name="description"]', desc], ['meta[property="og:description"]', desc],
     ['meta[property="og:title"]', title]].forEach(function (pair) {
      var el = document.querySelector(pair[0]);
      if (el) el.setAttribute('content', pair[1]);
    });
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute('content', lang === 'en' ? 'en_US' : 'es_AR');
  }

  // Escuchar evento de cambio de idioma
  document.addEventListener('langchange', function (e) {
    applyTranslations(e.detail.lang);
  });

  // Inicializar con el idioma actual
  applyTranslations(currentLang);

  // Exponer para uso externo
  window.I18n = {
    translate: translate,
    format: format,
    setLang: applyTranslations,
    getLang: function () { return currentLang; }
  };
})();