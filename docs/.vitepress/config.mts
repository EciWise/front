import { defineConfig } from 'vitepress';

const pageGroups = [
  {
    key: 'guide',
    items: [
      ['overview', 'overview'],
      ['gettingStarted', 'getting-started'],
      ['architecture', 'architecture'],
      ['projectStructure', 'project-structure'],
      ['routingAndRoles', 'routing-and-roles'],
      ['configuration', 'configuration'],
    ],
  },
  {
    key: 'features',
    items: [
      ['auth', 'auth'],
      ['student', 'student'],
      ['tutorias', 'tutorias'],
      ['tutor', 'tutor'],
      ['admin', 'admin'],
      ['learning', 'learning'],
      ['chatAndAi', 'chat-and-ai'],
    ],
  },
  {
    key: 'development',
    items: [
      ['conventions', 'conventions'],
      ['uiSystem', 'ui-system'],
      ['i18n', 'i18n'],
      ['backendIntegration', 'backend-integration'],
      ['testing', 'testing'],
      ['release', 'release'],
    ],
  },
] as const;

const labels = {
  es: {
    guide: 'Guía',
    features: 'Funcionalidades',
    development: 'Desarrollo',
    overview: 'Visión general',
    gettingStarted: 'Primeros pasos',
    architecture: 'Arquitectura',
    projectStructure: 'Estructura del proyecto',
    routingAndRoles: 'Rutas y roles',
    configuration: 'Configuración',
    auth: 'Autenticación',
    student: 'Estudiante',
    tutorias: 'Tutorías',
    tutor: 'Tutor',
    admin: 'Administración',
    learning: 'Aprendizaje',
    chatAndAi: 'Chat e IA',
    conventions: 'Convenciones',
    uiSystem: 'Sistema UI',
    i18n: 'Internacionalización',
    backendIntegration: 'Integración backend',
    testing: 'Pruebas',
    release: 'Build y despliegue',
    outline: 'En esta página',
    prev: 'Anterior',
    next: 'Siguiente',
    lastUpdated: 'Última actualización',
    theme: 'Tema',
    light: 'Cambiar a tema claro',
    dark: 'Cambiar a tema oscuro',
    menu: 'Menú',
    top: 'Volver arriba',
    footer: 'Documentación técnica interna del frontend ECIWISE+.',
    search: 'Buscar',
    noResults: 'Sin resultados',
    reset: 'Restablecer búsqueda',
    select: 'Seleccionar',
    navigate: 'Navegar',
    close: 'Cerrar',
  },
  en: {
    guide: 'Guide',
    features: 'Features',
    development: 'Development',
    overview: 'Overview',
    gettingStarted: 'Getting started',
    architecture: 'Architecture',
    projectStructure: 'Project structure',
    routingAndRoles: 'Routes and roles',
    configuration: 'Configuration',
    auth: 'Authentication',
    student: 'Student',
    tutorias: 'Tutorships',
    tutor: 'Tutor',
    admin: 'Administration',
    learning: 'Learning',
    chatAndAi: 'Chat and AI',
    conventions: 'Conventions',
    uiSystem: 'UI system',
    i18n: 'Internationalization',
    backendIntegration: 'Backend integration',
    testing: 'Testing',
    release: 'Build and release',
    outline: 'On this page',
    prev: 'Previous',
    next: 'Next',
    lastUpdated: 'Last updated',
    theme: 'Theme',
    light: 'Switch to light theme',
    dark: 'Switch to dark theme',
    menu: 'Menu',
    top: 'Back to top',
    footer: 'Internal technical documentation for the ECIWISE+ frontend.',
    search: 'Search',
    noResults: 'No results',
    reset: 'Reset search',
    select: 'Select',
    navigate: 'Navigate',
    close: 'Close',
  },
  fr: {
    guide: 'Guide',
    features: 'Fonctionnalités',
    development: 'Développement',
    overview: 'Vue générale',
    gettingStarted: 'Premiers pas',
    architecture: 'Architecture',
    projectStructure: 'Structure du projet',
    routingAndRoles: 'Routes et rôles',
    configuration: 'Configuration',
    auth: 'Authentification',
    student: 'Étudiant',
    tutorias: 'Tutorats',
    tutor: 'Tuteur',
    admin: 'Administration',
    learning: 'Apprentissage',
    chatAndAi: 'Chat et IA',
    conventions: 'Conventions',
    uiSystem: 'Système UI',
    i18n: 'Internationalisation',
    backendIntegration: 'Integration backend',
    testing: 'Tests',
    release: 'Build et livraison',
    outline: 'Sur cette page',
    prev: 'Précédent',
    next: 'Suivant',
    lastUpdated: 'Dernière mise à jour',
    theme: 'Thème',
    light: 'Passer au thème clair',
    dark: 'Passer au thème sombre',
    menu: 'Menu',
    top: 'Retour en haut',
    footer: 'Documentation technique interne du frontend ECIWISE+.',
    search: 'Rechercher',
    noResults: 'Aucun résultat',
    reset: 'Réinitialiser la recherche',
    select: 'Sélectionner',
    navigate: 'Naviguer',
    close: 'Fermer',
  },
  pt: {
    guide: 'Guia',
    features: 'Funcionalidades',
    development: 'Desenvolvimento',
    overview: 'Visão geral',
    gettingStarted: 'Primeiros passos',
    architecture: 'Arquitetura',
    projectStructure: 'Estrutura do projeto',
    routingAndRoles: 'Rotas e papéis',
    configuration: 'Configuração',
    auth: 'Autenticação',
    student: 'Estudante',
    tutorias: 'Tutorias',
    tutor: 'Tutor',
    admin: 'Administração',
    learning: 'Aprendizagem',
    chatAndAi: 'Chat e IA',
    conventions: 'Convenções',
    uiSystem: 'Sistema UI',
    i18n: 'Internacionalização',
    backendIntegration: 'Integração backend',
    testing: 'Testes',
    release: 'Build e entrega',
    outline: 'Nesta página',
    prev: 'Anterior',
    next: 'Próximo',
    lastUpdated: 'Última atualização',
    theme: 'Tema',
    light: 'Mudar para tema claro',
    dark: 'Mudar para tema escuro',
    menu: 'Menu',
    top: 'Voltar ao topo',
    footer: 'Documentação técnica interna do frontend ECIWISE+.',
    search: 'Pesquisar',
    noResults: 'Sem resultados',
    reset: 'Redefinir pesquisa',
    select: 'Selecionar',
    navigate: 'Navegar',
    close: 'Fechar',
  },
  de: {
    guide: 'Leitfaden',
    features: 'Funktionen',
    development: 'Entwicklung',
    overview: 'Übersicht',
    gettingStarted: 'Erste Schritte',
    architecture: 'Architektur',
    projectStructure: 'Projektstruktur',
    routingAndRoles: 'Routen und Rollen',
    configuration: 'Konfiguration',
    auth: 'Authentifizierung',
    student: 'Studierende',
    tutorias: 'Tutorien',
    tutor: 'Tutor',
    admin: 'Administration',
    learning: 'Lernen',
    chatAndAi: 'Chat und KI',
    conventions: 'Konventionen',
    uiSystem: 'UI-System',
    i18n: 'Internationalisierung',
    backendIntegration: 'Backend-Integration',
    testing: 'Tests',
    release: 'Build und Release',
    outline: 'Auf dieser Seite',
    prev: 'Zurück',
    next: 'Weiter',
    lastUpdated: 'Zuletzt aktualisiert',
    theme: 'Theme',
    light: 'Zum hellen Theme wechseln',
    dark: 'Zum dunklen Theme wechseln',
    menu: 'Menü',
    top: 'Nach oben',
    footer: 'Interne technische Dokumentation des ECIWISE+ Frontends.',
    search: 'Suchen',
    noResults: 'Keine Ergebnisse',
    reset: 'Suche zurücksetzen',
    select: 'Auswählen',
    navigate: 'Navigieren',
    close: 'Schließen',
  },
} as const;

