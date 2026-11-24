/* ==========================================================================
   i18n: Internacionalización simple ES/EN
   ========================================================================== */
(function () {
  'use strict';

  var translations = {
    es: {
      nav: {
        projects: 'Proyectos',
        about: 'Sobre mí',
        stack: 'Stack',
        contact: 'Contacto'
      },
      hero: {
        cta: 'Ver proyectos',
        p1: '¡Hola! Soy Facundo y me gusta construir cosas. Soy estudiante de programación y disfruto de convertir ideas en sitios y aplicaciones que funcionan bien, se ven bien y son fáciles de usar.',
        p2: 'Actualmente estoy estudiando y desarrollando <strong>proyectos personales</strong> donde practico lo que voy aprendiendo. Me interesa entender cómo funcionan las cosas por dentro, cuidar los detalles y escribir código claro que otras personas puedan leer y mantener.',
        p3: 'Estoy abierto a <strong>nuevas oportunidades y a proyectos con clientes</strong>. Si tenés una idea en mente o querés que trabajemos juntos, escribime: me encantará escucharte.',
        note: 'Sitio en construcción'
      },
      about: {
        title: 'Sobre mí',
        p1: 'Soy Facundo, estudiante de programación apasionado por crear experiencias digitales que sean funcionales, bonitas y accesibles.',
        p2: 'Me gusta entender cómo funcionan las cosas por dentro: desde el navegador hasta el servidor, pasando por la base de datos. Disfruto escribir código limpio, bien estructurado y que otros puedan leer y mantener.',
        p3: 'Cuando no estoy programando, me encontrarás aprendiendo algo nuevo, jugando videojuegos o tomando mate.'
      },
      stack: {
        title: 'Stack tecnológico',
        subtitle: 'Herramientas y tecnologías que uso habitualmente'
      },
      contact: {
        title: 'Contacto',
        dialogTitle: 'Contactame',
        button: 'Contacto',
        github: 'GitHub',
        email: 'Email',
        whatsapp: 'WhatsApp'
      },
      lang: {
        current: 'ES'
      }
    },
    en: {
      nav: {
        projects: 'Projects',
        about: 'About',
        stack: 'Stack',
        contact: 'Contact'
      },
      hero: {
        cta: 'View projects',
        p1: 'Hi! I\'m Facundo and I like building things. I\'m a programming student and I enjoy turning ideas into websites and applications that work well, look great, and are easy to use.',
        p2: 'I\'m currently studying and developing <strong>personal projects</strong> where I practice what I\'m learning. I\'m interested in understanding how things work under the hood, caring about details, and writing clean code that others can read and maintain.',
        p3: 'I\'m open to <strong>new opportunities and client projects</strong>. If you have an idea in mind or want to work together, write to me: I\'d love to hear from you.',
        note: 'Site under construction'
      },
      about: {
        title: 'About me',
        p1: 'I\'m Facundo, a programming student passionate about creating digital experiences that are functional, beautiful, and accessible.',
        p2: 'I like understanding how things work under the hood: from the browser to the server, through the database. I enjoy writing clean, well-structured code that others can read and maintain.',
        p3: 'When I\'m not coding, you\'ll find me learning something new, playing video games, or drinking mate.'
      },
      stack: {
        title: 'Tech Stack',
        subtitle: 'Tools and technologies I use regularly'
      },
      contact: {
        title: 'Contact',
        dialogTitle: 'Contact me',
        button: 'Contact',
        github: 'GitHub',
        email: 'Email',
        whatsapp: 'WhatsApp'
      },
      lang: {
        current: 'EN'
      }
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

  function applyTranslations(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = translate(key, lang);
      // Si el elemento tiene hijos que no son solo texto, usar innerHTML
      if (el.children.length === 0 || key.includes('hero.p') || key.includes('about.p')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    // Actualizar meta description
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', translate('hero.p1', lang).replace(/<[^>]*>/g, '').slice(0, 160));
    }
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
    setLang: applyTranslations,
    getLang: function () { return currentLang; }
  };
})();