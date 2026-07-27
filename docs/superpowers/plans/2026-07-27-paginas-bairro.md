# Páginas por Bairro (`/atendimento/{bairro}`) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar 18 páginas (`/atendimento/{bairro}`, uma por bairro de Manaus) com SEO local completo (title/description/canonical, `Service`+`FAQPage`+`BreadcrumbList` JSON-LD, mapa real embutido), sem inventar tempo de deslocamento ou depoimentos.

**Architecture:** Rota dinâmica `src/pages/atendimento/[bairro].astro` com `getStaticPaths()` gerando as 18 páginas a partir de `src/data/neighborhoods.ts`, que computa title/description/FAQ por bairro via template (mesmo padrão usado em `modelPages.ts` na Etapa 3). Três componentes novos (`NeighborhoodHero`, `NeighborhoodMap`, `NeighborhoodServicesList`) reaproveitam classes CSS já existentes. `TrustFacts`, `ServiceFaq`, `CtaFinal`, `Header`, `Footer`, `FloatingWhatsapp`, `BottomNav`, `BaseLayout` são reaproveitados sem alteração.

**Tech Stack:** Astro 7, TypeScript, Google Maps embed sem chave de API (`https://www.google.com/maps?q=...&output=embed`).

## Global Constraints

- 18 bairros exatos, nesta ordem: Adrianópolis, Aleixo, Centro, Dom Pedro, Flores, Parque 10, Alvorada, Cidade Nova, Compensa, Japiim, São José, Ponta Negra, Tarumã, Vieiralves, Educandos, Petrópolis, Zumbi, Coroado.
- Slug: `name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-")` — testado contra os 18 nomes reais, zero colisão (`"Adrianópolis"` → `"adrianopolis"`, `"São José"` → `"sao-jose"`, `"Tarumã"` → `"taruma"`).
- **Nenhum tempo de deslocamento específico por bairro, nenhum depoimento fabricado.** Usa só a frase já verificada "delivery gratuito para a maioria dos bairros de Manaus" e fatos já estabelecidos nas etapas anteriores (garantia 7-90 dias, atendimento 8h-20h, tempo de reparo de tela/bateria 20-40 min).
- Title: `"Assistência iPhone em {Bairro} | Brothers Techcell"` — verificado: 54 caracteres no nome mais longo ("Adrianópolis"), dentro do limite de 60.
- Meta description: `"Assistência técnica especializada em iPhone no bairro {Bairro}, Manaus. Delivery gratuito, garantia real, orçamento pelo WhatsApp."` — verificado: 134 caracteres no pior caso, dentro do limite de 155.
- Mapa: iframe `https://www.google.com/maps?q={encodeURIComponent("{Bairro}, Manaus - AM")}&output=embed` — sem chave de API.
- URL do site: `https://brotherstechcell-orcamento.vercel.app`.
- Nenhuma mudança em páginas já existentes (home, serviços, modelos).
- CSS: nenhuma classe nova — reaproveita `section-header`, `section-label`, `section-title`, `section-subtitle`, `footer-links`, `footer-link-item`, `btn-glow`, `btn-whatsapp-global`, `other-services-cta-card` (se necessário), e a variável `--radius-md` já existente em `src/styles/styles.css`.
- Ícone SVG do WhatsApp: mesmo path já usado em todo o site — `d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."` (path completo na Task 2 abaixo).

---

### Task 1: Criar `src/data/neighborhoods.ts`

**Files:**
- Create: `src/data/neighborhoods.ts`

**Interfaces:**
- Produces: `interface NeighborhoodFaqItem { question: string; answer: string }`; `interface NeighborhoodData { name: string; slug: string; title: string; description: string; mapQuery: string; faq: NeighborhoodFaqItem[] }`; `function slugifyNeighborhood(name: string): string`; `function getAllNeighborhoods(): NeighborhoodData[]`. Todas as tasks seguintes consomem esses tipos/funções.

- [ ] **Step 1: Criar o arquivo**

