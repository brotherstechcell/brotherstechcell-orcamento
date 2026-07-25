# Páginas por Modelo (`/iphone-{modelo}/{servico}`) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar 78 páginas (`/iphone-{modelo}/troca-de-tela` e `/iphone-{modelo}/troca-de-bateria` para os 39 modelos de `CONFIG.devices`) com preço real e distinto por modelo, e adicionar uma seção "Escolha seu Modelo" nas duas páginas de serviço com preço fixo.

**Architecture:** Rota dupla dinâmica `src/pages/iphone-[model]/[service].astro` com `getStaticPaths()` gerando as 78 combinações a partir de um novo módulo de dados (`src/data/modelPages.ts`) que combina o preço real de `CONFIG.devices` (agora exportado de `prices.js`) com o conteúdo já escrito em `services.ts` (Etapa 2). Três componentes novos (`ModelHero`, `ModelCrossLinks`, `ModelDirectory`) reaproveitam classes CSS já existentes — nenhuma CSS nova. `ServiceSymptoms`, `TrustFacts`, `ServiceFaq`, `CtaFinal`, `Header`, `Footer`, `FloatingWhatsapp`, `BottomNav`, `BaseLayout` são reaproveitados sem alteração.

**Tech Stack:** Astro 7 (já instalado), TypeScript, mesma fonte de preços (`src/scripts/prices.js`'s `CONFIG.devices`, 39 modelos).

## Global Constraints

- Escopo: só troca de tela e troca de bateria ganham página por modelo (39 × 2 = 78 páginas). Os outros 5 serviços NÃO ganham página por modelo (thin content descartado, decisão já aprovada).
- `src/scripts/prices.js` ganha `export { CONFIG };` (aditivo — não remove nem altera `window.CONFIG = CONFIG;`).
- Slug de modelo: `model.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-")` — testado contra os 39 nomes reais, zero colisão (`"13 Pro Max"` → `"13-pro-max"`, `"SE 2/3"` → `"se-2-3"`, `"XS Max"` → `"xs-max"`).
- Title: `"Troca de {Tela|Bateria} iPhone {modelo} | Brothers Techcell"` — sem "Manaus" (não cabe no limite de 60 caracteres pros nomes de modelo mais longos + "Troca de Bateria"; verificado: máximo real 54 caracteres). "Manaus" aparece no H1 e na meta description.
- Meta description: `"A {troca de tela|troca de bateria} do iPhone {modelo} em Manaus a partir de R${preço Econômica}. Delivery gratuito, garantia real, atendimento todos os dias."` — verificado contra os 78 combos reais, máximo 132 caracteres, dentro do limite de 155.
- FAQ de cada página de modelo: reaproveita `service.faq` de `services.ts` verbatim, EXCETO a pergunta que começa com "Quanto custa" (`item.question.startsWith("Quanto custa")`), cuja resposta é substituída pelo preço real do modelo. Nenhuma outra pergunta/resposta é reescrita.
- Sintomas, garantia (TrustFacts), processo: idênticos aos da página de serviço geral — vêm da mesma fonte (`services.ts`), sem duplicação de texto reescrito.
- Nenhuma mudança em: home (`src/pages/index.astro`), qualquer componente/dado da Etapa 1, ou conteúdo das 7 páginas de serviço da Etapa 2 além da adição aditiva especificada na Task 7.
- URL do site: `https://brotherstechcell-orcamento.vercel.app`.
- Ícone SVG do WhatsApp: sempre o mesmo path já usado em todo o site — `d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."` (path completo nas tasks abaixo).

---

### Task 1: Exportar `CONFIG` de `prices.js`

**Files:**
- Modify: `src/scripts/prices.js` (última linha)

**Interfaces:**
- Produces: `export { CONFIG };` — permite `import { CONFIG } from '../scripts/prices.js'` em código de build-time (Astro frontmatter), sem alterar o comportamento no browser.

- [ ] **Step 1: Adicionar o export**

O arquivo termina hoje com:
```js
window.CONFIG = CONFIG;
```

Adicionar logo abaixo:
```js
window.CONFIG = CONFIG;
export { CONFIG };
```

- [ ] **Step 2: Verificar**

Run: `tail -3 src/scripts/prices.js`
Expected:
```
window.CONFIG = CONFIG;
export { CONFIG };
```

Run: `npx astro build 2>&1 | tail -20`
Expected: build continua funcionando sem erros (o `export` adicional não quebra o uso existente como script de browser, já que `<script src="...">` no Astro processa o arquivo como módulo ES — `export` é sintaticamente válido e simplesmente ignorado quando não importado por ninguém ainda).

- [ ] **Step 3: Commit**

```bash
git add src/scripts/prices.js
git commit -m "feat: export CONFIG from prices.js for build-time model pricing access"
```

---

### Task 2: Criar `src/data/modelPages.ts`

**Files:**
- Create: `src/data/modelPages.ts`

**Interfaces:**
- Consumes: `CONFIG` de `../scripts/prices.js` (Task 1); `services`, `ServiceFaqItem` de `./services` (Etapa 2, já existe).
- Produces: `interface ModelPricingTier { price: string; installment: string }`; `interface ModelPageData { modelName, modelSlug, serviceSlug, serviceName, title, description, economica, premium, symptoms, faq, whatsappMessage }`; `function slugifyModel(model: string): string`; `function getModelNames(): string[]`; `function getAllModelPages(): ModelPageData[]`. Todas as tasks seguintes consomem esses tipos/funções.

- [ ] **Step 1: Criar o arquivo**

Create `src/data/modelPages.ts`:
```typescript
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
```

- [ ] **Step 2: Verificar**

Run:
```bash
node --experimental-strip-types -e "
import('./src/data/modelPages.ts').then(m => {
  const pages = m.getAllModelPages();
  console.log('total pages:', pages.length);
  console.log('unique model slugs:', new Set(m.getModelNames().map(m.slugifyModel)).size);
  const sample = pages.find(p => p.modelName === '13' && p.serviceSlug === 'troca-de-tela');
  console.log('sample:', JSON.stringify(sample, null, 2));
});
"
```
Expected: `total pages: 78`, `unique model slugs: 39`, e o `sample` mostra um objeto com `economica`/`premium` preenchidos com preços reais (não `undefined`), e a resposta da pergunta "Quanto custa..." no `faq` contendo o preço real (não o texto genérico "a partir de R$249,90... consulte").

- [ ] **Step 3: Commit**

```bash
git add src/data/modelPages.ts
git commit -m "feat: add model page data builder combining real pricing with service content"
```

---

### Task 3: Criar `src/components/ModelHero.astro`

**Files:**
- Create: `src/components/ModelHero.astro`

**Interfaces:**
- Consumes: prop `page: ModelPageData` (Task 2) — usa `page.serviceName`, `page.modelName`, `page.serviceSlug`, `page.economica`, `page.premium`, `page.whatsappMessage`.

- [ ] **Step 1: Criar o componente**

Create `src/components/ModelHero.astro`:
```astro
---
import type { ModelPageData } from '../data/modelPages';

interface Props {
  page: ModelPageData;
}

const { page } = Astro.props;
const serviceLabel = page.serviceSlug === 'troca-de-tela' ? 'troca de tela' : 'troca de bateria';
---
<section class="model-hero-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Preço Real</span>
      <h1 class="section-title type-h2-44">{page.serviceName} - iPhone {page.modelName} em Manaus</h1>
      <p class="section-subtitle type-subheading-20">
        Consulte o preço exato da {serviceLabel} do seu iPhone {page.modelName}, com delivery gratuito e garantia
        real em Manaus.
      </p>
    </div>
    <div class="other-services-cta-card" style="max-width: 600px; margin: 0 auto;">
      <div class="cta-glow"></div>
      <div class="cta-card-inner">
        <h4 class="type-heading-16">Econômica: R${page.economica.price}</h4>
        <p class="type-small-body">{page.economica.installment}</p>
        <h4 class="type-heading-16" style="margin-top: 16px;">Premium: R${page.premium.price}</h4>
        <p class="type-small-body">{page.premium.installment}</p>
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

- [ ] **Step 2: Verificar**

Run: `grep -c "<h1" src/components/ModelHero.astro`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/components/ModelHero.astro
git commit -m "feat: add ModelHero component with real per-model pricing"
```

---

### Task 4: Criar `src/components/ModelCrossLinks.astro`

**Files:**
- Create: `src/components/ModelCrossLinks.astro`

**Interfaces:**
- Consumes: props `modelSlug: string`, `currentServiceSlug: "troca-de-tela" | "troca-de-bateria"`.

- [ ] **Step 1: Criar o componente**

Create `src/components/ModelCrossLinks.astro`:
```astro
---
interface Props {
  modelSlug: string;
  currentServiceSlug: "troca-de-tela" | "troca-de-bateria";
}

const { modelSlug, currentServiceSlug } = Astro.props;
const otherServiceSlug = currentServiceSlug === "troca-de-tela" ? "troca-de-bateria" : "troca-de-tela";
const otherServiceLabel = otherServiceSlug === "troca-de-tela" ? "Troca de Tela" : "Troca de Bateria";
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
      <li class="footer-link-item"><a href={`/iphone-${modelSlug}/${otherServiceSlug}`}>{otherServiceLabel} deste modelo</a></li>
      <li class="footer-link-item"><a href={`/servicos/${currentServiceSlug}`}>Ver todos os modelos</a></li>
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "footer-link-item" src/components/ModelCrossLinks.astro`
Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add src/components/ModelCrossLinks.astro
git commit -m "feat: add ModelCrossLinks component"
```

---

### Task 5: Criar `src/components/ModelDirectory.astro`

**Files:**
- Create: `src/components/ModelDirectory.astro`

**Interfaces:**
- Consumes: prop `serviceSlug: "troca-de-tela" | "troca-de-bateria"`; importa `getModelNames`, `slugifyModel` de `../data/modelPages` (Task 2).

- [ ] **Step 1: Criar o componente**

Create `src/components/ModelDirectory.astro`:
```astro
---
import { getModelNames, slugifyModel } from '../data/modelPages';

interface Props {
  serviceSlug: "troca-de-tela" | "troca-de-bateria";
}

const { serviceSlug } = Astro.props;
const modelNames = getModelNames();
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
      {modelNames.map((name) => (
        <li class="footer-link-item"><a href={`/iphone-${slugifyModel(name)}/${serviceSlug}`}>iPhone {name}</a></li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run:
```bash
grep -c "import { getModelNames, slugifyModel }" src/components/ModelDirectory.astro
grep -c "getModelNames()" src/components/ModelDirectory.astro
grep -c "slugifyModel(name)" src/components/ModelDirectory.astro
```
Expected: `1` em cada um dos três comandos (import presente, e as duas funções são de fato chamadas no corpo do componente).

- [ ] **Step 3: Commit**

```bash
git add src/components/ModelDirectory.astro
git commit -m "feat: add ModelDirectory component"
```

---

### Task 6: Criar `src/pages/iphone-[model]/[service].astro`

**Files:**
- Create: `src/pages/iphone-[model]/[service].astro`

**Interfaces:**
- Consumes: `getAllModelPages`, `ModelPageData` (Task 2); `ModelHero` (Task 3); `ModelCrossLinks` (Task 4); `ServiceSymptoms`, `TrustFacts`, `ServiceFaq`, `CtaFinal`, `Header`, `Footer`, `FloatingWhatsapp`, `BottomNav`, `BaseLayout` (já existentes desde a Etapa 1/2, sem alteração).

- [ ] **Step 1: Criar a rota dupla dinâmica**

Create `src/pages/iphone-[model]/[service].astro`:
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
  extraJsonLd={[serviceJsonLd, faqJsonLd, breadcrumbJsonLd]}
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

Nota: a ordem `prices.js` antes de `main.js` é obrigatória (mesma regra das etapas anteriores).

- [ ] **Step 2: Verificar que o build gera as 78 páginas**

Run: `rm -rf dist && npx astro build 2>&1 | tail -30`
Expected: build termina com sucesso.

Run: `find dist/iphone-* -name "index.html" | wc -l`
Expected: `78`

Run: `cat dist/iphone-13/troca-de-tela/index.html | grep -o '<h1[^>]*>[^<]*'`
Expected: mostra "Troca de Tela de iPhone - iPhone 13 em Manaus" (ou texto equivalente com o preço real, não genérico).

- [ ] **Step 3: Commit**

```bash
git add "src/pages/iphone-[model]/[service].astro"
git commit -m "feat: add dynamic /iphone-[model]/[service] pages with real per-model pricing"
```

---

### Task 7: Adicionar `ModelDirectory` nas páginas de serviço com preço fixo

**Files:**
- Modify: `src/pages/servicos/[slug].astro`

**Interfaces:**
- Consumes: `ModelDirectory` (Task 5).

- [ ] **Step 1: Adicionar o import**

Em `src/pages/servicos/[slug].astro`, logo após a linha `import OtherServicesList from '../../components/OtherServicesList.astro';` (linha 9 do arquivo atual), adicionar:
```astro
import ModelDirectory from '../../components/ModelDirectory.astro';
```

- [ ] **Step 2: Renderizar condicionalmente**

O arquivo hoje tem, dentro de `<main>`:
```astro
    <ServicePricing hasFixedPricing={service.hasFixedPricing} whatsappMessage={service.whatsappMessage} />
    <TrustFacts />
```

Trocar por:
```astro
    <ServicePricing hasFixedPricing={service.hasFixedPricing} whatsappMessage={service.whatsappMessage} />
    {service.hasFixedPricing && <ModelDirectory serviceSlug={service.slug as "troca-de-tela" | "troca-de-bateria"} />}
    <TrustFacts />
```

Isso garante que a seção "Escolha seu Modelo" só aparece nas 2 páginas com preço fixo (troca-de-tela, troca-de-bateria) — as outras 5 páginas de serviço permanecem exatamente como estão.

- [ ] **Step 3: Verificar**

Run: `rm -rf dist && npx astro build 2>&1 | tail -20`
Expected: build com sucesso.

Run: `grep -c "Escolha seu Modelo" dist/servicos/troca-de-tela/index.html dist/servicos/troca-de-bateria/index.html`
Expected: `1` em cada um dos dois arquivos.

Run: `grep -c "Escolha seu Modelo" dist/servicos/tampa-traseira/index.html dist/servicos/camera/index.html dist/servicos/dock/index.html dist/servicos/face-id/index.html dist/servicos/reparo-em-placa/index.html`
Expected: `0` em cada um dos cinco (a seção não deve aparecer nas páginas sem preço fixo).

Run: `git diff --stat HEAD~6..HEAD -- src/pages/servicos/\[slug\].astro`
(ajuste o número de commits atrás conforme necessário — o objetivo é confirmar que a única mudança nesse arquivo desde o início desta etapa é a adição do import + da linha condicional, nada mais)
Expected: um diff pequeno, só as 2 linhas adicionadas.

- [ ] **Step 4: Commit**

```bash
git add "src/pages/servicos/[slug].astro"
git commit -m "feat: add model directory section to tela/bateria service pages"
```

---

### Task 8: Verificação final

**Files:** nenhum arquivo novo — task de verificação.

- [ ] **Step 1: Confirmar as 78 páginas com preços distintos**

Run:
```bash
node -e "
const fs = require('fs');
const a = fs.readFileSync('dist/iphone-13/troca-de-tela/index.html', 'utf8');
const b = fs.readFileSync('dist/iphone-14-pro-max/troca-de-tela/index.html', 'utf8');
const extractPrice = (html) => html.match(/Econômica: R\\\$[\\d.,]+/)?.[0];
console.log('iPhone 13 tela:', extractPrice(a));
console.log('iPhone 14 Pro Max tela:', extractPrice(b));
console.log('São diferentes?', extractPrice(a) !== extractPrice(b));
"
```
Expected: dois preços diferentes impressos, `São diferentes? true` (a menos que os dois modelos realmente tenham o mesmo preço configurado — se `false`, verifique manualmente em `CONFIG.devices` se os preços realmente são iguais antes de tratar como falha).

- [ ] **Step 2: Validar JSON-LD em 3 páginas de modelo escolhidas**

Run:
```bash
node -e "
const fs = require('fs');
const paths = ['dist/iphone-13/troca-de-tela/index.html', 'dist/iphone-se-2-3/troca-de-bateria/index.html', 'dist/iphone-17-pro-max/troca-de-tela/index.html'];
for (const p of paths) {
  const html = fs.readFileSync(p, 'utf8');
  const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
  let m, types = [];
  while ((m = re.exec(html))) types.push(JSON.parse(m[1])['@type']);
  console.log(p, '->', types.join(', '));
}
"
```
Expected: `Service, FAQPage, BreadcrumbList` para as 3.

- [ ] **Step 3: Confirmar sitemap inclui as 78 URLs**

Run: `grep -o 'iphone-[a-z0-9-]*/troca-de-[a-z]*' dist/sitemap-0.xml | sort -u | wc -l`
Expected: `78`

- [ ] **Step 4: Confirmar que nenhuma página de serviço sem preço fixo foi alterada além do esperado**

Run: `git diff --stat "$(git merge-base main HEAD)"..HEAD -- src/pages/index.astro src/components/Header.astro src/components/Hero.astro src/components/ReelsShowcase.astro src/components/Diferenciais.astro src/components/ComoFunciona.astro src/components/PricingSelector.astro src/components/ComparativoTelas.astro src/components/DiagnosticForm.astro src/components/Sobre.astro src/components/Faq.astro src/components/CtaFinal.astro src/components/Footer.astro src/components/FloatingWhatsapp.astro src/components/BottomNav.astro src/layouts/BaseLayout.astro src/components/ServiceHero.astro src/components/ServiceSymptoms.astro src/components/ServicePricing.astro src/components/ServiceFaq.astro src/components/OtherServicesList.astro src/components/TrustFacts.astro src/data/services.ts`

(nota: como o trabalho é commitado direto na `main`, sem branch separada, `git merge-base main HEAD` pode resultar em `HEAD` — nesse caso, use o commit anterior ao início desta etapa como base, similar ao ajuste já feito na verificação final da Etapa 2.)

Expected: saída vazia (nenhum desses arquivos foi tocado por esta etapa, exceto o que a Task 7 explicitamente mudou em `[slug].astro`, que não está nesta lista de verificação).

- [ ] **Step 5: Preview manual (checagem automatizada, sem navegador)**

Run: `npx astro preview --port 4324 &` e depois `curl -s http://localhost:4324/iphone-15-pro/troca-de-bateria/ | grep -o "<h1[^>]*>[^<]*"`. Encerre o preview depois (`kill %1`).

**Nota (mesma limitação das etapas anteriores):** nenhum navegador está disponível neste ambiente. Recomenda-se um teste manual no preview do Vercel antes do sign-off final, cobrindo: clique no CTA do WhatsApp de uma página de modelo (confirmar que a mensagem menciona o modelo certo), navegação entre tela↔bateria do mesmo modelo, e a seção "Escolha seu Modelo" nas páginas de serviço.
