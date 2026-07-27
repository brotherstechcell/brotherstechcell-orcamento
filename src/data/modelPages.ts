import { CONFIG } from '../scripts/prices.js';
import { services, type ServiceData, type ServiceFaqItem } from './services';

export type ServiceSlug =
  | "troca-de-tela"
  | "troca-de-bateria"
  | "tampa-traseira"
  | "camera"
  | "dock"
  | "face-id"
  | "reparo-em-placa";

export type PriceDisplayMode = "dual-tier" | "single" | "starting-from" | "dual-single";

export interface ModelPriceEntry {
  label: string;
  price: string;
  installment: string;
}

export interface ModelPageData {
  modelName: string;
  modelSlug: string;
  serviceSlug: ServiceSlug;
  serviceName: string;
  title: string;
  description: string;
  priceDisplay: PriceDisplayMode;
  prices: ModelPriceEntry[];
  subtitlePhrase: string;
  symptoms: string[];
  faq: ServiceFaqItem[];
  whatsappMessage: string;
}

export function slugifyModel(model: string): string {
  return model.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
}

export function getModelNames(): string[] {
  return Object.keys(CONFIG.devices);
}

interface ServiceModelConfig {
  slug: ServiceSlug;
  catalogKeys: string[];
  displayMode: PriceDisplayMode;
  priceLabels?: string[];
  article: "A" | "O";
  titleTemplate: (modelName: string) => string;
}

const SERVICE_MODEL_CONFIG: ServiceModelConfig[] = [
  {
    slug: "troca-de-tela",
    catalogKeys: ["tela"],
    displayMode: "dual-tier",
    article: "A",
    titleTemplate: (m) => `Troca de Tela iPhone ${m} | Brothers Techcell`,
  },
  {
    slug: "troca-de-bateria",
    catalogKeys: ["bateria"],
    displayMode: "dual-tier",
    article: "A",
    titleTemplate: (m) => `Troca de Bateria iPhone ${m} | Brothers Techcell`,
  },
  {
    slug: "tampa-traseira",
    catalogKeys: ["tampa_traseira"],
    displayMode: "single",
    article: "A",
    titleTemplate: (m) => `Troca Tampa Traseira iPhone ${m} | Brothers Techcell`,
  },
  {
    slug: "dock",
    catalogKeys: ["conector_carga"],
    displayMode: "single",
    article: "A",
    titleTemplate: (m) => `Troca de Dock iPhone ${m} | Brothers Techcell`,
  },
  {
    slug: "camera",
    catalogKeys: ["camera_frontal", "camera_traseira"],
    displayMode: "dual-single",
    priceLabels: ["Câmera Frontal", "Câmera Traseira"],
    article: "A",
    titleTemplate: (m) => `Troca de Câmera iPhone ${m} | Brothers Techcell`,
  },
  {
    slug: "face-id",
    catalogKeys: ["face_id"],
    displayMode: "starting-from",
    article: "O",
    titleTemplate: (m) => `Reparo de Face ID iPhone ${m} | Brothers Techcell`,
  },
  {
    slug: "reparo-em-placa",
    catalogKeys: ["reparo_placa"],
    displayMode: "starting-from",
    article: "O",
    titleTemplate: (m) => `Reparo em Placa iPhone ${m} | Brothers Techcell`,
  },
];

type CatalogQualityPrice = { price: string; installment: string };
type CatalogServicePricing = Record<string, CatalogQualityPrice>;
type CatalogDeviceData = Record<string, CatalogServicePricing>;

function buildPrices(
  deviceData: CatalogDeviceData | undefined,
  config: ServiceModelConfig
): ModelPriceEntry[] | null {
  if (config.displayMode === "dual-tier") {
    const catalogData = deviceData?.[config.catalogKeys[0]];
    const economica = catalogData?.["Econômica"];
    const premium = catalogData?.["Premium"];
    if (!economica || !premium) return null;
    return [
      { label: "Econômica", price: economica.price, installment: economica.installment },
      { label: "Premium", price: premium.price, installment: premium.installment },
    ];
  }

  if (config.displayMode === "dual-single") {
    const [keyA, keyB] = config.catalogKeys;
    const priceA = deviceData?.[keyA]?.["Premium"];
    const priceB = deviceData?.[keyB]?.["Premium"];
    if (!priceA || !priceB) return null;
    const [labelA, labelB] = config.priceLabels!;
    return [
      { label: labelA, price: priceA.price, installment: priceA.installment },
      { label: labelB, price: priceB.price, installment: priceB.installment },
    ];
  }

  // single | starting-from
  const catalogData = deviceData?.[config.catalogKeys[0]];
  const priceEntry = catalogData?.["Premium"];
  if (!priceEntry) return null;
  return [{ label: "", price: priceEntry.price, installment: priceEntry.installment }];
}

