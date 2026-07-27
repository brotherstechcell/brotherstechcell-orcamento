# Expansão das Páginas por Modelo para os 5 Serviços Restantes — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estender as páginas `/iphone-{modelo}/{servico}` (hoje só tela/bateria, 78 páginas) para os outros 5 serviços do site (tampa-traseira, camera, dock, face-id, reparo-em-placa), gerando 189 páginas novas com preço real por modelo, sem regredir nenhuma das 78 páginas já publicadas.

**Architecture:** `src/scripts/prices.js` ganha 6 novas chaves de serviço no snapshot `CONFIG.devices`. `src/data/modelPages.ts` deixa de ter uma lista fixa de 2 serviços e passa a ter uma tabela de configuração por serviço com 4 modos de exibição de preço (`dual-tier`, `single`, `starting-from`, `dual-single`). `ModelHero.astro` e `ModelCrossLinks.astro` generalizam pra consumir a nova estrutura. `ServicePricing.astro` para de ter o preço mínimo hardcoded e passa a receber o valor real calculado.

**Tech Stack:** Astro 7, TypeScript, catálogo de preços Supabase (mesmo endpoint já usado).

## Global Constraints

- **Mapeamento serviço → chave(s) do catálogo:** `troca-de-tela`→`tela`, `troca-de-bateria`→`bateria`, `tampa-traseira`→`tampa_traseira`, `dock`→`conector_carga`, `camera`→[`camera_frontal`, `camera_traseira`], `face-id`→`face_id`, `reparo-em-placa`→`reparo_placa`.
- **Modo de exibição por serviço:** `troca-de-tela`/`troca-de-bateria` = `dual-tier` (sem mudança visual). `tampa-traseira`/`dock` = `single`. `camera` = `dual-single`. `face-id`/`reparo-em-placa` = `starting-from`.
- **Artigo gramatical por serviço** (usado nos textos "a troca de..."/"o reparo de..."): `troca-de-tela`="A", `troca-de-bateria`="A", `tampa-traseira`="A", `dock`="A", `camera`="A", `face-id`="O", `reparo-em-placa`="O".
- **Econômica = Premium em todos os modelos** para os 6 serviços que não são tela/bateria (verificado sem exceção nos 40 modelos × 6 serviços) — as páginas `single`/`starting-from`/`dual-single` leem sempre a chave `"Premium"` do catálogo (não existe diferenciação real de qualidade nesses serviços).
- **Zero regressão:** o HTML visível das 78 páginas de tela/bateria já publicadas (título, meta description, preço no Hero, resposta do FAQ "Quanto custa", texto "Veja Também") deve ficar byte-idêntico ao que já está em produção depois do refactor.
- **Nenhuma URL nova além de `/iphone-{modelo}/{servico}`** — reaproveita a rota dinâmica já existente (`src/pages/iphone-[model]/[service].astro`), sem mudança nela além do que este plano especifica.
- **Templates de título** (verificados programaticamente contra os 40 nomes reais de modelo, pior caso sempre "11 Pro Max"): `"Troca de Tela iPhone {m} | Brothers Techcell"` (tela, já existente), `"Troca de Bateria iPhone {m} | Brothers Techcell"` (bateria, já existente), `"Troca Tampa Traseira iPhone {m} | Brothers Techcell"` (58 chars), `"Troca de Dock iPhone {m} | Brothers Techcell"` (51 chars), `"Troca de Câmera iPhone {m} | Brothers Techcell"` (53 chars), `"Reparo de Face ID iPhone {m} | Brothers Techcell"` (55 chars), `"Reparo em Placa iPhone {m} | Brothers Techcell"` (53 chars). Todos ≤ 60.
- **Sufixo de descrição fixo:** `"Delivery gratuito, garantia real, atendimento todos os dias."` — usado em toda meta description, igual às etapas anteriores.
- **Nenhuma mudança na home, nas páginas de bairro, ou em `main.js`** (o seletor de preços da home, `renderSelectorResults()`, continua mostrando só tela/bateria — fora de escopo deste plano).

