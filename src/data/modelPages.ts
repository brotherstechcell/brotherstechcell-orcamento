import { CONFIG } from '../scripts/prices.js';
import { services, type ServiceData, type ServiceFaqItem } from './services';

export type ServiceSlug =
  | "troca-de-tela"
  | "troca-de-bateria"
  | "tampa-traseira"
  | "camera"
  | "conector-de-carga"
  | "dock"
  | "face-id"
  | "reparo-de-placa"
  | "reparo-em-placa"
  | "troca-de-vidro"
  | "iphone-caiu-na-agua";

export type PriceDisplayMode = "dual-tier" | "single" | "starting-from" | "dual-single";

export interface ModelPriceEntry {
  label: string;
  price: string;
  installment: string;
}

export interface ModelServiceSummary {
  serviceSlug: string;
  serviceCanonicalSlug: string;
  serviceName: string;
  shortName: string;
  priceDisplay: PriceDisplayMode;
  prices: ModelPriceEntry[];
  deliveryLabel: string;
  warranty: string;
  estimatedTime: string;
  pageUrl: string;
}

export interface ModelOverviewData {
  modelName: string;
  modelFullName: string;
  modelSlug: string;
  routeSlug: string; // Ex: "iphone-13"
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  services: ModelServiceSummary[];
  faq: ServiceFaqItem[];
  whatsappMessage: string;
}

export interface ModelPageData {
  modelName: string;
  modelFullName: string;
  modelSlug: string; // Ex: "13"
  routeSlug: string; // Ex: "iphone-13"
  serviceSlug: ServiceSlug;
  serviceName: string;
  title: string;
  description: string;
  h1: string;
  priceDisplay: PriceDisplayMode;
  prices: ModelPriceEntry[];
  subtitlePhrase: string;
  symptoms: string[];
  faq: ServiceFaqItem[];
  whatsappMessage: string;
  deliveryLabel: string;
  warranty: string;
  estimatedTime: string;
}

export interface ServiceVisualMeta {
  cleanName: string;
  icon: string;
  badge: string;
  highlightText?: string;
  isDeliveryOnSite: boolean;
}

export function getServiceVisualMeta(slug: string): ServiceVisualMeta {
  const s = slug.toLowerCase();
  if (s.includes("tela")) {
    return {
      cleanName: "Troca de Tela",
      icon: "📱",
      badge: "⚡ Delivery em Domicílio (30 min)",
      highlightText: "Display OLED/LCD com Touch e True Tone",
      isDeliveryOnSite: true,
    };
  }
  if (s.includes("bateria")) {
    return {
      cleanName: "Troca de Bateria",
      icon: "🔋",
      badge: "⚡ Delivery em Domicílio (30 min)",
      highlightText: "Saúde 100% com longa autonomia",
      isDeliveryOnSite: true,
    };
  }
  if (s.includes("tampa") || s.includes("traseira")) {
    return {
      cleanName: "Tampa Traseira de Vidro",
      icon: "✨",
      badge: "⚡ Delivery com Laser Especial",
      highlightText: "Substituição a laser sem abrir o aparelho",
      isDeliveryOnSite: true,
    };
  }
  if (s.includes("conector") || s.includes("dock") || s.includes("carga")) {
    return {
      cleanName: "Conector de Carga (Dock)",
      icon: "🔌",
      badge: "⚡ Delivery em Domicílio (30 min)",
      highlightText: "Solução para falhas de carregamento e mau contato",
      isDeliveryOnSite: true,
    };
  }
  if (s.includes("camera")) {
    return {
      cleanName: "Câmera Traseira / Frontal",
      icon: "📸",
      badge: "⚡ Delivery em Domicílio (40 min)",
      highlightText: "Foco automático e lentes em alta definição",
      isDeliveryOnSite: true,
    };
  }
  if (s.includes("face-id") || s.includes("face")) {
    return {
      cleanName: "Reparo de Face ID",
      icon: "👤",
      badge: "🔬 Laboratório c/ Coleta Grátis",
      highlightText: "Restauração do sensor biométrico e leitura facial",
      isDeliveryOnSite: false,
    };
  }
  if (s.includes("placa")) {
    return {
      cleanName: "Reparo em Placa Lógica",
      icon: "🔬",
      badge: "🔬 Laboratório c/ Coleta Grátis",
      highlightText: "Diagnóstico avançado de microssolda e circuitos",
      isDeliveryOnSite: false,
    };
  }
  if (s.includes("agua") || s.includes("desoxidacao")) {
    return {
      cleanName: "Desoxidação (Caiu na Água)",
      icon: "💧",
      badge: "🔬 Banho Químico Ultrassônico",
      highlightText: "Tratamento especializado contra corrosão",
      isDeliveryOnSite: false,
    };
  }
  if (s.includes("vidro")) {
    return {
      cleanName: "Troca de Vidro",
      icon: "🛡️",
      badge: "🔬 Laminação a Vácuo",
      highlightText: "Preserva 100% o display original de fábrica",
      isDeliveryOnSite: false,
    };
  }
  return {
    cleanName: "Assistência Especializada",
    icon: "🔧",
    badge: "⚡ Delivery em Manaus",
    highlightText: "Peças selecionadas com garantia formal",
    isDeliveryOnSite: true,
  };
}