Create `src/data/neighborhoods.ts`:
```typescript
export interface NeighborhoodFaqItem {
  question: string;
  answer: string;
}

export interface NeighborhoodData {
  name: string;
  slug: string;
  title: string;
  description: string;
  mapQuery: string;
  faq: NeighborhoodFaqItem[];
}

const NEIGHBORHOOD_NAMES: string[] = [
  "Adrianópolis",
  "Aleixo",
  "Centro",
  "Dom Pedro",
  "Flores",
  "Parque 10",
  "Alvorada",
  "Cidade Nova",
  "Compensa",
  "Japiim",
  "São José",
  "Ponta Negra",
  "Tarumã",
  "Vieiralves",
  "Educandos",
  "Petrópolis",
  "Zumbi",
  "Coroado",
];

export function slugifyNeighborhood(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function getAllNeighborhoods(): NeighborhoodData[] {
  return NEIGHBORHOOD_NAMES.map((name) => {
    const slug = slugifyNeighborhood(name);
    const title = `Assistência iPhone em ${name} | Brothers Techcell`;
    const description = `Assistência técnica especializada em iPhone no bairro ${name}, Manaus. Delivery gratuito, garantia real, orçamento pelo WhatsApp.`;
    const mapQuery = `${name}, Manaus - AM`;

    const faq: NeighborhoodFaqItem[] = [
      {
        question: `Vocês atendem no bairro ${name}?`,
        answer: `Sim! Atendemos ${name} e toda a região de Manaus com nosso serviço delivery — o técnico vai até você.`,
      },
      {
        question: `Cobram taxa de deslocamento para atender em ${name}?`,
        answer: `Não cobramos taxa de deslocamento para a maioria dos bairros de Manaus, incluindo ${name}.`,
      },
      {
        question: `Quais serviços vocês fazem em ${name}?`,
        answer: `Fazemos troca de tela, bateria, tampa traseira, câmera, dock, reparo de Face ID e reparo em placa — tudo na sua frente, em ${name} ou onde você estiver.`,
      },
      {
        question: "Quanto tempo demora o atendimento?",
        answer: "A maioria dos reparos de tela e bateria é concluída em 20 a 40 minutos, direto na sua casa ou trabalho.",
      },
      {
        question: `Como agendar o atendimento em ${name}?`,
        answer: "Basta chamar no WhatsApp, informar o modelo do seu iPhone e o serviço desejado — agendamos o horário e enviamos o técnico até você.",
      },
    ];

    return { name, slug, title, description, mapQuery, faq };
  });
}
```

- [ ] **Step 2: Verificar**

Run:
```bash
node --experimental-strip-types -e "
import('./src/data/neighborhoods.ts').then(m => {
  const list = m.getAllNeighborhoods();
  console.log('total:', list.length);
  console.log('unique slugs:', new Set(list.map(n => n.slug)).size);
  console.log('sample slugs:', list.map(n => n.slug).join(', '));
  const adrianopolis = list.find(n => n.name === 'Adrianópolis');
  console.log('title len:', adrianopolis.title.length);
  console.log('desc len:', adrianopolis.description.length);
});
"
```
Expected: `total: 18`, `unique slugs: 18`, slugs incluindo `adrianopolis`, `sao-jose`, `taruma`, `title len` ≤ 60, `desc len` ≤ 155.

- [ ] **Step 3: Commit**

```bash
git add src/data/neighborhoods.ts
git commit -m "feat: add neighborhood data for /atendimento pages"
```

---

### Task 2: Criar `src/components/NeighborhoodHero.astro`

**Files:**
- Create: `src/components/NeighborhoodHero.astro`

**Interfaces:**
- Consumes: prop `neighborhood: NeighborhoodData` (Task 1) — usa `neighborhood.name`.

- [ ] **Step 1: Criar o componente**

Create `src/components/NeighborhoodHero.astro`:
```astro
---
import type { NeighborhoodData } from '../data/neighborhoods';

interface Props {
  neighborhood: NeighborhoodData;
}

const { neighborhood } = Astro.props;
const whatsappMessage = `Olá! Quero agendar um atendimento em ${neighborhood.name}.`;
---
<section class="neighborhood-hero-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Área de Atendimento</span>
      <h1 class="section-title type-h2-44">Assistência Técnica iPhone em {neighborhood.name}, Manaus</h1>
      <p class="section-subtitle type-subheading-20">
        Atendemos {neighborhood.name} com delivery gratuito — o técnico vai até você, faz o reparo na sua frente,
        com peças premium e garantia real.
      </p>
    </div>
    <div class="hero-btn-container" style="justify-content: center; display: flex; margin-top: 24px;">
      <a href="#" class="btn-glow btn-whatsapp-global" data-message={whatsappMessage}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span>AGENDAR NO WHATSAPP</span>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "<h1" src/components/NeighborhoodHero.astro`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/components/NeighborhoodHero.astro
git commit -m "feat: add NeighborhoodHero component"
```

---

### Task 3: Criar `src/components/NeighborhoodMap.astro`

**Files:**
- Create: `src/components/NeighborhoodMap.astro`

**Interfaces:**
- Consumes: prop `mapQuery: string` (de `neighborhood.mapQuery`, Task 1).

- [ ] **Step 1: Criar o componente**

Create `src/components/NeighborhoodMap.astro`:
```astro
---
interface Props {
  mapQuery: string;
}

