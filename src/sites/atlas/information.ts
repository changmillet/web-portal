import type { PortalLocale } from "@/i18n/routing";

export const lifeCycleInitiativeUrl =
  "https://www.unep.org/topics/finance-and-economic-transformations/driving-transformation-science-and-knowledge/life-cycle";

type InformationPage = {
  eyebrow: string;
  title: string;
  description: string;
  sectionTitle: string;
  sections: readonly { title: string; body: string }[];
};
type AtlasInformation = {
  aboutLabel: string;
  officialAction: string;
  dataTitle: string;
  dataDescription: string;
  team: InformationPage;
  community: InformationPage;
};

/** Atlas owns institutional copy. Named TianGong rosters remain in the TianGong presentation. */
export const atlasInformation: Record<PortalLocale, AtlasInformation> = {
  en: {
    aboutLabel: "About us",
    officialAction: "Learn more about the Life Cycle Initiative",
    dataTitle: "A map to life cycle assessment data",
    dataDescription:
      "Atlas is UNEP’s platform for discovering life cycle assessment data from around the world. Explore datasets by process, flow, region and source, understand their context, and organize the versions relevant to your work.",
    team: {
      eyebrow: "UNEP / About us",
      title: "The Life Cycle Initiative",
      description:
        "UNEP’s Life Cycle Initiative brings together public and private organizations to advance science-based life cycle approaches. It improves access to knowledge, data and methods, and supports their application in policy and decision-making.",
      sectionTitle: "Life cycle knowledge, put into practice.",
      sections: [
        {
          title: "Knowledge and methods",
          body: "Make life cycle thinking and assessment methods more accessible, so environmental decisions can consider impacts across the whole life cycle.",
        },
        {
          title: "Data and access",
          body: "Support access to life cycle data and the knowledge needed to understand its quality, scope and appropriate use.",
        },
        {
          title: "Capacity and collaboration",
          body: "Bring science, policy and practice together through shared knowledge and capacity development.",
        },
      ],
    },
    community: {
      eyebrow: "Atlas / Community",
      title: "A shared perspective on life cycle data.",
      description:
        "Life cycle assessment connects the people who produce data with those who use it. Atlas helps data providers, researchers and practitioners discover records, understand their context and share useful selections.",
      sectionTitle: "Different roles. A common need for better data.",
      sections: [
        {
          title: "Data providers",
          body: "Clear sources, versions, scope and licensing help others understand the data you produce and assess where it can be used.",
        },
        {
          title: "Researchers",
          body: "Explore the evidence behind a dataset, compare compatible process versions and keep the references used in your study.",
        },
        {
          title: "Practitioners",
          body: "Find data for the places and activities you assess. Organize selected versions in a collection and share them with colleagues.",
        },
      ],
    },
  },
  "zh-CN": {
    aboutLabel: "关于我们",
    officialAction: "了解生命周期倡议",
    dataTitle: "探索生命周期评价数据的地图",
    dataDescription:
      "Atlas 是联合国环境规划署（UNEP）面向全球的生命周期评价数据发现平台。按过程、流、地区和来源探索数据，了解数据的背景与适用范围，并整理工作所需的具体版本。",
    team: {
      eyebrow: "UNEP / 关于我们",
      title: "生命周期倡议",
      description:
        "联合国环境规划署（UNEP）的生命周期倡议汇聚公共和私营机构，推动基于科学的生命周期方法。倡议致力于改善知识、数据和方法的获取，并支持其在政策与决策中的应用。",
      sectionTitle: "让生命周期知识走向实践。",
      sections: [
        {
          title: "知识与方法",
          body: "促进生命周期思维与评价方法的普及，让环境决策能够考虑整个生命周期的影响。",
        },
        {
          title: "数据与获取",
          body: "支持生命周期数据的获取，帮助使用者理解数据质量、适用范围和使用条件。",
        },
        { title: "能力与合作", body: "通过知识共享与能力建设，连接科学研究、政策制定和实践应用。" },
      ],
    },
    community: {
      eyebrow: "Atlas / 社区",
      title: "用生命周期数据，连接共同的视野。",
      description:
        "生命周期评价连接数据生产者与使用者。Atlas 帮助数据提供方、研究人员和实践者发现数据、理解背景，并分享与工作相关的数据清单。",
      sectionTitle: "不同的角色，共同的数据需求。",
      sections: [
        {
          title: "数据提供方",
          body: "清晰的来源、版本、适用范围和许可说明，有助于他人理解您生产的数据，判断其使用场景。",
        },
        {
          title: "研究人员",
          body: "查阅数据背后的依据，比较兼容的过程版本，保留研究使用的数据引用。",
        },
        {
          title: "实践者",
          body: "查找与评价地区和活动相符的数据，将选定版本整理成清单，与同事分享。",
        },
      ],
    },
  },
  de: {
    aboutLabel: "Über uns",
    officialAction: "Mehr über die Life Cycle Initiative",
    dataTitle: "Ihre Karte zu Ökobilanzdaten",
    dataDescription:
      "Atlas ist die UNEP-Plattform zur Erkundung von Ökobilanzdaten aus aller Welt. Entdecken Sie Datensätze nach Prozess, Fluss, Region und Quelle, prüfen Sie ihren Kontext und sammeln Sie die für Ihre Arbeit relevanten Versionen.",
    team: {
      eyebrow: "UNEP / Über uns",
      title: "The Life Cycle Initiative",
      description:
        "Die Life Cycle Initiative von UNEP bringt öffentliche und private Organisationen zusammen, um wissenschaftlich fundierte Lebenszyklusansätze voranzubringen. Sie verbessert den Zugang zu Wissen, Daten und Methoden und unterstützt deren Anwendung in Politik und Entscheidungsfindung.",
      sectionTitle: "Lebenszykluswissen in der Praxis.",
      sections: [
        {
          title: "Wissen und Methoden",
          body: "Lebenszyklusdenken und Bewertungsmethoden zugänglicher machen, damit Umweltentscheidungen Auswirkungen über den gesamten Lebenszyklus berücksichtigen können.",
        },
        {
          title: "Daten und Zugang",
          body: "Den Zugang zu Ökobilanzdaten und dem Wissen fördern, das für das Verständnis ihrer Qualität, ihres Geltungsbereichs und ihrer Nutzung erforderlich ist.",
        },
        {
          title: "Kompetenz und Zusammenarbeit",
          body: "Wissenschaft, Politik und Praxis durch Wissensaustausch und Kompetenzentwicklung verbinden.",
        },
      ],
    },
    community: {
      eyebrow: "Atlas / Community",
      title: "Eine gemeinsame Perspektive auf Ökobilanzdaten.",
      description:
        "Ökobilanzen verbinden Menschen, die Daten erstellen, mit denen, die sie nutzen. Atlas hilft Datenanbietern, Forschenden und Fachleuten, Datensätze zu entdecken, ihren Kontext zu verstehen und passende Sammlungen zu teilen.",
      sectionTitle: "Verschiedene Rollen. Ein gemeinsamer Datenbedarf.",
      sections: [
        {
          title: "Datenanbieter",
          body: "Klare Angaben zu Quellen, Versionen, Geltungsbereich und Lizenzen helfen anderen, Ihre Daten zu verstehen und ihre Eignung einzuschätzen.",
        },
        {
          title: "Forschende",
          body: "Prüfen Sie die Belege eines Datensatzes, vergleichen Sie kompatible Prozessversionen und bewahren Sie die Referenzen Ihrer Studie auf.",
        },
        {
          title: "Fachleute in der Praxis",
          body: "Finden Sie Daten für die untersuchten Orte und Aktivitäten. Stellen Sie Versionen in einer Sammlung zusammen und teilen Sie diese mit anderen.",
        },
      ],
    },
  },
  fr: {
    aboutLabel: "À propos",
    officialAction: "Découvrir la Life Cycle Initiative",
    dataTitle: "Votre carte des données d’ACV",
    dataDescription:
      "Atlas est la plateforme du PNUE pour découvrir les données d’analyse du cycle de vie du monde entier. Explorez les jeux de données par processus, flux, région et source, examinez leur contexte et rassemblez les versions utiles à votre travail.",
    team: {
      eyebrow: "PNUE / À propos",
      title: "The Life Cycle Initiative",
      description:
        "La Life Cycle Initiative du PNUE réunit des organismes publics et privés pour faire progresser les approches du cycle de vie fondées sur la science. Elle améliore l’accès aux connaissances, aux données et aux méthodes, et soutient leur application aux politiques et aux décisions.",
      sectionTitle: "Les connaissances du cycle de vie en pratique.",
      sections: [
        {
          title: "Connaissances et méthodes",
          body: "Rendre la pensée cycle de vie et les méthodes d’évaluation plus accessibles pour considérer les impacts sur l’ensemble du cycle de vie dans les décisions environnementales.",
        },
        {
          title: "Données et accès",
          body: "Faciliter l’accès aux données et aux connaissances nécessaires pour comprendre leur qualité, leur périmètre et leurs conditions d’utilisation.",
        },
        {
          title: "Compétences et coopération",
          body: "Relier science, politiques et pratique grâce au partage des connaissances et au développement des compétences.",
        },
      ],
    },
    community: {
      eyebrow: "Atlas / Communauté",
      title: "Un regard partagé sur les données du cycle de vie.",
      description:
        "L’ACV relie les personnes qui produisent les données à celles qui les utilisent. Atlas aide les fournisseurs, les chercheurs et les praticiens à découvrir les données, à comprendre leur contexte et à partager des collections utiles.",
      sectionTitle: "Des rôles différents. Un besoin commun de données.",
      sections: [
        {
          title: "Fournisseurs de données",
          body: "Des sources, versions, périmètres et licences explicites aident les autres à comprendre vos données et à en évaluer les usages possibles.",
        },
        {
          title: "Chercheurs",
          body: "Examinez les éléments probants, comparez des versions de processus compatibles et conservez les références utilisées dans votre étude.",
        },
        {
          title: "Praticiens",
          body: "Trouvez les données des lieux et activités évalués. Rassemblez les versions choisies dans une collection et partagez-la avec vos collègues.",
        },
      ],
    },
  },
};
