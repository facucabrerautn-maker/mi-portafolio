/* ==========================================================================
   Stack Data: Tecnologías y herramientas para la sección Stack
   Editá este archivo para personalizar tus skills
   ========================================================================== */
window.STACK_DATA = {
  'Frontend': [
    { name: 'HTML5', icon: 'html' },
    { name: 'CSS3', icon: 'css' },
    { name: 'JavaScript', icon: 'js' },
    { name: 'TypeScript', icon: 'ts' },
    { name: 'React', icon: 'react' },
    { name: 'Vue.js', icon: 'vue' }
  ],
  'Backend': [
    { name: 'Node.js', icon: 'node' },
    { name: 'Python', icon: 'python' },
    { name: 'Express', icon: 'express' },
    { name: 'PostgreSQL', icon: 'postgres' },
    { name: 'MongoDB', icon: 'mongo' }
  ],
  'Herramientas': [
    { name: 'Git', icon: 'git' },
    { name: 'GitHub', icon: 'github' },
    { name: 'VS Code', icon: 'vscode' },
    { name: 'Docker', icon: 'docker' },
    { name: 'Linux', icon: 'linux' }
  ],
  'Otros': [
    { name: 'REST APIs', icon: 'api' },
    { name: 'GraphQL', icon: 'graphql' },
    { name: 'Testing', icon: 'test' },
    { name: 'CI/CD', icon: 'cicd' }
  ]
};

/* ==========================================================================
   SVG Icons para las tecnologías (inline, sin dependencias externas)
   Iconos basados en brand logos simplificados
   ========================================================================== */
window.STACK_ICONS = {
  html: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.2 5.2l-9-5.3a1 1 0 0 0-1 0L2.8 5.2a1 1 0 0 0-.5.9v13.7a1 1 0 0 0 .5.9l9 5.3a1 1 0 0 0 1 0l9-5.3a1 1 0 0 0 .5-.9V6.1a1 1 0 0 0-.5-.9zM12 10.5v7M9 14h6M9 17h6M7.5 10h9M12 3.2l8 4.7v10.6l-8 4.7-8-4.7V7.9l8-4.7z"/></svg>',
  css: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.2 5.2l-9-5.3a1 1 0 0 0-1 0L2.8 5.2a1 1 0 0 0-.5.9v13.7a1 1 0 0 0 .5.9l9 5.3a1 1 0 0 0 1 0l9-5.3a1 1 0 0 0 .5-.9V6.1a1 1 0 0 0-.5-.9zM8 13h8M8 16h5M11 10h2v6h-2zM5 6h14v2H5z"/></svg>',
  js: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H6V10h6v7zm4-7H10V5h6v5z"/></svg>',
  ts: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h5v2h-3v5h3v2h-5V3zm-4 0v14h2V3h-2zm4 14h5v2h-5v-2zm-4 0v2h2v-2h-2z"/></svg>',
  react: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3-11h-2v2h-2v2h2v2h2v-2h2v-2h-2v-2z"/></svg>',
  vue: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 6.7l-1.4-1.4C17.7 4.1 16.1 3 14.2 3c-1.8 0-3.5.9-4.5 2.3L2.7 14.5c-.9 1.3-1 3-.3 4.3l4.5 4.5c1.3.9 3 .9 4.3 0l12-12c.9-1.3-.1-3-1.7-3.8zM12 10.5l-3.5 3.5v-7L12 10.5zm6 0l-3.5 3.5v-7L18 10.5z"/></svg>',
  node: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>',
  python: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.7 18.8c.3.3.6.5.9.7.5.3 1 .3 1.4 0 .5-.3.8-.8.8-1.4 0-.6-.3-1.2-.8-1.6-1.2l-2.3-2.3c-.4-.4-.6-1-.6-1.6 0-.7.3-1.2.8-1.6.4-.4 1-.6 1.6-.8.6 0 1.2.2 1.6.7l2.5 2.5c.3.4.5.9.5 1.5 0 .6-.2 1.1-.6 1.5l-2.5 2.5c-.4.4-1 .6-1.6.8zm-6.1-4.2c-.5 0-1-.3-1.4-.8-.4-.4-.6-1-.6-1.6 0-.6.2-1.2.7-1.6.4-.4 1-.7 1.6-.7.6 0 1.2.3 1.6.7l2.3 2.3c.4.4.6 1 .6 1.6 0 .6-.2 1.2-.7 1.6-.5.4-1.1.6-1.7.2l-2.4-2.4c-.3-.4-.9-.6-1.5-.6z"/></svg>',
  express: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>',
  postgres: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 4h16v2H4zm0 4h16v2H4zM4 4v2h16V4H4z"/></svg>',
  mongo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/></svg>',
  git: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
  vscode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 6.7l-1.4-1.4C17.7 4.1 16.1 3 14.2 3c-1.8 0-3.5.9-4.5 2.3L2.7 14.5c-.9 1.3-1 3-.3 4.3l4.5 4.5c1.3.9 3 .9 4.3 0l12-12c.9-1.3-.1-3-1.7-3.8zM12 10.5l-3.5 3.5v-7L12 10.5zm6 0l-3.5 3.5v-7L18 10.5z"/></svg>',
  docker: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
  linux: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
  api: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
  graphql: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
  test: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
  cicd: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>'
};