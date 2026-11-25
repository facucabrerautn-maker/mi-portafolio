# Portafolio — Facundo Cabrera

Sitio estático (HTML, CSS y JS sin dependencias). Se abre con cualquier servidor estático, por ejemplo `python3 -m http.server`.

## Estructura

| Archivo | Qué hace |
|---|---|
| `index.html`, `sobre-mi.html`, `stack.html`, `contacto.html` | Páginas. Cada una declara `<html data-page="home\|about\|stack\|contact">`. |
| `js/layout.js` | Define `<site-loader>`, `<site-header>` y `<site-footer>`: se editan una sola vez para todas las páginas. La intro se muestra una vez por sesión (y al recargar). |
| `js/i18n.js` | Textos ES/EN, títulos y descripciones por página, etiquetas ARIA. Se carga antes que el resto. |
| `js/site-header.js` | Tema claro/oscuro, sonido, idioma, cabecera con fondo al hacer scroll. |
| `js/sky.js` | Cielo: estrellas (oscuro) y nubes (claro) en un solo canvas. |
| `js/loader.js` + `assets/logo-paths.js` | Intro con el logo dibujándose y logo de la cabecera. |
| `js/projects-data.js`, `js/projects-reel.js` | Carrete 3D (WebGL) de proyectos; los proyectos se editan en `projects-data.js`. |
| `js/stack-data.js`, `js/stack-renderer.js`, `js/contact-page.js` | Contenido de Stack y Contacto. |

## Pendiente de completar
- Enlaces reales en `js/contact-page.js` (GitHub, email, WhatsApp) y el CV.
- `og:image` en los `<head>` apunta a `https://facucabrerautn-maker.github.io/mi-portafolio/assets/og-image.jpg`: ajustarlo si el dominio es otro y agregar `canonical`, `sitemap.xml` y `robots.txt` con la URL definitiva.
