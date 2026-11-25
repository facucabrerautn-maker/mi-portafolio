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
      home: {
        message: 'Si tenés una idea en mente o querés que <em>trabajemos juntos</em>, me encantará escucharte.'
      },
      meta: {
        description: 'Portafolio de Facundo Cabrera, estudiante de programación.'
      },
      about: {
        title: 'Sobre mí',
        content: '<p>Soy Facundo, estudiante de programación apasionado por crear experiencias digitales que sean funcionales, bonitas y accesibles.</p><p>Me gusta entender cómo funcionan las cosas por dentro: desde el navegador hasta el servidor, pasando por la base de datos. Disfruto escribir código limpio, bien estructurado y que otros puedan leer y mantener.</p><p>Cuando no estoy programando, me encontrarás aprendiendo algo nuevo, jugando videojuegos o tomando mate.</p>',
        p1: 'Soy Facundo, estudiante de programación apasionado por crear experiencias digitales que sean funcionales, bonitas y accesibles.',
        p2: 'Me gusta entender cómo funcionan las cosas por dentro: desde el navegador hasta el servidor, pasando por la base de datos. Disfruto escribir código limpio, bien estructurado y que otros puedan leer y mantener.',
        p3: 'Cuando no estoy programando, me encontrarás aprendiendo algo nuevo, jugando videojuegos o tomando mate.'
      },
      stack: {
        title: 'Stack tecnológico',
        subtitle: 'Herramientas y tecnologías que uso habitualmente',
        intro: 'Estas son las tecnologías con las que diseño, desarrollo y despliego mis proyectos',
        frontend: 'Frontend',
        backend: 'Backend y Base de datos',
        tools: 'Herramientas'
      },
      contact: {
        title: 'Contacto',
        dialogTitle: 'Contactame',
        button: 'Contacto',
        github: 'GitHub',
        email: 'Email',
        whatsapp: 'WhatsApp',
        cvLabel: 'CV / Curriculum',
        downloadCv: 'Descargar CV'
      },
      lang: {
        current: 'ES'
      },
      footer: {
        made: 'Hecho por Facu',
        rights: 'Todos los derechos reservados'
      }
    },
    en: {
      nav: {
        projects: 'Projects',
        about: 'About',
        stack: 'Stack',
        contact: 'Contact'
      },
      home: {
        message: 'If you have an idea in mind or want us to <em>work together</em>, I\'d love to hear from you.'
      },
      meta: {
        description: 'Portfolio of Facundo Cabrera, programming student.'
      },
      about: {
        title: 'About me',
        content: '<p>I\'m Facundo, a programming student passionate about creating digital experiences that are functional, beautiful, and accessible.</p><p>I like understanding how things work under the hood: from the browser to the server, through the database. I enjoy writing clean, well-structured code that others can read and maintain.</p><p>When I\'m not coding, you\'ll find me learning something new, playing video games, or drinking mate.</p>',
        p1: 'I\'m Facundo, a programming student passionate about creating digital experiences that are functional, beautiful, and accessible.',
        p2: 'I like understanding how things work under the hood: from the browser to the server, through the database. I enjoy writing clean, well-structured code that others can read and maintain.',
        p3: 'When I\'m not coding, you\'ll find me learning something new, playing video games, or drinking mate.'
      },
      stack: {
        title: 'Tech Stack',
        subtitle: 'Tools and technologies I use regularly',
        intro: 'These are the technologies I use to design, develop, and deploy my projects',
        frontend: 'Frontend',
        backend: 'Backend & Databases',
        tools: 'Tools'
      },
      contact: {
        title: 'Contact',
        dialogTitle: 'Contact me',
        button: 'Contact',
        github: 'GitHub',
        email: 'Email',
        whatsapp: 'WhatsApp',
        cvLabel: 'CV / Resume',
        downloadCv: 'Download CV'
      },
      lang: {
        current: 'EN'
      },
      footer: {
        made: 'Made by Facu',
        rights: 'All rights reserved'
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
      // Las traducciones son texto propio del sitio (a veces con <em>/<strong>), por eso innerHTML
      el.innerHTML = text;
    });

    // Actualizar meta description
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', translate('meta.description', lang));
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