---

### Task 1: Expandir `CONFIG.devices` em `src/scripts/prices.js`

**Files:**
- Modify: `src/scripts/prices.js`

**Interfaces:**
- Produces: `CONFIG.devices[modelName][catalogServiceKey]["Econômica"|"Premium"] = { price: string, installment: string }` para as 8 chaves de serviço (`tela`, `bateria`, `tampa_traseira`, `conector_carga`, `camera_frontal`, `camera_traseira`, `face_id`, `reparo_placa`) em vez de só 2. Task 2 consome isso.

- [ ] **Step 1: Criar e rodar o script de regeneração**

Este script é temporário (não faz parte do build) — roda uma vez, sobrescreve `src/scripts/prices.js`, e é descartado depois (não commitar o script em si, só o `prices.js` resultante).

Crie `scripts-temp/regenerate-prices.mjs`:

```javascript
import { writeFileSync } from "node:fs";

const CATALOG_URL =
  "https://mdeplkhiweirjqprtued.supabase.co/functions/v1/get-public-pricing-catalog?format=tree";

// Ordem fixa de serviços e qualidades — garante saída determinística e legível.
const SERVICE_ORDER = [
  "tela",
  "bateria",
  "tampa_traseira",
  "conector_carga",
  "camera_frontal",
  "camera_traseira",
  "face_id",
  "reparo_placa",
];
const QUALITY_ORDER = ["Econômica", "Premium"];

function formatPriceRow(p) {
  let formattedPrice = "Sob Consulta";
  let formattedInstallment = "";

  if (typeof p.cash_price === "number" && p.cash_price > 0) {
    formattedPrice = p.cash_price.toFixed(2).replace(".", ",");
    if (p.installment_text) {
      formattedInstallment = p.installment_text;
    } else {
      let instVal = p.installment_12x;
      if (!instVal) instVal = (p.cash_price * 1.1416) / 12;
      formattedInstallment = `12x de R$ ${instVal.toFixed(2).replace(".", ",")}`;
    }
  } else if (
    typeof p.cash_price === "string" &&
    p.cash_price.trim() !== "" &&
    !p.cash_price.toLowerCase().includes("sob consulta")
  ) {
    formattedPrice = p.cash_price;
    formattedInstallment = p.installment_text || "";
  }

  return { price: formattedPrice, installment: formattedInstallment };
}

function normalizeQualityName(rawName) {
  const clean = rawName.trim().toLowerCase();
  if (clean === "intermediária" || clean === "intermediaria") return "Econômica";
  if (clean === "básica" || clean === "basica") return null;
  return rawName;
}

async function main() {
  const res = await fetch(CATALOG_URL);
  const catalog = await res.json();

  const qualityMap = {};
  (catalog.qualities || []).forEach((q) => {
    qualityMap[q.id] = q.name;
  });

  // Índice: model_id -> service_id -> quality_id -> row
  const index = {};
  (catalog.prices || []).forEach((p) => {
    if (!p.active) return;
    if (!SERVICE_ORDER.includes(p.service_id)) return;
    const qualityRaw = qualityMap[p.quality_id];
    if (!qualityRaw) return;
    const qualityName = normalizeQualityName(qualityRaw);
    if (!qualityName) return;

    index[p.model_id] = index[p.model_id] || {};
    index[p.model_id][p.service_id] = index[p.model_id][p.service_id] || {};
    index[p.model_id][p.service_id][qualityName] = p;
  });

  const modelsSorted = [...(catalog.models || [])].sort((a, b) => a.order - b.order);

  const devices = {};
  for (const model of modelsSorted) {
    const modelServices = index[model.id];
    if (!modelServices) continue;

    const deviceEntry = {};
    for (const serviceId of SERVICE_ORDER) {
      const serviceQualities = modelServices[serviceId];
      if (!serviceQualities) continue;

      const serviceEntry = {};
      for (const quality of QUALITY_ORDER) {
        const row = serviceQualities[quality];
        if (!row) continue;
        serviceEntry[quality] = formatPriceRow(row);
      }
      if (Object.keys(serviceEntry).length > 0) {
        deviceEntry[serviceId] = serviceEntry;
      }
    }
    if (Object.keys(deviceEntry).length > 0) {
      devices[model.name] = deviceEntry;
    }
  }

  const CONFIG = {
    pricingEndpoint: CATALOG_URL,
    contact: {
      phone: "(92) 99395-1193",
      phoneRaw: "5592993951193",
      email: "contato@brotherstechcell.com.br",
      instagram: "brothers_techcell",
      instagramUrl: "https://www.instagram.com/brothers_techcell/",
      cnpj: "",
      city: "Manaus",
      address: "Manaus - AM (Atendimento Delivery)",
    },
    warranty: "até 6 meses de garantia real",
    paymentTerms: "Em até 12x no cartão",
    devices,
  };

  const fileContent = `/**
 * CONFIGURAÇÃO DE PREÇOS E CONTATOS - BROTHERS TECHCELL
 * 
 * Este arquivo foi gerado automaticamente a partir da planilha de preços.
 * Altere os valores abaixo de forma simples para atualizar o site inteiro.
 */