const { mapQuery } = Astro.props;
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
---
<section class="neighborhood-map-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Localização</span>
      <h2 class="section-title type-h2-44">Onde Atendemos</h2>
    </div>
    <div style="border-radius: var(--radius-md); overflow: hidden; max-width: 900px; margin: 0 auto;">
      <iframe
        src={mapSrc}
        width="100%"
        height="400"
        style="border: 0; display: block;"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title={`Mapa da região de ${mapQuery}`}
      ></iframe>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "maps?q=" src/components/NeighborhoodMap.astro`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/components/NeighborhoodMap.astro
git commit -m "feat: add NeighborhoodMap component"
```

---

### Task 4: Criar `src/components/NeighborhoodServicesList.astro`

**Files:**
- Create: `src/components/NeighborhoodServicesList.astro`

**Interfaces:**
- Consumes: prop `neighborhoodName: string`; importa `services` diretamente de `../data/services` (já existe desde a Etapa 2).

- [ ] **Step 1: Criar o componente**

Create `src/components/NeighborhoodServicesList.astro`:
```astro
---
import { services } from '../data/services';

interface Props {
  neighborhoodName: string;
}

const { neighborhoodName } = Astro.props;
---
<section class="neighborhood-services-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Serviços Disponíveis</span>
      <h2 class="section-title type-h2-44">Atendemos os Seguintes Serviços em {neighborhoodName}</h2>
    </div>
    <ul
      class="footer-links type-link"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; list-style: none; padding: 0; max-width: 900px; margin: 0 auto;"
    >
      {services.map((s) => (
        <li class="footer-link-item"><a href={`/servicos/${s.slug}`}>{s.name}</a></li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "footer-link-item" src/components/NeighborhoodServicesList.astro`
Expected: `1` (template dentro do `.map`, repetição real verificada em runtime na Task 5 — deve gerar 7 links por página, um por serviço).

- [ ] **Step 3: Commit**

```bash
git add src/components/NeighborhoodServicesList.astro
git commit -m "feat: add NeighborhoodServicesList component"
```

---

### Task 5: Criar `src/pages/atendimento/[bairro].astro`

**Files:**
- Create: `src/pages/atendimento/[bairro].astro`

**Interfaces:**
- Consumes: `getAllNeighborhoods`, `NeighborhoodData` (Task 1); `NeighborhoodHero` (Task 2); `NeighborhoodMap` (Task 3); `NeighborhoodServicesList` (Task 4); `TrustFacts`, `ServiceFaq`, `CtaFinal`, `Header`, `Footer`, `FloatingWhatsapp`, `BottomNav`, `BaseLayout` (já existentes, sem alteração).

- [ ] **Step 1: Criar a rota dinâmica**

Create `src/pages/atendimento/[bairro].astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import NeighborhoodHero from '../../components/NeighborhoodHero.astro';
import NeighborhoodMap from '../../components/NeighborhoodMap.astro';
import NeighborhoodServicesList from '../../components/NeighborhoodServicesList.astro';
import TrustFacts from '../../components/TrustFacts.astro';
import ServiceFaq from '../../components/ServiceFaq.astro';
import CtaFinal from '../../components/CtaFinal.astro';
import Footer from '../../components/Footer.astro';
import FloatingWhatsapp from '../../components/FloatingWhatsapp.astro';
import BottomNav from '../../components/BottomNav.astro';
import { getAllNeighborhoods, type NeighborhoodData } from '../../data/neighborhoods';

export function getStaticPaths() {
  return getAllNeighborhoods().map((neighborhood) => ({
    params: { bairro: neighborhood.slug },
    props: { neighborhood },
  }));
}

interface Props {
  neighborhood: NeighborhoodData;
}

const { neighborhood } = Astro.props;
const siteUrl = 'https://brotherstechcell-orcamento.vercel.app';

const serviceJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": `Assistência Técnica iPhone em ${neighborhood.name}`,
  "areaServed": neighborhood.name,
  "provider": { "@type": "ElectronicsStore", "name": "Brothers Techcell" },
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": neighborhood.faq.map(({ question, answer }) => ({
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
    { "@type": "ListItem", "position": 2, "name": `iPhone em ${neighborhood.name}`, "item": `${siteUrl}/atendimento/${neighborhood.slug}` },
  ],
});
---
<BaseLayout
  title={neighborhood.title}
  description={neighborhood.description}
  canonicalPath={`/atendimento/${neighborhood.slug}`}
  extraJsonLd={[serviceJsonLd, faqJsonLd, breadcrumbJsonLd]}
>
  <Header />
  <main>
    <NeighborhoodHero neighborhood={neighborhood} />
    <NeighborhoodMap mapQuery={neighborhood.mapQuery} />
    <NeighborhoodServicesList neighborhoodName={neighborhood.name} />
    <TrustFacts />
    <ServiceFaq faq={neighborhood.faq} />
    <CtaFinal />
  </main>
  <Footer />
  <FloatingWhatsapp />
  <BottomNav />
  <script src="../../scripts/prices.js"></script>
  <script src="../../scripts/main.js"></script>
</BaseLayout>
```

