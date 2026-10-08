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
    descriptor: "The Nexus for LCA Data",
    eyebrow: "Explore data for life cycle assessment",
    title: "LCA data.",
    emphasis: "Your research starts here.",
    description:
      "Find process and flow datasets for your life cycle assessment. Explore by region or source, review their scope and keep the versions you need.",
    explore: "Explore the catalog",
    guide: "Using the data",
    index: "Choose a way to explore.",
    indexDescription: "Browse by dataset type, region or source.",
    process: "Process datasets",
    processDescription:
      "Production, energy, transport and other activities with their inputs and outputs.",
    flow: "Flow datasets",
    flowDescription: "Products, resources, emissions and waste, with their properties and units.",
    region: "Regions",
    regionDescription: "Find data for the countries and regions in your study.",
    source: "Sources",
    sourceDescription: "Browse by the data source recorded in each dataset.",
    principle: "From discovery to selection",
    principleTitle: "Find the data that fits your study.",
    principleDescription:
      "A dataset’s name is only a starting point. Review the activity, geography, period and method it describes before using it in your assessment.",
    read: "Explore datasets",
    compare: "Compare process datasets",
    collect: "Organize your shortlist",
    readDescription: "Open a dataset to review its scope, source, license and available results.",
    compareDescription:
      "Select 2–4 process versions and compare their scope and methods side by side.",
    collectDescription:
      "Save process and flow versions with your notes in this browser. Export a backup to keep them.",
    footer: "A starting point for your next life cycle assessment.",
    dataCredit: "Explore the TianGong LCA public catalog with Atlas.",
    unavailable: "Totals temporarily unavailable",
    metadataTitle: "Atlas — Life Cycle Assessment Data",
  },
  "zh-CN": {
    name: "Atlas",
    descriptor: "汇聚生命周期评价数据",
    eyebrow: "发现适用于生命周期评价的数据",
    title: "探索生命周期评价数据。",
    emphasis: "找到研究的起点。",
    description: "查找过程与流数据集，按地区和来源浏览，了解适用范围，整理研究所需的数据版本。",
    explore: "探索数据目录",
    guide: "阅读数据使用说明",
    index: "选择你的探索方式。",
    indexDescription: "按数据类型、地区或来源，找到相关数据。",
    process: "过程数据",
    processDescription: "生产、能源供应、运输等活动及其投入产出。",
    flow: "流数据",
    flowDescription: "产品、资源、排放与废物的属性和单位。",
    region: "地区",
    regionDescription: "查找研究涉及的国家和地区的数据。",
    source: "来源",
    sourceDescription: "按数据集注明的来源，浏览相关记录。",
    principle: "从查找到选用",
    principleTitle: "找到数据，也读懂它的适用范围。",
    principleDescription:
      "数据集名称只是起点。了解它描述的活动、地区、时间和方法，再判断是否适合你的研究。",
    read: "查阅数据集",
    compare: "比较过程数据",
    collect: "整理候选清单",
    readDescription: "打开数据集，查看适用范围、来源、许可和可用结果。",
    compareDescription: "选择 2–4 个过程版本，并列核对范围与方法。",
    collectDescription: "在当前浏览器保存过程与流的具体版本和备注，导出备份以便留存。",
    footer: "为下一次生命周期评价，找到数据的起点。",
    dataCredit: "通过 Atlas 探索天工 LCA 公开数据目录。",
    unavailable: "数量暂时无法获取",
    metadataTitle: "Atlas — 生命周期评价数据",
  },
  de: {
    name: "Atlas",
    descriptor: "Ökobilanzdaten an einem Ort",
    eyebrow: "Daten für Ihre Ökobilanz entdecken",
    title: "Ökobilanzdaten entdecken.",
    emphasis: "Hier beginnt Ihre Recherche.",
    description:
      "Finden Sie Prozess- und Flussdatensätze für Ihre Ökobilanz. Suchen Sie nach Region oder Quelle, prüfen Sie den Geltungsbereich und speichern Sie passende Versionen.",
    explore: "Katalog erkunden",
    guide: "Hinweise zur Datennutzung",
    index: "Wählen Sie Ihren Einstieg.",
    indexDescription: "Datensätze nach Typ, Region oder Quelle durchsuchen.",
    process: "Prozessdaten",
    processDescription:
      "Produktion, Energieversorgung, Transport und weitere Aktivitäten mit ihren Ein- und Ausgängen.",
    flow: "Flussdaten",
    flowDescription:
      "Produkte, Ressourcen, Emissionen und Abfälle mit ihren Eigenschaften und Einheiten.",
    region: "Regionen",
    regionDescription: "Daten für die Länder und Regionen Ihrer Untersuchung finden.",
    source: "Quellen",
    sourceDescription: "Datensätze nach ihrer dokumentierten Datenquelle durchsuchen.",
    principle: "Vom Finden zur Auswahl",
    principleTitle: "Passende Daten für Ihre Untersuchung finden.",
    principleDescription:
      "Der Name eines Datensatzes ist nur der Anfang. Prüfen Sie die beschriebene Aktivität, Region, Zeitspanne und Methode, bevor Sie ihn verwenden.",
    read: "Datensätze erkunden",
    compare: "Prozessdaten vergleichen",
    collect: "Auswahlliste verwalten",
    readDescription:
      "Geltungsbereich, Quelle, Lizenz und verfügbare Ergebnisse eines Datensatzes prüfen.",
    compareDescription:
      "2–4 Prozessversionen auswählen und ihre Geltungsbereiche und Methoden gegenüberstellen.",
    collectDescription:
      "Prozess- und Flussversionen mit Notizen in diesem Browser speichern und als Sicherung exportieren.",
    footer: "Der Einstieg in Ihre nächste Ökobilanz.",
    dataCredit: "Mit Atlas den öffentlichen TianGong LCA-Katalog erkunden.",
    unavailable: "Anzahl vorübergehend nicht verfügbar",
    metadataTitle: "Atlas — Daten für Ökobilanzen",
  },
  fr: {
    name: "Atlas",
    descriptor: "Le carrefour des données d’ACV",
    eyebrow: "Explorer les données pour l’analyse du cycle de vie",
    title: "Données d’ACV.",
    emphasis: "Votre recherche commence ici.",
    description:
      "Trouvez des jeux de données de processus et de flux pour votre ACV. Explorez le catalogue par région ou source, examinez le périmètre et conservez les versions utiles.",
    explore: "Explorer le catalogue",
    guide: "Utiliser les données",
    index: "Choisissez votre point de départ.",
    indexDescription: "Explorer par type de données, région ou source.",
    process: "Données de processus",
    processDescription:
      "Production, énergie, transport et autres activités, avec leurs entrées et sorties.",
    flow: "Données de flux",
    flowDescription: "Produits, ressources, émissions et déchets, avec leurs propriétés et unités.",
    region: "Régions",
    regionDescription: "Trouver les données des pays et régions de votre étude.",
    source: "Sources",
    sourceDescription: "Parcourir les jeux de données selon leur source documentée.",
    principle: "De la recherche à la sélection",
    principleTitle: "Trouver les données adaptées à votre étude.",
    principleDescription:
      "Le nom d’un jeu de données n’est qu’un point de départ. Examinez l’activité, la région, la période et la méthode décrites avant de l’utiliser.",
    read: "Explorer les jeux de données",
    compare: "Comparer les processus",
    collect: "Organiser votre sélection",
    readDescription:
      "Consulter le périmètre, la source, la licence et les résultats disponibles d’un jeu de données.",
    compareDescription:
      "Sélectionner 2 à 4 versions de processus et comparer leurs périmètres et méthodes.",
    collectDescription:
      "Conserver les versions de processus et de flux avec vos notes dans ce navigateur, puis exporter une sauvegarde.",
    footer: "Le point de départ de votre prochaine ACV.",
    dataCredit: "Explorer le catalogue public TianGong LCA avec Atlas.",
    unavailable: "Nombre temporairement indisponible",
    metadataTitle: "Atlas — Données pour l’analyse du cycle de vie",
  },
};