const CONFIG = ${JSON.stringify(CONFIG, null, 2)};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
export { CONFIG };
`;

  writeFileSync("src/scripts/prices.js", fileContent, "utf8");
  console.log("modelos escritos:", Object.keys(devices).length);
  console.log(
    "exemplo iPhone 13:",
    JSON.stringify(devices["13"] ? Object.keys(devices["13"]) : "MODELO NAO ENCONTRADO")
  );
}

main();
```

Rode:
```bash
mkdir -p scripts-temp
node scripts-temp/regenerate-prices.mjs
```

- [ ] **Step 2: Verificar**

Run:
```bash
node -e "
import('./src/scripts/prices.js').then(m => {
  const CONFIG = m.CONFIG;
  const modelCount = Object.keys(CONFIG.devices).length;
  console.log('total modelos:', modelCount);
  const iphone13 = CONFIG.devices['13'];
  console.log('servicos do iPhone 13:', Object.keys(iphone13).sort().join(', '));
  console.log('tela Economica (deve continuar igual):', JSON.stringify(iphone13.tela['Econômica']));
  console.log('tampa_traseira Premium:', JSON.stringify(iphone13.tampa_traseira['Premium']));
  console.log('face_id existe no 13?', !!iphone13.face_id);
  const modelo6 = CONFIG.devices['6'];
  console.log('iPhone 6 tem face_id (nao deveria)?', !!(modelo6 && modelo6.face_id));
}).catch(e => { console.error(e); process.exit(1); });
"
```
Expected: `total modelos: 40`; `servicos do iPhone 13` inclui as 8 chaves (`bateria, camera_frontal, camera_traseira, conector_carga, face_id, reparo_placa, tampa_traseira, tela`); `tela Economica` continua com um preço válido (não "Sob Consulta"); `tampa_traseira Premium` tem um preço válido; `face_id existe no 13? true`; `iPhone 6 tem face_id (nao deveria)? false` (iPhone 6 não tem Face ID, confirma que o filtro de dados reais está correto, não fabricado).

- [ ] **Step 3: Remover o script temporário e commitar só o resultado**

```bash
rm -rf scripts-temp
git add src/scripts/prices.js
git commit -m "feat: expand CONFIG.devices with 6 new service pricing keys"
```

---

### Task 2: Generalizar `modelPages.ts`, `ModelHero.astro` e `ModelCrossLinks.astro` para os 7 serviços

**Files:**
- Modify: `src/data/modelPages.ts`
- Modify: `src/components/ModelHero.astro`
- Modify: `src/components/ModelCrossLinks.astro`
- Modify: `src/pages/iphone-[model]/[service].astro`