Nota: a ordem `prices.js` antes de `main.js` é obrigatória (mesma regra das etapas anteriores). Nota 2: `ServiceFaq.astro` espera `faq: ServiceFaqItem[]` (tipo de `services.ts`), mas `NeighborhoodFaqItem[]` (tipo de `neighborhoods.ts`) tem exatamente a mesma forma (`{question: string, answer: string}`) — TypeScript aceita por tipagem estrutural, sem precisar de conversão.

- [ ] **Step 2: Verificar que o build gera as 18 páginas**

Run: `rm -rf dist && npx astro build 2>&1 | tail -30`
Expected: build termina com sucesso.

Run: `find dist/atendimento -name "index.html" | wc -l`
Expected: `18`

Run: `cat dist/atendimento/adrianopolis/index.html | grep -o '<h1[^>]*>[^<]*'`
Expected: mostra "Assistência Técnica iPhone em Adrianópolis, Manaus".

- [ ] **Step 3: Commit**

```bash
git add "src/pages/atendimento/[bairro].astro"
git commit -m "feat: add dynamic /atendimento/[bairro] pages"
```

---

### Task 6: Verificação final

**Files:** nenhum arquivo novo — task de verificação.

- [ ] **Step 1: Validar JSON-LD em 3 páginas de bairro escolhidas**

Run:
```bash
node -e "
const fs = require('fs');
const slugs = ['adrianopolis', 'sao-jose', 'taruma'];
for (const slug of slugs) {
  const html = fs.readFileSync('dist/atendimento/' + slug + '/index.html', 'utf8');
  const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
  let m, types = [];
  while ((m = re.exec(html))) types.push(JSON.parse(m[1])['@type']);
  console.log(slug + ':', types.join(', '));
}
"
```
Expected: `Service, FAQPage, BreadcrumbList` para as 3.

- [ ] **Step 2: Confirmar que o FAQ do JSON-LD bate com o texto visível**

Run:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/atendimento/centro/index.html', 'utf8');
const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
let m, faqBlock;
while ((m = re.exec(html))) {
  const parsed = JSON.parse(m[1]);
  if (parsed['@type'] === 'FAQPage') faqBlock = parsed;
}
const firstQuestion = faqBlock.mainEntity[0].name;
console.log('JSON-LD Q1:', firstQuestion);
console.log('Aparece no HTML visível?', html.includes(firstQuestion));
"
```
Expected: `Aparece no HTML visível? true`

- [ ] **Step 3: Confirmar que o mapa aponta pro bairro certo**

Run: `grep -o 'maps?q=[^"&]*' dist/atendimento/ponta-negra/index.html`
Expected: contém `Ponta%20Negra` (ou equivalente codificado) — confirma que o parâmetro de busca do mapa é o bairro correto, não um valor fixo/genérico repetido em todas as páginas.

- [ ] **Step 4: Confirmar que o sitemap inclui as 18 novas URLs**

Run: `cat dist/sitemap-0.xml | grep -o 'atendimento/[a-z0-9-]*' | sort -u | wc -l`
Expected: `18`

- [ ] **Step 5: Confirmar que nenhuma página já existente foi alterada**

Run: `git diff --stat "$(git merge-base main HEAD)"..HEAD -- src/pages/index.astro "src/pages/servicos/[slug].astro" "src/pages/iphone-[model]/[service].astro" src/data/services.ts src/data/modelPages.ts src/layouts/BaseLayout.astro`

(nota: como o trabalho é commitado direto na `main`, sem branch separada, `git merge-base main HEAD` pode resultar em `HEAD` — nesse caso, use o commit anterior ao início desta etapa como base, mesmo ajuste já feito nas verificações finais das etapas anteriores.)

Expected: saída vazia (nenhum arquivo já existente foi tocado por esta etapa).

- [ ] **Step 6: Preview manual (checagem automatizada, sem navegador)**

Run: `npx astro preview --port 4325 &` e depois `curl -s http://localhost:4325/atendimento/flores/ | grep -o "<h1[^>]*>[^<]*"`. Encerre o preview depois (`kill %1`).

**Nota (mesma limitação das etapas anteriores):** nenhum navegador está disponível neste ambiente. Recomenda-se um teste manual no preview do Vercel antes do sign-off final, cobrindo: se o mapa realmente carrega e mostra a região certa (a checagem acima só confirma o parâmetro da URL, não o resultado visual), e o botão do WhatsApp abrindo com a mensagem certa mencionando o bairro.