function buildDescription(
  config: ServiceModelConfig,
  service: ServiceData,
  modelName: string,
  prices: ModelPriceEntry[]
): string {
  const suffix = "Delivery gratuito, garantia real, atendimento todos os dias.";

  if (config.displayMode === "single") {
    return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus custa R$${prices[0].price}. ${suffix}`;
  }
  if (config.displayMode === "starting-from") {
    return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus é a partir de R$${prices[0].price}. ${suffix}`;
  }
  if (config.displayMode === "dual-single") {
    const minPrice = [prices[0].price, prices[1].price]
      .map((p) => parseFloat(p.replace(",", ".")))
      .sort((a, b) => a - b)[0]
      .toFixed(2)
      .replace(".", ",");
    return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus a partir de R$${minPrice}. ${suffix}`;
  }
  // dual-tier
  return `${config.article} ${service.shortName} do iPhone ${modelName} em Manaus a partir de R$${prices[0].price}. ${suffix}`;
}

function buildFaq(
  config: ServiceModelConfig,
  service: ServiceData,
  modelName: string,
  prices: ModelPriceEntry[]
): ServiceFaqItem[] {
  return service.faq.map((item) => {
    if (!item.question.startsWith("Quanto custa")) return item;

    if (config.displayMode === "dual-tier") {
      return {
        question: item.question,
        answer: `${config.article} ${service.shortName} do iPhone ${modelName} custa R$${prices[0].price} (Econômica, ${prices[0].installment}) ou R$${prices[1].price} (Premium, ${prices[1].installment}), em até 12x no cartão.`,
      };
    }
    if (config.displayMode === "single") {
      return {
        question: item.question,
        answer: `${config.article} ${service.shortName} do iPhone ${modelName} custa R$${prices[0].price}, em até 12x no cartão (${prices[0].installment}).`,
      };
    }
    if (config.displayMode === "starting-from") {
      return {
        question: item.question,
        answer: `${config.article} ${service.shortName} do iPhone ${modelName} é a partir de R$${prices[0].price} (o valor final é confirmado no diagnóstico), em até 12x no cartão.`,
      };
    }
    // dual-single (câmera)
    const [labelA, labelB] = config.priceLabels!;
    return {
      question: item.question,
      answer: `${config.article} ${service.shortName} do iPhone ${modelName} custa R$${prices[0].price} (${labelA}) ou R$${prices[1].price} (${labelB}), em até 12x no cartão.`,
    };
  });
}

export function getAllModelPages(): ModelPageData[] {
  const pages: ModelPageData[] = [];

  for (const config of SERVICE_MODEL_CONFIG) {
    const service = services.find((s) => s.slug === config.slug)!;
    const subtitlePhrase = `${config.article === "A" ? "da" : "do"} ${service.shortName}`;

    for (const modelName of getModelNames()) {
      const deviceData = CONFIG.devices[modelName] as CatalogDeviceData | undefined;
      const prices = buildPrices(deviceData, config);
      if (!prices) continue;

      const modelSlug = slugifyModel(modelName);
      const title = config.titleTemplate(modelName);
      const description = buildDescription(config, service, modelName, prices);
      const faq = buildFaq(config, service, modelName, prices);
      const whatsappMessage = `Olá! Quero saber o preço da ${service.shortName} do meu iPhone ${modelName}.`;

      pages.push({
        modelName,
        modelSlug,
        serviceSlug: config.slug,
        serviceName: service.name,
        title,
        description,
        priceDisplay: config.displayMode,
        prices,
        subtitlePhrase,
        symptoms: service.symptoms,
        faq,
        whatsappMessage,
      });
    }
  }

  return pages;
}

export function getServiceStartingPrice(serviceSlug: ServiceSlug): string {
  const allPrices = getAllModelPages()
    .filter((p) => p.serviceSlug === serviceSlug)
    .flatMap((p) => p.prices.map((entry) => parseFloat(entry.price.replace(",", "."))));
  const min = Math.min(...allPrices);
  return min.toFixed(2).replace(".", ",");
}