**Interfaces:**
- Consumes: `CONFIG.devices` expandido da Task 1 (8 chaves de serviço por modelo).
- Produces: `type ServiceSlug` (união dos 7 slugs), `type PriceDisplayMode`, `interface ModelPriceEntry { label: string; price: string; installment: string }`, `interface ModelPageData` generalizada (substitui `economica`/`premium` por `prices: ModelPriceEntry[]` e `priceDisplay: PriceDisplayMode`, adiciona `subtitlePhrase: string`), `getAllModelPages(): ModelPageData[]`, `getServiceStartingPrice(serviceSlug: ServiceSlug): string`. Task 3 consome `ServiceSlug` e `getServiceStartingPrice`.

Estes 3 arquivos + a rota mudam juntos porque são acoplados pela mesma interface — não é possível revisar `modelPages.ts` isoladamente sem `ModelHero.astro`/`ModelCrossLinks.astro`, já que o build quebra até os três serem atualizados juntos.

- [ ] **Step 1: Capturar o HTML atual de 2 páginas de tela/bateria (baseline de zero regressão)**

Antes de qualquer mudança, rode o build atual e salve o HTML de referência:

```bash
npx astro build
mkdir -p .regression-baseline
cp dist/iphone-13/troca-de-tela/index.html .regression-baseline/tela-13-before.html
cp dist/iphone-13-pro-max/troca-de-bateria/index.html .regression-baseline/bateria-13-pro-max-before.html
```

- [ ] **Step 2: Reescrever `src/data/modelPages.ts`**

Substitua o conteúdo inteiro do arquivo por:

```typescript
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
```

- [ ] **Step 3: Reescrever `src/components/ModelHero.astro`**

```astro
---
import type { ModelPageData } from '../data/modelPages';

interface Props {
  page: ModelPageData;
}

const { page } = Astro.props;
---
<section class="model-hero-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Preço Real</span>
      <h1 class="section-title type-h2-44">{page.serviceName} - iPhone {page.modelName} em Manaus</h1>
      <p class="section-subtitle type-subheading-20">
        Consulte o preço exato {page.subtitlePhrase} do seu iPhone {page.modelName}, com delivery gratuito e garantia
        real em Manaus.
      </p>
    </div>
    <div class="other-services-cta-card" style="max-width: 600px; margin: 0 auto;">
      <div class="cta-glow"></div>
      <div class="cta-card-inner">
        {page.priceDisplay === "dual-tier" && (
          <>
            <h4 class="type-heading-16">Econômica: R${page.prices[0].price}</h4>
            <p class="type-small-body">{page.prices[0].installment}</p>
            <h4 class="type-heading-16" style="margin-top: 16px;">Premium: R${page.prices[1].price}</h4>
            <p class="type-small-body">{page.prices[1].installment}</p>
          </>
        )}
        {page.priceDisplay === "single" && (
          <>
            <h4 class="type-heading-16">R${page.prices[0].price}</h4>
            <p class="type-small-body">{page.prices[0].installment}</p>
          </>
        )}
        {page.priceDisplay === "starting-from" && (
          <>
            <h4 class="type-heading-16">A partir de R${page.prices[0].price}</h4>
            <p class="type-small-body">{page.prices[0].installment}</p>
            <p class="type-small-body" style="margin-top: 8px;">*O valor final é confirmado após o diagnóstico.</p>
          </>
        )}
        {page.priceDisplay === "dual-single" && (
          <>
            <h4 class="type-heading-16">{page.prices[0].label}: R${page.prices[0].price}</h4>
            <p class="type-small-body">{page.prices[0].installment}</p>
            <h4 class="type-heading-16" style="margin-top: 16px;">{page.prices[1].label}: R${page.prices[1].price}</h4>
            <p class="type-small-body">{page.prices[1].installment}</p>
          </>
        )}
        <a href="#" class="btn-glow btn-whatsapp-global" data-message={page.whatsappMessage} style="margin-top: 16px;">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>AGENDAR AGORA</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

Nota: pra `troca-de-tela`/`troca-de-bateria`, `page.subtitlePhrase` é `"da troca de tela"`/`"da troca de bateria"` — texto idêntico ao que já estava hardcoded antes (`"da " + serviceLabel`), garantindo zero regressão no subtítulo.

- [ ] **Step 4: Reescrever `src/components/ModelCrossLinks.astro`**

```astro
---
import { getAllModelPages, type ServiceSlug } from '../data/modelPages';