type LocaleKey = keyof typeof labels;

const localePrefixes: Record<LocaleKey, string> = {
  es: '',
  en: '/en',
  fr: '/fr',
  pt: '/pt',
  de: '/de',
};

function pathFor(locale: LocaleKey, section: string, slug: string): string {
  return `${localePrefixes[locale]}/${section}/${slug}`.replace('//', '/');
}

function nav(locale: LocaleKey) {
  const label = labels[locale];
  const items = [
    { text: label.guide, link: pathFor(locale, 'guide', 'overview') },
    { text: label.features, link: pathFor(locale, 'features', 'auth') },
    { text: label.development, link: pathFor(locale, 'development', 'conventions') },
  ];

  if (locale === 'en') {
    items.push(
      { text: 'Reference', link: '/en/reference/frontend-inventory' },
      { text: 'Deliverables', link: '/en/deliverables/' },
    );
  }

  return items;
}

function sidebar(locale: LocaleKey) {
  const label = labels[locale];
  const groups = pageGroups.map((group) => ({
    text: label[group.key],
    collapsed: false,
    items: group.items.map(([key, slug]) => ({
      text: label[key],
      link: pathFor(locale, group.key, slug),
    })),
  }));

  if (locale === 'en') {
    groups[1].items.push({
      text: 'Public pages and help',
      link: '/en/features/public-and-help',
    });
    groups.push(
      {
        text: 'Reference',
        collapsed: false,
        items: [
          { text: 'Frontend inventory', link: '/en/reference/frontend-inventory' },
          { text: 'Core services', link: '/en/reference/core-services' },
          { text: 'Shared UI and layout', link: '/en/reference/shared-ui-and-layout' },
          { text: 'Feature services and endpoints', link: '/en/reference/feature-services-and-endpoints' },
          { text: 'Runtime and deployment', link: '/en/reference/runtime-deployment' },
        ],
      },
      {
        text: 'Deliverables',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/en/deliverables/' },
          { text: 'Frontend architecture', link: '/en/deliverables/frontend-architecture' },
          { text: 'Development guide', link: '/en/deliverables/development-guide' },
          { text: 'Deployment instructions', link: '/en/deliverables/deployment-instructions' },
          { text: 'Visual identity manual', link: '/en/deliverables/visual-identity-manual' },
          { text: 'Brand guide', link: '/en/deliverables/brand-guide' },
          { text: 'Design system', link: '/en/deliverables/design-system' },
          {
            text: 'Product strategy and adoption',
            link: '/en/deliverables/product-strategy-business-adoption',
          },
        ],
      },
    );
  }

  return groups;
}

