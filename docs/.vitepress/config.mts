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
    deliverables: 'Entregables',
    overview: 'Visión general',
    deliverablesOverview: 'Resumen',
    gettingStarted: 'Primeros pasos',
    architecture: 'Arquitectura',
    frontendArchitecture: 'Arquitectura del frontend',
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
    developmentGuide: 'Guía de desarrollo',
    deploymentInstructions: 'Instrucciones de despliegue',
    visualIdentityManual: 'Manual de identidad visual',
    brandGuide: 'Guía de marca',
    designSystem: 'Sistema de diseño',
    productStrategyAdoption: 'Estrategia, negocio, propuesta de valor y adopción',
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
    deliverables: 'Deliverables',
    overview: 'Overview',
    deliverablesOverview: 'Overview',
    gettingStarted: 'Getting started',
    architecture: 'Architecture',
    frontendArchitecture: 'Frontend architecture',
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
    developmentGuide: 'Development guide',
    deploymentInstructions: 'Deployment instructions',
    visualIdentityManual: 'Visual identity manual',
    brandGuide: 'Brand guide',
    designSystem: 'Design system',
    productStrategyAdoption: 'Product strategy and adoption',
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
    deliverables: 'Livrables',
    overview: 'Vue générale',
    deliverablesOverview: 'Vue générale',
    gettingStarted: 'Premiers pas',
    architecture: 'Architecture',
    frontendArchitecture: 'Architecture frontend',
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
    developmentGuide: 'Guide de développement',
    deploymentInstructions: 'Instructions de déploiement',
    visualIdentityManual: 'Manuel d identité visuelle',
    brandGuide: 'Guide de marque',
    designSystem: 'Système de design',
    productStrategyAdoption: 'Stratégie produit et adoption',
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
    deliverables: 'Entregáveis',
    overview: 'Visão geral',
    deliverablesOverview: 'Resumo',
    gettingStarted: 'Primeiros passos',
    architecture: 'Arquitetura',
    frontendArchitecture: 'Arquitetura do frontend',
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
    developmentGuide: 'Guia de desenvolvimento',
    deploymentInstructions: 'Instruções de implantação',
    visualIdentityManual: 'Manual de identidade visual',
    brandGuide: 'Guia de marca',
    designSystem: 'Sistema de design',
    productStrategyAdoption: 'Estratégia de produto e adoção',
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
    deliverables: 'Lieferobjekte',
    overview: 'Übersicht',
    deliverablesOverview: 'Übersicht',
    gettingStarted: 'Erste Schritte',
    architecture: 'Architektur',
    frontendArchitecture: 'Frontend-Architektur',
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
    developmentGuide: 'Entwicklungsleitfaden',
    deploymentInstructions: 'Deployment-Anleitung',
    visualIdentityManual: 'Manual zur visuellen Identität',
    brandGuide: 'Markenleitfaden',
    designSystem: 'Designsystem',
    productStrategyAdoption: 'Produktstrategie und Adoption',
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

  if (locale === 'es') {
    items.push({ text: label.deliverables, link: '/entregables/' });
  }

  if (locale === 'en') {
    items.push(
      { text: 'Reference', link: '/en/reference/frontend-inventory' },
      { text: label.deliverables, link: '/en/deliverables/' },
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
        text: label.deliverables,
        collapsed: true,
        items: [
          { text: label.deliverablesOverview, link: '/en/deliverables/' },
          { text: label.frontendArchitecture, link: '/en/deliverables/frontend-architecture' },
          { text: label.developmentGuide, link: '/en/deliverables/development-guide' },
          { text: label.deploymentInstructions, link: '/en/deliverables/deployment-instructions' },
          { text: label.visualIdentityManual, link: '/en/deliverables/visual-identity-manual' },
          { text: label.brandGuide, link: '/en/deliverables/brand-guide' },
          { text: label.designSystem, link: '/en/deliverables/design-system' },
          {
            text: label.productStrategyAdoption,
            link: '/en/deliverables/product-strategy-business-adoption',
          },
        ],
      },
    );
  }

  if (locale === 'es') {
    groups.push({
      text: label.deliverables,
      collapsed: false,
      items: [
        { text: label.deliverablesOverview, link: '/entregables/' },
        { text: label.frontendArchitecture, link: '/entregables/arquitectura-frontend' },
        { text: label.developmentGuide, link: '/entregables/guia-desarrollo' },
        { text: label.deploymentInstructions, link: '/entregables/instrucciones-despliegue' },
        { text: label.visualIdentityManual, link: '/entregables/manual-identidad-visual' },
        { text: label.brandGuide, link: '/entregables/guia-marca' },
        { text: label.designSystem, link: '/entregables/sistema-diseno' },
        { text: label.productStrategyAdoption, link: '/entregables/estrategia-negocio-adopcion' },
      ],
    });
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
