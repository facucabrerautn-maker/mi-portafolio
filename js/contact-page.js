/* Contact page: renderiza los enlaces de contacto en la página contacto.html */
(function () {
  'use strict';

  var container = document.querySelector('.contact-page__links');
  if (!container) return;

  // Datos de contacto - edita aquí tus enlaces reales
  var contacts = [
    {
      key: 'github',
      href: 'https://github.com/tu-usuario',  // Cambia por tu usuario
      icon: 'github',
      external: true
    },
    {
      key: 'email',
      href: 'mailto:tu-email@ejemplo.com',  // Cambia por tu email
      icon: 'gmail',
      external: false
    },
    {
      key: 'whatsapp',
      href: 'https://wa.me/54911XXXXXXXX',  // Cambia por tu número (formato internacional sin + ni espacios)
      icon: 'whatsapp',
      external: true
    }
  ];

  var currentLang = document.documentElement.lang || 'es';

  function getLabel(key, lang) {
    return window.I18n.translate('contact.' + key, lang);
  }

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
      iconSpan.innerHTML = window.Icons.svg(contact.icon);
      iconSpan.setAttribute('aria-hidden', 'true');

      var textSpan = document.createElement('span');
      textSpan.className = 'contact-page__text';
      textSpan.setAttribute('data-i18n', 'contact.' + contact.key);
      textSpan.textContent = getLabel(contact.key, currentLang);

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