interface Props {
  modelSlug: string;
  currentServiceSlug: ServiceSlug;
}

const { modelSlug, currentServiceSlug } = Astro.props;
const otherPages = getAllModelPages().filter(
  (p) => p.modelSlug === modelSlug && p.serviceSlug !== currentServiceSlug
);
---
<section class="model-crosslinks-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Outros Serviços</span>
      <h2 class="section-title type-h2-44">Veja Também</h2>
    </div>
    <ul
      class="footer-links type-link"
      style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; list-style: none; padding: 0;"
    >
      {otherPages.map((p) => (
        <li class="footer-link-item">
          <a href={`/iphone-${modelSlug}/${p.serviceSlug}`}>{p.serviceName.replace(" de iPhone", "")} deste modelo</a>
        </li>
      ))}
      <li class="footer-link-item"><a href={`/servicos/${currentServiceSlug}`}>Ver todos os modelos</a></li>
    </ul>
  </div>
</section>
```

Nota: `otherServiceExists` deixou de existir como prop — a lista agora é derivada diretamente, não precisa mais ser calculada por quem chama o componente. Pra `troca-de-tela`/`troca-de-bateria`, `p.serviceName.replace(" de iPhone", "")` produz `"Troca de Tela"`/`"Troca de Bateria"` — texto idêntico ao rótulo hardcoded anterior.

- [ ] **Step 5: Atualizar o call-site em `src/pages/iphone-[model]/[service].astro`**

Remova o cálculo de `otherServiceSlug`/`otherServiceExists` (linhas 29-32 do arquivo atual) e a prop `otherServiceExists` na chamada de `ModelCrossLinks`. O arquivo passa a ter:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import ModelHero from '../../components/ModelHero.astro';
import ServiceSymptoms from '../../components/ServiceSymptoms.astro';
import TrustFacts from '../../components/TrustFacts.astro';
import ServiceFaq from '../../components/ServiceFaq.astro';
import ModelCrossLinks from '../../components/ModelCrossLinks.astro';
import CtaFinal from '../../components/CtaFinal.astro';
import Footer from '../../components/Footer.astro';
import FloatingWhatsapp from '../../components/FloatingWhatsapp.astro';
import BottomNav from '../../components/BottomNav.astro';
import { getAllModelPages, type ModelPageData } from '../../data/modelPages';

export function getStaticPaths() {
  return getAllModelPages().map((page) => ({
    params: { model: page.modelSlug, service: page.serviceSlug },
    props: { page },
  }));
}

interface Props {
  page: ModelPageData;
}

const { page } = Astro.props;
const siteUrl = 'https://brotherstechcell-orcamento.vercel.app';

const serviceJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": `${page.serviceName} - iPhone ${page.modelName}`,
  "areaServed": "Manaus",
  "provider": { "@type": "ElectronicsStore", "name": "Brothers Techcell" },
});

const productJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `${page.serviceName} iPhone ${page.modelName} Manaus`,
  "description": page.description,
  "brand": { "@type": "Brand", "name": "Apple" },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "BRL",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "ElectronicsStore", "name": "Brothers Techcell" }
  }
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": page.faq.map(({ question, answer }) => ({
    "@type": "Question",
    "name": question,
    "acceptedAnswer": { "@type": "Answer", "text": answer },
  })),
});

const breadcrumbJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${siteUrl}/` },
    { "@type": "ListItem", "position": 2, "name": page.serviceName, "item": `${siteUrl}/servicos/${page.serviceSlug}` },
    { "@type": "ListItem", "position": 3, "name": `iPhone ${page.modelName}`, "item": `${siteUrl}/iphone-${page.modelSlug}/${page.serviceSlug}` },
  ],
});
---
<BaseLayout
  title={page.title}
  description={page.description}
  canonicalPath={`/iphone-${page.modelSlug}/${page.serviceSlug}`}
  extraJsonLd={[serviceJsonLd, productJsonLd, faqJsonLd, breadcrumbJsonLd]}
