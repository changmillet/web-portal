import type { PortalLocale } from "@/i18n/routing";

type AtlasCopy = {
  name: string;
  descriptor: string;
  eyebrow: string;
  title: string;
  emphasis: string;
  description: string;
  explore: string;
  guide: string;
  index: string;
  indexDescription: string;
  process: string;
  processDescription: string;
  flow: string;
  flowDescription: string;
  region: string;
  regionDescription: string;
  source: string;
  sourceDescription: string;
  principle: string;
  principleTitle: string;
  principleDescription: string;
  read: string;
  compare: string;
  collect: string;
  readDescription: string;
  compareDescription: string;
  collectDescription: string;
  footer: string;
  dataCredit: string;
  unavailable: string;
  metadataTitle: string;
};
export const atlasCopy: Record<PortalLocale, AtlasCopy> = {
  en: {
    name: "Atlas",
    descriptor: "Life cycle data",
    eyebrow: "A field guide to environmental data",
    title: "A world of data.",
    emphasis: "A clearer perspective.",
    description:
      "Explore the materials, processes and flows behind our world. Trace their sources. Understand their context. Find the evidence for your next assessment.",
    explore: "Explore the catalog",
    guide: "How to read the data",
    index: "Find your starting point.",
    indexDescription: "One public catalog. Four ways to explore it.",
    process: "Processes",
    processDescription: "How products are made, used and recovered.",
    flow: "Flows",
    flowDescription: "Materials, energy and emissions moving through a system.",
    region: "Regions",
    regionDescription: "Place each dataset in its geographical context.",
    source: "Sources",
    sourceDescription: "Follow the organizations and publications behind the data.",
    principle: "Perspective matters",
    principleTitle: "Every number has a context.",
    principleDescription:
      "A useful assessment begins with understanding the evidence. Keep the scope, version and provenance of a dataset in view, from discovery to comparison.",
    read: "Read the evidence",
    compare: "Compare with care",
    collect: "Build your shortlist",
    readDescription: "Inspect sources, methods and exact versions before selecting a record.",
    compareDescription:
      "Put records side by side and examine their boundaries before drawing conclusions.",
    collectDescription:
      "Keep selected records in this browser and return to them as your research develops.",
    footer: "Life cycle data, in perspective.",
    dataCredit: "Public catalog and research resources: TianGong LCA.",
    unavailable: "Counts temporarily unavailable",
    metadataTitle: "Atlas — Life Cycle Data",
  },
  "zh-CN": {
    name: "Atlas",
    descriptor: "生命周期数据",
    eyebrow: "环境数据的探索指南",
    title: "看见数据的世界。",
    emphasis: "找到清晰的视角。",
    description: "探索世界背后的材料、过程与流。追溯来源，理解语境，为下一次生命周期评价找到依据。",
    explore: "探索数据目录",
    guide: "了解如何使用数据",
    index: "从这里，开始探索。",
    indexDescription: "同一个公开目录，四种探索路径。",
    process: "过程",
    processDescription: "理解产品如何生产、使用与回收。",
    flow: "流",
    flowDescription: "追踪系统中的材料、能源与排放。",
    region: "地区",
    regionDescription: "在地理背景中理解每一份数据。",
    source: "来源",
    sourceDescription: "查阅数据背后的机构与出版来源。",
    principle: "让语境与数据同行",
    principleTitle: "每个数字，都有它的背景。",
    principleDescription:
      "可靠的评价始于对证据的理解。从发现到比较，始终保留数据集的适用范围、版本与来源。",
    read: "阅读证据",
    compare: "审慎比较",
    collect: "建立候选清单",
    readDescription: "选择记录前，查阅来源、方法与精确版本。",
    compareDescription: "并列查看记录，先核对边界，再作判断。",
    collectDescription: "将选中的记录保存在当前浏览器，随研究进展继续整理。",
    footer: "让生命周期数据，带来更清晰的视角。",
    dataCredit: "公开目录与研究资源来自天工 LCA。",
    unavailable: "计数暂时不可用",
    metadataTitle: "Atlas — 生命周期数据",
  },
  de: {
    name: "Atlas",
    descriptor: "Lebenszyklusdaten",
    eyebrow: "Ein Wegweiser zu Umweltdaten",
    title: "Eine Welt voller Daten.",
    emphasis: "Ein klarerer Blick.",
    description:
      "Entdecken Sie Materialien, Prozesse und Flüsse. Verfolgen Sie ihre Quellen, verstehen Sie ihren Kontext und finden Sie Grundlagen für Ihre nächste Ökobilanz.",
    explore: "Katalog erkunden",
    guide: "Daten richtig lesen",
    index: "Finden Sie Ihren Ausgangspunkt.",
    indexDescription: "Ein öffentlicher Katalog. Vier Wege zur Erkundung.",
    process: "Prozesse",
    processDescription: "Wie Produkte hergestellt, genutzt und verwertet werden.",
    flow: "Flüsse",
    flowDescription: "Materialien, Energie und Emissionen innerhalb eines Systems.",
    region: "Regionen",
    regionDescription: "Jeden Datensatz geografisch einordnen.",
    source: "Quellen",
    sourceDescription: "Organisationen und Veröffentlichungen hinter den Daten finden.",
    principle: "Der Kontext zählt",
    principleTitle: "Jede Zahl hat einen Hintergrund.",
    principleDescription:
      "Eine fundierte Bewertung beginnt mit dem Verständnis der Nachweise. Behalten Sie Geltungsbereich, Version und Herkunft im Blick – von der Suche bis zum Vergleich.",
    read: "Nachweise lesen",
    compare: "Sorgfältig vergleichen",
    collect: "Auswahlliste erstellen",
    readDescription: "Prüfen Sie Quellen, Methoden und genaue Versionen vor der Auswahl.",
    compareDescription:
      "Stellen Sie Datensätze gegenüber und prüfen Sie ihre Grenzen vor Schlussfolgerungen.",
    collectDescription:
      "Speichern Sie ausgewählte Datensätze in diesem Browser für Ihre weitere Recherche.",
    footer: "Lebenszyklusdaten im Kontext.",
    dataCredit: "Öffentlicher Katalog und Forschungsressourcen: TianGong LCA.",
    unavailable: "Anzahlen vorübergehend nicht verfügbar",
    metadataTitle: "Atlas — Lebenszyklusdaten",
  },
  fr: {
    name: "Atlas",
    descriptor: "Données de cycle de vie",
    eyebrow: "Un guide pour explorer les données environnementales",
    title: "Un monde de données.",
    emphasis: "Une perspective plus claire.",
    description:
      "Explorez les matériaux, les procédés et les flux. Retrouvez leurs sources, comprenez leur contexte et trouvez les éléments de votre prochaine analyse du cycle de vie.",
    explore: "Explorer le catalogue",
    guide: "Comprendre les données",
    index: "Trouvez votre point de départ.",
    indexDescription: "Un catalogue public. Quatre chemins pour l’explorer.",
    process: "Procédés",
    processDescription: "Comment les produits sont fabriqués, utilisés et valorisés.",
    flow: "Flux",
    flowDescription: "Les matières, l’énergie et les émissions au sein d’un système.",
    region: "Régions",
    regionDescription: "Replacer chaque jeu de données dans son contexte géographique.",
    source: "Sources",
    sourceDescription: "Retrouver les organismes et les publications à l’origine des données.",
    principle: "Le contexte compte",
    principleTitle: "Chaque chiffre a son contexte.",
    principleDescription:
      "Une analyse solide commence par la compréhension des éléments disponibles. Gardez en vue le périmètre, la version et la provenance, de la découverte à la comparaison.",
    read: "Examiner les sources",
    compare: "Comparer avec discernement",
    collect: "Créer votre sélection",
    readDescription: "Vérifiez les sources, les méthodes et les versions exactes avant de choisir.",
    compareDescription: "Examinez les limites des jeux de données avant de tirer des conclusions.",
    collectDescription:
      "Conservez les jeux de données sélectionnés dans ce navigateur pour poursuivre vos recherches.",
    footer: "Les données de cycle de vie, en perspective.",
    dataCredit: "Catalogue public et ressources de recherche : TianGong LCA.",
    unavailable: "Comptages temporairement indisponibles",
    metadataTitle: "Atlas — Données de cycle de vie",
  },
};
