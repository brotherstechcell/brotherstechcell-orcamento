import { CONFIG } from '../scripts/prices.js';
import { services, type ServiceFaqItem } from './services';

export interface ModelPricingTier {
  price: string;
  installment: string;
}

export interface ModelPageData {
  modelName: string;
  modelSlug: string;
  serviceSlug: "troca-de-tela" | "troca-de-bateria";
  serviceName: string;
  title: string;
  description: string;
  economica: ModelPricingTier;
  premium: ModelPricingTier;
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

const PRICING_KEY: Record<"troca-de-tela" | "troca-de-bateria", "tela" | "bateria"> = {
  "troca-de-tela": "tela",
  "troca-de-bateria": "bateria",
};

const SERVICE_SLUGS = ["troca-de-tela", "troca-de-bateria"] as const;

export function getAllModelPages(): ModelPageData[] {
  const pages: ModelPageData[] = [];

  for (const serviceSlug of SERVICE_SLUGS) {
    const service = services.find((s) => s.slug === serviceSlug)!;
    const priceKey = PRICING_KEY[serviceSlug];

    for (const modelName of getModelNames()) {
      const deviceService = CONFIG.devices[modelName]?.[priceKey];
      if (!deviceService) continue;

      const economica: ModelPricingTier = deviceService["Econômica"];
      const premium: ModelPricingTier = deviceService["Premium"];
      const modelSlug = slugifyModel(modelName);
      const shortLabel = serviceSlug === "troca-de-tela" ? "Tela" : "Bateria";

      const title = `Troca de ${shortLabel} iPhone ${modelName} | Brothers Techcell`;
      const description = `A ${service.shortName} do iPhone ${modelName} em Manaus a partir de R$${economica.price}. Delivery gratuito, garantia real, atendimento todos os dias.`;

      const faq: ServiceFaqItem[] = service.faq.map((item) => {
        if (item.question.startsWith("Quanto custa")) {
          return {
            question: item.question,
            answer: `A ${service.shortName} do iPhone ${modelName} custa R$${economica.price} (Econômica, ${economica.installment}) ou R$${premium.price} (Premium, ${premium.installment}), em até 12x no cartão.`,
          };
        }
        return item;
      });

      const whatsappMessage = `Olá! Quero saber o preço da ${service.shortName} do meu iPhone ${modelName}.`;

      pages.push({
        modelName,
        modelSlug,
        serviceSlug,
        serviceName: service.name,
        title,
        description,
        economica,
        premium,
        symptoms: service.symptoms,
        faq,
        whatsappMessage,
      });
    }
  }

  return pages;
}
