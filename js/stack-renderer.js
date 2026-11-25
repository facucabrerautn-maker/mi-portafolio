/* ==========================================================================
   Stack Renderer: Renderiza la sección Stack con diseño Bent Grid
   Funciona en stack.html (stack-page__categories)
   ========================================================================== */
(function () {
  'use strict';

  var container = document.querySelector('.stack-page__categories');
  if (!container) return;

  var data = window.STACK_DATA || {};
  var icons = window.STACK_ICONS || {};

  // Mapeo de claves de categoría a claves de i18n
  var categoryI18nMap = {
    'Frontend': 'stack.frontend',
    'Backend y Base de datos': 'stack.backend',
    'Herramientas': 'stack.tools'
  };

  function getTranslation(key) {
    if (window.I18n && window.I18n.translate) {
      var lang = window.I18n.getLang();
      return window.I18n.translate(key, lang);
    }
    // Fallback a español si i18n no está listo
    var fallback = {
      'stack.intro': 'Estas son las tecnologías con las que diseño, desarrollo y despliego mis proyectos',
      'stack.frontend': 'Frontend',
      'stack.backend': 'Backend y Base de datos',
      'stack.tools': 'Herramientas'
    };
    return fallback[key] || key;
  }

  function render() {
    // Texto introductorio compacto con i18n
    var intro = document.createElement('p');
    intro.className = 'stack-page__intro';
    intro.setAttribute('data-i18n', 'stack.intro');
    intro.textContent = getTranslation('stack.intro');
    container.appendChild(intro);

    // Grid contenedor para las tarjetas (bent grid)
    var grid = document.createElement('div');
    grid.className = 'stack-page__grid';

    Object.entries(data).forEach(function (_ref) {
      var categoryTitle = _ref[0];
      var items = _ref[1];

      var card = document.createElement('div');
      card.className = 'stack-page__card';

      var title = document.createElement('h3');
      title.className = 'stack-page__card-title';
      var i18nKey = categoryI18nMap[categoryTitle] || 'stack.frontend';
      title.setAttribute('data-i18n', i18nKey);
      title.textContent = getTranslation(i18nKey);
      card.appendChild(title);

      var itemsContainer = document.createElement('div');
      itemsContainer.className = 'stack-page__card-items';

      items.forEach(function (item) {
        var badge = document.createElement('span');
        badge.className = 'stack-page__badge';

        var iconHtml = icons[item.icon] || '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
        badge.innerHTML = '<span class="stack-page__badge-icon">' + iconHtml + '</span><span class="stack-page__badge-text">' + item.name + '</span>';

        itemsContainer.appendChild(badge);
      });

      card.appendChild(itemsContainer);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // Renderizar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();