export function slugifyModel(model: string): string {
  return model.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
}

export function getModelNames(): string[] {
  return Object.keys(CONFIG.devices || {});
}

export const LOGICAL_MODEL_ORDER = [
  "16 Pro Max", "16 Pro", "16 Plus", "16",
  "15 Pro Max", "15 Pro", "15 Plus", "15",
  "14 Pro Max", "14 Pro", "14 Plus", "14",
  "13 Pro Max", "13 Pro", "13 Mini", "13",
  "12 Pro Max", "12 Pro", "12 Mini", "12",
  "11 Pro Max", "11 Pro", "11",
  "XS Max", "XS", "XR", "X",
  "SE 2/3",
  "8 Plus", "8",
  "7 Plus", "7",
  "6S Plus", "6S", "6"
];

interface ServiceModelConfig {
  slug: ServiceSlug;
  canonicalSlug: string;
  catalogKeys: string[];
  displayMode: PriceDisplayMode;
  priceLabels?: string[];
  article: "A" | "O";
  titleTemplate: (modelName: string) => string;
}

const SERVICE_MODEL_CONFIG: ServiceModelConfig[] = [
  {
    slug: "troca-de-tela",
    canonicalSlug: "troca-de-tela-iphone-manaus",
    catalogKeys: ["tela"],
    displayMode: "dual-tier",
    article: "A",
    titleTemplate: (m) => `Troca de Tela iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "troca-de-bateria",
    canonicalSlug: "troca-de-bateria-iphone-manaus",
    catalogKeys: ["bateria"],
    displayMode: "dual-tier",
    article: "A",
    titleTemplate: (m) => `Troca de Bateria iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "tampa-traseira",
    canonicalSlug: "tampa-traseira-iphone-manaus",
    catalogKeys: ["tampa_traseira"],
    displayMode: "single",
    article: "A",
    titleTemplate: (m) => `Troca de Tampa Traseira iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "conector-de-carga",
    canonicalSlug: "conector-de-carga-iphone-manaus",
    catalogKeys: ["conector_carga"],
    displayMode: "single",
    article: "O",
    titleTemplate: (m) => `Conserto Conector de Carga iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "dock",
    canonicalSlug: "conector-de-carga-iphone-manaus",
    catalogKeys: ["conector_carga"],
    displayMode: "single",
    article: "O",
    titleTemplate: (m) => `Troca de Dock iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "camera",
    canonicalSlug: "camera-iphone-manaus",
    catalogKeys: ["camera_frontal", "camera_traseira"],
    displayMode: "dual-single",
    priceLabels: ["Câmera Frontal", "Câmera Traseira"],
    article: "A",
    titleTemplate: (m) => `Troca de Câmera iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "face-id",
    canonicalSlug: "face-id-iphone-manaus",
    catalogKeys: ["face_id"],
    displayMode: "starting-from",
    article: "O",
    titleTemplate: (m) => `Conserto de Face ID iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "reparo-de-placa",
    canonicalSlug: "reparo-de-placa-iphone-manaus",
    catalogKeys: ["reparo_placa"],
    displayMode: "starting-from",
    article: "O",
    titleTemplate: (m) => `Reparo em Placa iPhone ${m} em Manaus | Brothers Techcell`,
  },
  {
    slug: "reparo-em-placa",
    canonicalSlug: "reparo-de-placa-iphone-manaus",
    catalogKeys: ["reparo_placa"],
    displayMode: "starting-from",
    article: "O",
    titleTemplate: (m) => `Reparo em Placa iPhone ${m} em Manaus | Brothers Techcell`,
  },
];

type CatalogQualityPrice = { price: string; installment: string };
type CatalogServicePricing = Record<string, CatalogQualityPrice>;
type CatalogDeviceData = Record<string, CatalogServicePricing>;

function buildPrices(
  deviceData: CatalogDeviceData | undefined,
  config: ServiceModelConfig
): ModelPriceEntry[] | null {
  if (!deviceData) return null;

  if (config.displayMode === "dual-tier") {
    const catalogData = deviceData[config.catalogKeys[0]];
    const economica = catalogData?.["Econômica"];
    const premium = catalogData?.["Premium"];
    if (!economica && !premium) return null;
    const list: ModelPriceEntry[] = [];
    if (economica) list.push({ label: "Econômica", price: economica.price, installment: economica.installment });
    if (premium) list.push({ label: "Premium", price: premium.price, installment: premium.installment });
    return list.length > 0 ? list : null;
  }

  if (config.displayMode === "dual-single") {
    const [keyA, keyB] = config.catalogKeys;
    const priceA = deviceData[keyA]?.["Premium"] || deviceData[keyA]?.["Econômica"];
    const priceB = deviceData[keyB]?.["Premium"] || deviceData[keyB]?.["Econômica"];
    if (!priceA && !priceB) return null;
    const [labelA, labelB] = config.priceLabels!;
    const list: ModelPriceEntry[] = [];
    if (priceA) list.push({ label: labelA, price: priceA.price, installment: priceA.installment });
    if (priceB) list.push({ label: labelB, price: priceB.price, installment: priceB.installment });
    return list.length > 0 ? list : null;
  }

  // single | starting-from
  const catalogData = deviceData[config.catalogKeys[0]];
  const priceEntry = catalogData?.["Premium"] || catalogData?.["Econômica"];
  if (!priceEntry) return null;
  return [{ label: "Padrão", price: priceEntry.price, installment: priceEntry.installment }];
}

function buildDescription(
  config: ServiceModelConfig,
  service: ServiceData,
  modelName: string,
  prices: ModelPriceEntry[]
): string {
  const suffix = "Atendimento delivery em Manaus, garantia real de até 6 meses.";

  if (config.displayMode === "single" && prices[0]) {
    return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus custa R$${prices[0].price}. ${suffix}`;
  }
  if (config.displayMode === "starting-from" && prices[0]) {
    return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus é a partir de R$${prices[0].price}. ${suffix}`;
  }
  if (config.displayMode === "dual-single" && prices.length > 0) {
    const minPrice = prices
      .map((p) => parseFloat(p.price.replace(",", ".")))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b)[0];
    const formattedMin = minPrice ? minPrice.toFixed(2).replace(".", ",") : prices[0].price;
    return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus a partir de R$${formattedMin}. ${suffix}`;
  }
  if (prices[0]) {
    return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus a partir de R$${prices[0].price}. ${suffix}`;
  }
  return `Assistência técnica para ${service.shortName} do iPhone ${modelName} em Manaus com atendimento delivery.`;
}

function buildFaq(
  config: ServiceModelConfig,
  service: ServiceData,
  modelName: string,
  prices: ModelPriceEntry[]
): ServiceFaqItem[] {
  return service.faq.map((item) => {
    if (!item.question.toLowerCase().includes("quanto custa")) return item;

    if (config.displayMode === "dual-tier" && prices.length >= 2) {
      return {
        question: `Quanto custa a ${service.shortName} do iPhone ${modelName} em Manaus?`,
        answer: `${config.article} ${service.shortName} do iPhone ${modelName} custa R$${prices[0].price} (${prices[0].label}, ${prices[0].installment}) ou R$${prices[1].price} (${prices[1].label}, ${prices[1].installment}), em até 12x no cartão com atendimento delivery.`,
      };
    }
    if (config.displayMode === "single" && prices[0]) {
      return {
        question: `Quanto custa a ${service.shortName} do iPhone ${modelName} em Manaus?`,
        answer: `${config.article} ${service.shortName} do iPhone ${modelName} custa R$${prices[0].price}, em até 12x no cartão (${prices[0].installment}).`,
      };
    }
    if (config.displayMode === "starting-from" && prices[0]) {
      return {
        question: `Quanto custa o ${service.shortName} do iPhone ${modelName} em Manaus?`,
        answer: `${config.article} ${service.shortName} do iPhone ${modelName} é a partir de R$${prices[0].price} (o valor final é confirmado no diagnóstico), em até 12x no cartão.`,
      };
    }
    if (config.displayMode === "dual-single" && prices.length >= 2) {
      return {
        question: `Quanto custa a ${service.shortName} do iPhone ${modelName} em Manaus?`,
        answer: `${config.article} ${service.shortName} do iPhone ${modelName} custa R$${prices[0].price} (${prices[0].label}) ou R$${prices[1].price} (${prices[1].label}), em até 12x no cartão.`,
      };
    }
    return item;
  });
}

/**
 * Retorna todas as páginas de modelo único (ex: /iphone/iphone-13/)
 */
export function getAllModelOverviewPages(): ModelOverviewData[] {
  const modelNames = getModelNames();
  const list: ModelOverviewData[] = [];

  for (const modelName of modelNames) {
    const deviceData = CONFIG.devices[modelName] as CatalogDeviceData | undefined;
    if (!deviceData) continue;

    const modelSlug = slugifyModel(modelName);
    const routeSlug = `iphone-${modelSlug}`;
    const modelFullName = `iPhone ${modelName}`;

    const availableServices: ModelServiceSummary[] = [];

    // Mapeia serviços únicos (evitando duplicatas de alias)
    const distinctConfigs = SERVICE_MODEL_CONFIG.filter(
      (c, index, self) => index === self.findIndex((t) => t.catalogKeys[0] === c.catalogKeys[0])
    );

    for (const config of distinctConfigs) {
      const service = services.find((s) => s.slug === config.slug || s.canonicalSlug === config.canonicalSlug);
      if (!service) continue;

      const prices = buildPrices(deviceData, config);
      if (!prices || prices.length === 0) continue;

      availableServices.push({
        serviceSlug: config.slug,
        serviceCanonicalSlug: service.canonicalSlug,
        serviceName: service.name,
        shortName: service.shortName,
        priceDisplay: config.displayMode,
        prices,
        deliveryLabel: service.deliveryLabel,
        warranty: service.warranty,
        estimatedTime: service.estimatedTime,
        pageUrl: `/iphone/${routeSlug}/${config.slug}`,
      });
    }

    if (availableServices.length === 0) continue;

    const title = `Assistência Técnica iPhone ${modelName} em Manaus | Brothers Techcell`;
    const description = `Assistência técnica especializada para iPhone ${modelName} em Manaus com atendimento delivery. Troca de tela, bateria, tampa traseira e mais com até 6 meses de garantia.`;
    const h1 = `Assistência Técnica para iPhone ${modelName} em Manaus`;
    const subtitle = `Atendimento delivery em toda Manaus. Nós vamos até você e realizamos o conserto do seu iPhone ${modelName} no seu endereço.`;

    const faq: ServiceFaqItem[] = [
      {
        question: `Vocês consertam o iPhone ${modelName} em domicílio em Manaus?`,
        answer: `Sim! Nosso atendimento delivery vai até sua casa ou trabalho em qualquer bairro de Manaus para realizar reparos de tela, bateria, conector e câmeras na sua frente.`,
      },
      {
        question: `Quanto tempo demora o reparo do iPhone ${modelName}?`,
        answer: `Serviços como troca de tela e bateria levam em média de 20 a 40 minutos na sua presença.`,
      },
      {
        question: `Qual a garantia dos serviços para o iPhone ${modelName}?`,
        answer: `Oferecemos garantia de 3 a 6 meses conforme a categoria de peça escolhida (Econômica ou Premium).`,
      },
      {
        question: `Como agendar o conserto do iPhone ${modelName}?`,
        answer: `Basta clicar no botão do WhatsApp e nos informar o defeito do seu iPhone ${modelName} para receber o orçamento e agendar o horário.`,
      },
    ];

    list.push({
      modelName,
      modelFullName,
      modelSlug,
      routeSlug,
      title,
      description,
      h1,
      subtitle,
      services: availableServices,
      faq,
      whatsappMessage: `Olá! Gostaria de um orçamento para conserto do meu iPhone ${modelName} com atendimento delivery em Manaus.`,
    });
  }

  return list;
}

/**
 * Retorna todas as páginas de combinação Modelo + Serviço (ex: /iphone/iphone-13/troca-de-tela/)
 */
export function getAllModelPages(): ModelPageData[] {
  const pages: ModelPageData[] = [];

  for (const config of SERVICE_MODEL_CONFIG) {
    const service = services.find((s) => s.slug === config.slug || s.canonicalSlug === config.canonicalSlug);
    if (!service) continue;

    const subtitlePhrase = `${config.article === "A" ? "da" : "do"} ${service.shortName}`;

    for (const modelName of getModelNames()) {
      const deviceData = CONFIG.devices[modelName] as CatalogDeviceData | undefined;
      const prices = buildPrices(deviceData, config);
      if (!prices || prices.length === 0) continue;

      const modelSlug = slugifyModel(modelName);
      const routeSlug = `iphone-${modelSlug}`;
      const title = config.titleTemplate(modelName);
      const description = buildDescription(config, service, modelName, prices);
      const faq = buildFaq(config, service, modelName, prices);
      const whatsappMessage = `Olá! Quero saber o preço ${subtitlePhrase} do meu iPhone ${modelName} com atendimento delivery em Manaus.`;
      const h1 = `${service.name} iPhone ${modelName} em Manaus`;

      pages.push({
        modelName,
        modelFullName: `iPhone ${modelName}`,
        modelSlug,
        routeSlug,
        serviceSlug: config.slug,
        serviceName: service.name,
        title,
        description,
        h1,
        priceDisplay: config.displayMode,
        prices,
        subtitlePhrase,
        symptoms: service.symptoms,
        faq,
        whatsappMessage,
        deliveryLabel: service.deliveryLabel,
        warranty: service.warranty,
        estimatedTime: service.estimatedTime,
      });
    }
  }

  return pages;
}

export function getServiceStartingPrice(serviceSlug: string): string {
  const allPages = getAllModelPages().filter(
    (p) => p.serviceSlug === serviceSlug || p.serviceSlug.includes(serviceSlug)
  );
  const allPrices = allPages.flatMap((p) =>
    p.prices.map((entry) => parseFloat(entry.price.replace(",", "."))).filter((n) => !isNaN(n) && n > 0)
  );

  if (allPrices.length === 0) {
    return "199,90";
  }
  const min = Math.min(...allPrices);
  return min.toFixed(2).replace(".", ",");
}
