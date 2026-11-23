/* Contact dialog: abre/cierra el modal nativo <dialog> */
(function () {
  'use strict';

  var btn = document.querySelector('.contact-btn');
  var dialog = document.getElementById('contact-dialog');
  var closeBtn = dialog?.querySelector('.contact-dialog__close');
  var backdrop = dialog?.querySelector('.contact-dialog__backdrop');
  var lastFocused = null;

  if (!btn || !dialog) return;

  function openDialog() {
    lastFocused = document.activeElement;
    dialog.showModal();
    closeBtn?.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeDialog() {
    dialog.close();
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  btn.addEventListener('click', openDialog);
  closeBtn?.addEventListener('click', closeDialog);
  backdrop?.addEventListener('click', closeDialog);

  // Cerrar con Escape (nativo en <dialog>, pero nos aseguramos)
  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDialog();
  });

  // Cerrar al click en un enlace (opcional, para UX)
  dialog.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeDialog);
  });
})();