>
  <Header />
  <main>
    <ModelHero page={page} />
    <ServiceSymptoms symptoms={page.symptoms} />
    <TrustFacts />
    <ServiceFaq faq={page.faq} />
    <ModelCrossLinks modelSlug={page.modelSlug} currentServiceSlug={page.serviceSlug} />
    <CtaFinal />
  </main>
  <Footer />
  <FloatingWhatsapp />
  <BottomNav />
  <script src="../../scripts/prices.js"></script>
  <script src="../../scripts/main.js"></script>
</BaseLayout>
```

- [ ] **Step 6: Build e verificação de zero regressão**

Run:
```bash
npx astro build
diff .regression-baseline/tela-13-before.html dist/iphone-13/troca-de-tela/index.html
diff .regression-baseline/bateria-13-pro-max-before.html dist/iphone-13-pro-max/troca-de-bateria/index.html
```
Expected: **saída vazia nos dois `diff`** (HTML idêntico). Se houver qualquer diferença, ela precisa ser investigada e corrigida antes de prosseguir — zero regressão é um requisito, não uma sugestão.

Run também:
```bash
find dist/iphone-* -maxdepth 1 -type d | wc -l
ls dist/iphone-13/
```
Expected: `267` pastas no total (78 de tela/bateria + 189 novas — `getStaticPaths()` já itera `getAllModelPages()` sem depender de `hasFixedPricing`, então as 189 páginas novas já são geradas nesta task, antes mesmo da Task 3 mexer em `services.ts`). `ls dist/iphone-13/` deve listar as 7 pastas de serviço: `troca-de-tela`, `troca-de-bateria`, `tampa-traseira`, `dock`, `camera`, `face-id`, `reparo-em-placa`.

- [ ] **Step 7: Limpar baseline e commitar**

```bash
rm -rf .regression-baseline
git add src/data/modelPages.ts src/components/ModelHero.astro src/components/ModelCrossLinks.astro "src/pages/iphone-[model]/[service].astro"
git commit -m "feat: generalize model pages to support all 7 services with 4 price display modes"
```

---

### Task 3: `ServicePricing.astro`, `services.ts` e `ModelDirectory.astro` — preço real nas 5 páginas de serviço gerais

**Files:**
- Modify: `src/components/ServicePricing.astro`
- Modify: `src/components/ModelDirectory.astro`
- Modify: `src/data/services.ts`
- Modify: `src/pages/servicos/[slug].astro`

**Interfaces:**
- Consumes: `getServiceStartingPrice`, `type ServiceSlug` (Task 2).

- [ ] **Step 1: Atualizar `src/components/ServicePricing.astro`**

```astro
---
interface Props {
  hasFixedPricing: boolean;
  startingPrice?: string;
  homeTableAvailable?: boolean;
  whatsappMessage: string;
}

const { hasFixedPricing, startingPrice, homeTableAvailable, whatsappMessage } = Astro.props;
---
<section class="service-pricing-section">
  <div class="container">
    <div class="other-services-cta-card" style="max-width: 600px; margin: 0 auto;">
      <div class="cta-glow"></div>
      <div class="cta-card-inner">
        {hasFixedPricing ? (
          <>
            <h4 class="type-heading-16">A partir de R${startingPrice}</h4>
            <p class="type-small-body">
              {homeTableAvailable ? (
                <>O valor exato varia por modelo e qualidade da peça (Econômica ou Premium), em até 12x no cartão. Consulte o preço do seu iPhone na <a href="/#telas-precos">tabela completa da nossa página inicial</a> ou pelo WhatsApp.</>
              ) : (
                <>O valor exato varia por modelo, em até 12x no cartão. Escolha seu modelo logo abaixo ou fale pelo WhatsApp para confirmar o preço exato.</>
              )}
            </p>
          </>
        ) : (
          <>
            <h4 class="type-heading-16">Orçamento sob Consulta</h4>
            <p class="type-small-body">
              O valor depende do modelo do seu iPhone e da peça necessária. Fale com a gente pelo WhatsApp e
              receba o orçamento em poucos minutos.
            </p>
          </>
        )}
        <a href="#" class="btn-glow btn-whatsapp-global" data-message={whatsappMessage}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>PEDIR ORÇAMENTO</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Atualizar `src/components/ModelDirectory.astro`**

