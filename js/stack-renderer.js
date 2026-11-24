/* ==========================================================================
   Stack Renderer: Renderiza la sección Stack desde STACK_DATA y STACK_ICONS
   ========================================================================== */
(function () {
  'use strict';

  var container = document.querySelector('.stack__categories');
  if (!container) return;

  var data = window.STACK_DATA || {};
  var icons = window.STACK_ICONS || {};

  function render() {
    Object.entries(data).forEach(function (_ref) {
      var categoryTitle = _ref[0];
      var items = _ref[1];

      var section = document.createElement('div');
      section.className = 'stack__category';

      var title = document.createElement('h3');
      title.className = 'stack__category-title';
      title.textContent = categoryTitle;
      section.appendChild(title);

      var itemsContainer = document.createElement('div');
      itemsContainer.className = 'stack__items';

      items.forEach(function (item) {
        var btn = document.createElement('span');
        btn.className = 'stack__item';

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