function searchTranslations(locale: LocaleKey) {
  const label = labels[locale];
  return {
    button: {
      buttonText: label.search,
      buttonAriaLabel: label.search,
    },
    modal: {
      noResultsText: label.noResults,
      resetButtonTitle: label.reset,
      footer: {
        selectText: label.select,
        navigateText: label.navigate,
        closeText: label.close,
      },
    },
  };
}

function themeConfig(locale: LocaleKey) {
  const label = labels[locale];
  return {
    siteTitle: 'ECIWISE+ Front',
    nav: nav(locale),
    sidebar: sidebar(locale),
    outline: {
      level: [2, 3],
      label: label.outline,
    },
    docFooter: {
      prev: label.prev,
      next: label.next,
    },
    lastUpdated: {
      text: label.lastUpdated,
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
    darkModeSwitchLabel: label.theme,
    lightModeSwitchTitle: label.light,
    darkModeSwitchTitle: label.dark,
    sidebarMenuLabel: label.menu,
    returnToTopLabel: label.top,
    footer: {
      message: label.footer,
      copyright: 'Escuela Colombiana de Ingeniería Julio Garavito',
    },
  };
}

export default defineConfig({
  title: 'ECIWISE+ Front',
  description: 'Documentación técnica del frontend institucional ECIWISE+',
  lang: 'es-CO',
  cleanUrls: true,
  lastUpdated: true,
  appearance: true,
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          root: { translations: searchTranslations('es') },
          en: { translations: searchTranslations('en') },
          fr: { translations: searchTranslations('fr') },
          pt: { translations: searchTranslations('pt') },
          de: { translations: searchTranslations('de') },
        },
      },
    },
  },
  locales: {
    root: {
      label: 'Español',
      lang: 'es-CO',
      title: 'ECIWISE+ Front',
      description: 'Documentación técnica del frontend institucional ECIWISE+',
      themeConfig: themeConfig('es'),
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'ECIWISE+ Front',
      description: 'Technical documentation for the ECIWISE+ frontend',
      themeConfig: themeConfig('en'),
    },
    fr: {
      label: 'Français',
      lang: 'fr-FR',
      link: '/fr/',
      title: 'ECIWISE+ Front',
      description: 'Documentation technique du frontend ECIWISE+',
      themeConfig: themeConfig('fr'),
    },
    pt: {
      label: 'Português',
      lang: 'pt-BR',
      link: '/pt/',
      title: 'ECIWISE+ Front',
      description: 'Documentação técnica do frontend ECIWISE+',
      themeConfig: themeConfig('pt'),
    },
    de: {
      label: 'Deutsch',
      lang: 'de-DE',
      link: '/de/',
      title: 'ECIWISE+ Front',
      description: 'Technische Dokumentation des ECIWISE+ Frontends',
      themeConfig: themeConfig('de'),
    },
  },
});