Troque só a linha do tipo do prop e o import:

```astro
---
import { getAllModelPages, type ServiceSlug } from '../data/modelPages';

interface Props {
  serviceSlug: ServiceSlug;
}

const { serviceSlug } = Astro.props;
const modelPages = getAllModelPages().filter((p) => p.serviceSlug === serviceSlug);
---
<section class="model-directory-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Todos os Modelos</span>
      <h2 class="section-title type-h2-44">Escolha seu Modelo</h2>
    </div>
    <ul
      class="footer-links type-link"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; list-style: none; padding: 0; max-width: 900px; margin: 0 auto;"
    >
      {modelPages.map((p) => (
        <li class="footer-link-item"><a href={`/iphone-${p.modelSlug}/${serviceSlug}`}>iPhone {p.modelName}</a></li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 3: Atualizar `src/data/services.ts`**

Troque `hasFixedPricing: false` para `hasFixedPricing: true` nas 5 entradas: `tampa-traseira` (linha ~127), `camera` (linha ~176), `dock` (linha ~220), `face-id` (linha ~264), `reparo-em-placa` (linha ~307). Nenhum outro campo dessas entradas muda.

- [ ] **Step 4: Atualizar `src/pages/servicos/[slug].astro`**

Adicione o import de `getServiceStartingPrice` e `type ServiceSlug` (junto do import já existente de `ModelDirectory`), e troque o bloco de `ServicePricing`/`ModelDirectory`:

```astro
import { getServiceStartingPrice, type ServiceSlug } from '../../data/modelPages';
```

```astro
    <ServicePricing
      hasFixedPricing={service.hasFixedPricing}
      startingPrice={service.hasFixedPricing ? getServiceStartingPrice(service.slug as ServiceSlug) : undefined}
      homeTableAvailable={service.slug === "troca-de-tela" || service.slug === "troca-de-bateria"}
      whatsappMessage={service.whatsappMessage}
    />
    {service.hasFixedPricing && <ModelDirectory serviceSlug={service.slug as ServiceSlug} />}
