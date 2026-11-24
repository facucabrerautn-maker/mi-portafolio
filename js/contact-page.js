/* Contact page: renderiza los enlaces de contacto en la página contacto.html */
(function () {
  'use strict';

  var container = document.querySelector('.contact-page__links');
  if (!container) return;

  // Datos de contacto - edita aquí tus enlaces reales
  var contacts = [
    {
      name: 'GitHub',
      href: 'https://github.com/tu-usuario',  // Cambia por tu usuario
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
      external: true
    },
    {
      name: 'Email',
      href: 'mailto:tu-email@ejemplo.com',  // Cambia por tu email
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      external: false
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/54911XXXXXXXX',  // Cambia por tu número (formato internacional sin + ni espacios)
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 16.16c-.45-.24-1.12-.35-1.71-.36-.56-.03-1.07.17-1.5.47-.58.41-1.02.71-1.43.95-.42.24-.87.23-1.28.08-.41-.15-1.17-.47-1.6-.81-.67-.56-1.25-1.18-1.4-1.64-.09-.25-.09-.45-.09-.64 0-.2.03-.39.1-.55.1-.34.07-.84-.04-1.15-.3-.88-1.02-2.07-1.02-3.63 0-2.1 1.36-3.42 2.27-4.1.21-.16.4-.37.55-.6.15-.24.23-.47.33-.52.13-.07.26-.1.53-.1.22 0 .4.04 .58.1.34.12 2.04 1.43 2.62 1.78.35.2 2.22 1.77 2.26 2.38.03.4-.41 1.33-1.18 2.28-.42.51-.9 1.18-1.14 1.67-.24.49-.25.65-.26.78 0 .1.05.33.25.56.4.49 1.05 1.36 1.05 2.4 0 .69-.2 1.4-.58 1.92-.38.52-1.26 1.1-2.16 1.44-.71.27-1.23.32-1.52.33-.34.02-.63-.1-.9-.33z"/></svg>',
      external: true
    }
  ];

  var currentLang = document.documentElement.lang || 'es';
  var labels = {
    es: {
      github: 'GitHub',
      email: 'Email',
      whatsapp: 'WhatsApp'
    },
    en: {
      github: 'GitHub',
      email: 'Email',
      whatsapp: 'WhatsApp'
    }
  };

  function render() {
    container.innerHTML = '';
    contacts.forEach(function (contact) {
      var a = document.createElement('a');
      a.className = 'contact-page__link';
      a.href = contact.href;
      a.rel = contact.external ? 'noopener noreferrer' : '';
      if (contact.external) a.target = '_blank';

      var iconSpan = document.createElement('span');
      iconSpan.className = 'contact-page__icon';
      iconSpan.innerHTML = contact.icon;
      iconSpan.setAttribute('aria-hidden', 'true');

      var textSpan = document.createElement('span');
      textSpan.textContent = labels[currentLang]?.[contact.name.toLowerCase()] || contact.name;

      a.appendChild(iconSpan);
      a.appendChild(textSpan);
      container.appendChild(a);
    });
  }

  // Escuchar cambio de idioma
  document.addEventListener('langchange', function (e) {
    currentLang = e.detail.lang;
    render();
  });

  // Renderizado inicial
  render();
})();