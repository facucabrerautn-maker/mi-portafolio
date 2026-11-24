/* ==========================================================================
   Stack Renderer: Renderiza la sección Stack desde STACK_DATA y STACK_ICONS
   Funciona tanto en página principal (stack__categories) como en stack.html (stack-page__categories)
   ========================================================================== */
(function () {
  'use strict';

  // Soporta ambos selectores: página principal y página dedicada
  var container = document.querySelector('.stack__categories') || document.querySelector('.stack-page__categories');
  if (!container) return;

  var data = window.STACK_DATA || {};
  var icons = window.STACK_ICONS || {};

  // Detectar qué prefijo de clase usar
  var isPage = container.classList.contains('stack-page__categories');
  var prefix = isPage ? 'stack-page' : 'stack';

  function render() {
    Object.entries(data).forEach(function (_ref) {
      var categoryTitle = _ref[0];
      var items = _ref[1];

      var section = document.createElement('div');
      section.className = prefix + '__category';

      var title = document.createElement('h3');
      title.className = prefix + '__category-title';
      title.textContent = categoryTitle;
      section.appendChild(title);

      var itemsContainer = document.createElement('div');
      itemsContainer.className = prefix + '__items';

      items.forEach(function (item) {
        var btn = document.createElement('span');
        btn.className = prefix + '__item';

        var iconHtml = icons[item.icon] || '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
        btn.innerHTML = iconHtml + '<span>' + item.name + '</span>';

        itemsContainer.appendChild(btn);
      });

      section.appendChild(itemsContainer);
      container.appendChild(section);
    });
  }

  // Renderizar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();