```

- [ ] **Step 5: Verificar**

Run:
```bash
npx astro build
grep -o '<h4 class="type-heading-16">[^<]*' dist/servicos/troca-de-tela/index.html | head -1
grep -o '<h4 class="type-heading-16">[^<]*' dist/servicos/tampa-traseira/index.html | head -1
grep -o '<h4 class="type-heading-16">[^<]*' dist/servicos/face-id/index.html | head -1
grep -c 'model-directory-section' dist/servicos/dock/index.html
```
Expected: `troca-de-tela` continua mostrando `"A partir de R$249,90"` (zero regressão); `tampa-traseira` mostra `"A partir de R$"` seguido do menor preço real (não mais "Orçamento sob Consulta"); `face-id` também; `dock` tem 1 ocorrência de `model-directory-section` (a seção "Escolha seu Modelo" apareceu).

- [ ] **Step 6: Commit**

```bash
git add src/components/ServicePricing.astro src/components/ModelDirectory.astro src/data/services.ts "src/pages/servicos/[slug].astro"
git commit -m "feat: show real starting price and model directory on the 5 remaining service pages"
```

---

### Task 4: Verificação final

**Files:** nenhum arquivo novo — task de verificação.

- [ ] **Step 1: Confirmar contagem total de páginas novas**

Run:
```bash
npx astro build
find dist/iphone-* -maxdepth 1 -type d | wc -l
```
Expected: `267` (78 de tela/bateria + 189 novas).

- [ ] **Step 2: Validar JSON-LD em uma amostra de cada novo modo de exibição**

Run:
```bash
node -e "
const fs = require('fs');
const samples = [
  'iphone-13/tampa-traseira',
  'iphone-13/dock',
  'iphone-13/camera',
  'iphone-13/face-id',
  'iphone-13/reparo-em-placa',
];
for (const s of samples) {
  const html = fs.readFileSync('dist/' + s + '/index.html', 'utf8');
  const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
  let m, types = [];
  while ((m = re.exec(html))) types.push(JSON.parse(m[1])['@type']);
  console.log(s + ':', types.join(', '));
}
"
```
Expected: `Service, Product, FAQPage, BreadcrumbList` nas 5.

- [ ] **Step 3: Confirmar preço real e distinto em câmera (dual-single) e reparo em placa (starting-from)**

Run:
```bash
node -e "
const fs = require('fs');
const camera13 = fs.readFileSync('dist/iphone-13/camera/index.html', 'utf8');
console.log('camera 13 tem 2 precos rotulados?', camera13.includes('Câmera Frontal') && camera13.includes('Câmera Traseira'));
const placa13 = fs.readFileSync('dist/iphone-13/reparo-em-placa/index.html', 'utf8');
console.log('placa 13 mostra a-partir-de?', placa13.includes('A partir de R\$'));
const placa15pro = fs.readFileSync('dist/iphone-15-pro/reparo-em-placa/index.html', 'utf8');
const p13match = placa13.match(/A partir de R\\\$([0-9.,]+)/);
const p15match = placa15pro.match(/A partir de R\\\$([0-9.,]+)/);
console.log('preco placa 13:', p13match && p13match[1], '| preco placa 15 pro:', p15match && p15match[1], '(devem ser diferentes)');
"
```
Expected: câmera do 13 mostra os 2 rótulos; placa do 13 mostra "A partir de R$"; preço do 13 e do 15 Pro são diferentes (confirma preço real por modelo, não fabricado/repetido).

- [ ] **Step 4: Confirmar que "Veja Também" lista todos os serviços do modelo (não mais binário)**

Run:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/iphone-13/tampa-traseira/index.html', 'utf8');
const re = /model-crosslinks-section[\s\S]*?<\/section>/;
const section = html.match(re)[0];
const linkCount = (section.match(/footer-link-item/g) || []).length;
console.log('links em Veja Também (iPhone 13, pagina tampa-traseira):', linkCount);
"
```
Expected: 7 (6 outros serviços do iPhone 13 + o link "Ver todos os modelos") — bem mais que os 2 de antes (quando só existiam tela e bateria como alternativa).

- [ ] **Step 5: Confirmar que Face ID não gerou página pra modelo sem Face ID**

Run:
```bash
test -d dist/iphone-6/face-id && echo "ERRO: pagina nao deveria existir" || echo "OK: pagina nao existe"
test -d dist/iphone-se-2-3/face-id && echo "ERRO: pagina nao deveria existir" || echo "OK: pagina nao existe"
```
Expected: `OK: pagina nao existe` nas duas.

- [ ] **Step 6: Confirmar sitemap**

Run:
```bash
cat dist/sitemap-0.xml | grep -o 'iphone-[a-z0-9-]*/[a-z0-9-]*' | sort -u | wc -l
```
Expected: `267`.

- [ ] **Step 7: Confirmar que páginas fora de escopo não mudaram**

Run:
```bash
git diff --stat "$(git merge-base main HEAD)"..HEAD -- src/pages/index.astro src/pages/atendimento src/scripts/main.js
```
Expected: saída vazia.

- [ ] **Step 8: Preview manual (checagem automatizada, sem navegador)**

Run: `npx astro preview --port 4326 &` e depois `curl -s http://localhost:4326/iphone-13/tampa-traseira/ | grep -o "<h1[^>]*>[^<]*"`. Encerre o preview depois.

**Nota (mesma limitação das etapas anteriores):** nenhum navegador disponível neste ambiente. Recomenda-se teste manual no preview do Vercel cobrindo: visual das 4 variantes de preço no Hero (principalmente a de câmera, com 2 blocos, e a "a partir de" com a nota de diagnóstico), e o botão WhatsApp nas páginas novas.

---
