# Migração para Astro — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** Migrar o site atual (Vite + Tailwind v4 + JS puro, uma única `index.html`) para Astro, preservando 100% do visual e do comportamento, e preparando a base (layout, componentes, sitemap automático) para as próximas etapas do plano de SEO (páginas de serviço, páginas por modelo, blog).

**Arquitetura:** `index.html` é decomposto em um `BaseLayout.astro` (head/SEO) + ~15 componentes `.astro` (um por seção visual), montados em `src/pages/index.astro`. `main.js` e `prices.js` migram para `src/scripts/` praticamente sem alteração e continuam sendo carregados como scripts globais (não são divididos por componente, pois manipulam elementos de várias seções ao mesmo tempo). Saída 100% estática (`output: 'static'`), sem adapter — o Vercel continua servindo `dist/` como hoje.

**Tech Stack:** Astro 5, `@astrojs/sitemap`, `@tailwindcss/vite` (já em uso), Node 24 (já instalado).

## Global Constraints

- Nenhuma mudança visual ou de comportamento é permitida nesta etapa (ver `docs/superpowers/specs/2026-07-24-migracao-astro-design.md`, seção "Escopo desta etapa").
- A ordem de carregamento dos scripts deve continuar `prices.js` antes de `main.js` — `prices.js` define `window.CONFIG = CONFIG` na última linha (`js/prices.js:884`), e `main.js` depende dessa variável global (`js/main.js:11`, `js/main.js:441`, `js/main.js:925`).
- O texto do FAQ no JSON-LD (`FAQPage`) deve continuar idêntico ao texto visível no componente `Faq.astro` — nenhuma divergência entre o schema e o conteúdo renderizado.
- URL do site para `astro.config.mjs` (`site:`) e para o sitemap: `https://brotherstechcell-orcamento.vercel.app` (domínio definitivo `brotherstechcell.com.br` ainda não está no ar).
- Todas as referências de código-fonte abaixo (`index.html:N`) apontam para o arquivo **atual**, já com as mudanças de SEO da etapa técnica anterior (canonical, JSON-LD, footer com horário/Manaus-AM).

---

### Task 1: Instalar e configurar o Astro

**Files:**
- Modify: `package.json`
- Create: `astro.config.mjs`
- Modify (move): `assets/` → `public/assets/`
- Modify (move): `Logo Brotherstechcell.jpeg` → `public/Logo Brotherstechcell.jpeg`
- Create: `src/pages/index.astro` (placeholder temporário)

**Interfaces:**
- Produces: `public/assets/*` (vídeos e imagens estáticas, referenciadas por caminho absoluto `/assets/...` nas próximas tasks), `public/Logo Brotherstechcell.jpeg` (referenciada como `/Logo Brotherstechcell.jpeg`).

- [ ] **Step 1: Instalar dependências**

Run: `npm install astro @astrojs/sitemap`
Expected: adiciona `astro` e `@astrojs/sitemap` em `dependencies` no `package.json`, sem erros.

- [ ] **Step 2: Mover assets estáticos para `public/`**

Run:
```bash
mkdir -p public/assets
git mv assets/hero-iphone-disassembly.mp4 public/assets/
git mv assets/troca-tela-iphone-13.mp4 public/assets/
git mv assets/delivery-dose-dupla.mp4 public/assets/
git mv "Logo Brotherstechcell.jpeg" "public/Logo Brotherstechcell.jpeg"
```

Expected: `public/assets/` contém os 3 vídeos; `public/Logo Brotherstechcell.jpeg` existe na raiz de `public/`. `assets/icone-tela.jpg`, `assets/icone-bateria.jpg`, `assets/repaired-iphone.png` e `assets/shattered-iphone.png` **permanecem em `assets/`** (na raiz do projeto) — eles continuam sendo importados via `import` no JS (Task 3), não como arquivos estáticos servidos diretamente.

- [ ] **Step 3: Criar `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://brotherstechcell-orcamento.vercel.app',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/inspiracoes/**', '**/*.mp4'],
      },
    },
  },
});
```

- [ ] **Step 4: Atualizar scripts do `package.json`**

Substituir o bloco `"scripts"` atual por:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview"
}
```

- [ ] **Step 5: Criar página placeholder**

Create `src/pages/index.astro`:
```astro
<h1>Migração em andamento</h1>
```

- [ ] **Step 6: Verificar que o Astro sobe**

Run: `npx astro dev --port 4321 &` (ou rodar em terminal separado), depois `curl -s http://localhost:4321/ | grep "Migração em andamento"`
Expected: a string aparece na resposta. Encerrar o processo depois (`kill %1` ou Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold astro project structure"
```

---

### Task 2: Criar `BaseLayout.astro` (SEO + head + estilos globais)

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Modify (move): `css/styles.css` → `src/styles/styles.css`

**Interfaces:**
- Consumes: nada (primeira peça reutilizável).
- Produces: `BaseLayout.astro` aceita as props `title: string`, `description: string`, `canonicalPath: string` (ex: `/`), e renderiza um `<slot />` no `<body>` entre o header (adicionado na Task 4) e o restante do conteúdo. Componentes futuros que precisem inserir JSON-LD adicional recebem uma prop opcional `extraJsonLd: string[]` (array de strings JSON já serializadas, injetadas como `<script type="application/ld+json">` extras).

- [ ] **Step 1: Mover o CSS**

Run:
```bash
mkdir -p src/styles
git mv css/styles.css src/styles/styles.css
```

- [ ] **Step 2: Criar o layout**

O `<head>` deve reproduzir exatamente o conteúdo de `index.html:1-193` (título, meta description, robots, canonical, OG, Twitter Card, e os dois blocos `<script type="application/ld+json">` — `ElectronicsStore` e `FAQPage`), adaptado para receber `title`/`description`/`canonicalPath` como props em vez de valores fixos, e para aceitar `extraJsonLd` opcional.

Create `src/layouts/BaseLayout.astro`:
```astro
---
import '../styles/styles.css';

interface Props {
  title: string;
  description: string;
  canonicalPath: string;
  ogDescription?: string;
  extraJsonLd?: string[];
}

const { title, description, canonicalPath, ogDescription, extraJsonLd = [] } = Astro.props;
const socialDescription = ogDescription ?? description;
const siteUrl = 'https://brotherstechcell-orcamento.vercel.app';
const canonicalUrl = new URL(canonicalPath, siteUrl).toString();
const ogImageUrl = new URL('/og-image.png', siteUrl).toString();
---
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta name="google-site-verification" content="WndbJR-QXJNCwGbGdOiNh35Sm1i2d1Ah6Oml1o_nd8o" />
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <title>{title}</title>
  <meta name="description" content={description}>
  <meta name="robots" content="follow, index">
  <link rel="canonical" href={canonicalUrl}>

  <link rel="icon" type="image/jpeg" href="/Logo Brotherstechcell.jpeg">
  <link rel="apple-touch-icon" href="/Logo Brotherstechcell.jpeg">

  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="website">
  <meta property="og:url" content={canonicalUrl}>
  <meta property="og:title" content={title}>
  <meta property="og:description" content={socialDescription}>
  <meta property="og:site_name" content="Brothers Techcell">
  <meta property="og:image" content={ogImageUrl}>
  <meta property="og:image:alt" content="iPhone reparado pela Brothers Techcell em Manaus">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content={title}>
  <meta name="twitter:description" content={socialDescription}>
  <meta name="twitter:image" content={ogImageUrl}>

  {extraJsonLd.map((json) => (
    <script type="application/ld+json" set:html={json} />
  ))}
</head>

<body>
  <div class="mesh-glow-left"></div>
  <div class="mesh-glow-right"></div>
  <slot />
</body>

</html>
```

Nota: os blocos JSON-LD de `ElectronicsStore` e `FAQPage` (hoje fixos em `index.html:43-192`) **não** ficam hardcoded aqui — eles são passados via `extraJsonLd` pela página (Task 15), com o `ElectronicsStore` centralizado (reutilizável em toda página futura) e o `FAQPage` gerado dentro do componente `Faq.astro` (Task 13), para nunca divergir do texto visível.

- [ ] **Step 3: Verificar renderização do head**

Atualizar temporariamente `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout
  title="Assistência Técnica iPhone Delivery Manaus | Brothers Techcell"
  description="Assistência Técnica Delivery de iPhone em Manaus. Troca de tela e bateria em poucos minutos na sua frente onde você estiver. Peças premium com garantia real."
  canonicalPath="/"
>
  <h1>Migração em andamento</h1>
</BaseLayout>
```

Run: `npx astro build && grep -o '<link rel="canonical"[^>]*>' dist/index.html`
Expected: `<link rel="canonical" href="https://brotherstechcell-orcamento.vercel.app/">`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add BaseLayout with SEO head"
```

---

### Task 3: Migrar `main.js` e `prices.js`

**Files:**
- Modify (move): `js/main.js` → `src/scripts/main.js`
- Modify (move): `js/prices.js` → `src/scripts/prices.js`

**Interfaces:**
- Consumes: nada de novo — os `import` internos em `main.js:6-7` precisam apontar para `assets/` na raiz do projeto (Task 1, Step 2). **Correção pós-implementação:** o caminho original `../assets/icone-tela.jpg` resolvia para `src/assets/` (inexistente) a partir de `src/scripts/`; o caminho correto é `../../assets/icone-tela.jpg` (dois níveis acima: scripts → src → raiz). Esse bug só foi detectado na Task 15 (quando o build foi de fato executado com os componentes montados) e corrigido no commit `dbbbc08`.
- Produces: `src/scripts/prices.js` expõe `window.CONFIG` (linha final, sem alteração). `src/scripts/main.js` continua dependendo de `window.CONFIG` e de elementos DOM por `id`/`class` que serão recriados nas próximas tasks.

- [ ] **Step 1: Mover os arquivos**

Run:
```bash
mkdir -p src/scripts
git mv js/prices.js src/scripts/prices.js
git mv js/main.js src/scripts/main.js
```

- [ ] **Step 2: Verificar que os imports internos continuam válidos**

Run: `grep -n "from '../../assets" src/scripts/main.js`
Expected:
```
6:import iconeTelaSrc from '../../assets/icone-tela.jpg';
7:import iconeBateriaSrc from '../../assets/icone-bateria.jpg';
```
(Caminho relativo correto: `src/scripts/main.js` → `../../assets/` → `assets/` na raiz do projeto — dois níveis acima, não um. Ver correção pós-implementação acima.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: move main.js and prices.js to src/scripts"
```

(Os scripts só são conectados ao HTML na Task 15, quando `index.astro` é montado — não é possível testar o comportamento JS isoladamente antes disso.)

---

### Task 4: Criar `Header.astro`, `FloatingWhatsapp.astro` e `BottomNav.astro`

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/FloatingWhatsapp.astro`
- Create: `src/components/BottomNav.astro`

**Interfaces:**
- Consumes: nenhuma prop — portas estáticas 1:1 do HTML atual.
- Produces: nenhuma interface nova; são consumidos por `index.astro` na Task 15.

- [ ] **Step 1: Criar `Header.astro`**

Copiar o conteúdo de `index.html:201-225` (a tag `<header class="header-main">` completa) para dentro de `src/components/Header.astro`, sem nenhuma alteração de markup, com uma única mudança: o `src="Logo Brotherstechcell.jpeg"` (linha 205) vira `src="/Logo Brotherstechcell.jpeg"` (caminho absoluto, pois o arquivo agora está em `public/`).

- [ ] **Step 2: Criar `FloatingWhatsapp.astro`**

Copiar `index.html:1045-1053` (a `<div class="floating-whatsapp-container">` completa) sem alterações.

- [ ] **Step 3: Criar `BottomNav.astro`**

Copiar `index.html:1055-1090` (a `<nav class="bottom-nav">` completa) sem alterações.

- [ ] **Step 4: Verificar**

Run:
```bash
grep -c "header-main" src/components/Header.astro
grep -c "floating-whatsapp-container" src/components/FloatingWhatsapp.astro
grep -c "bottom-nav" src/components/BottomNav.astro
grep -c 'src="/Logo Brotherstechcell.jpeg"' src/components/Header.astro
```
Expected: cada comando retorna `1` ou mais (confirma que os elementos existem e que o caminho do logo foi corrigido para absoluto).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Header, FloatingWhatsapp and BottomNav components"
```

---

### Task 5: Criar `Hero.astro`

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:229-281` (`<section class="hero-section" id="inicio">` até o `</section>` correspondente) para `src/components/Hero.astro`, sem alterações — não há assets referenciados por caminho relativo nesta seção além do vídeo `assets/hero-iphone-disassembly.mp4` (linha 266), que vira `/assets/hero-iphone-disassembly.mp4`.

- [ ] **Step 2: Verificar**

Run: `grep -n 'id="hero-scroll-video"' src/components/Hero.astro`
Expected: `<video id="hero-scroll-video" src="/assets/hero-iphone-disassembly.mp4" ...>`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Hero component"
```

---

### Task 6: Criar `ReelsShowcase.astro`

**Files:**
- Create: `src/components/ReelsShowcase.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:283-424` (`<section id="transparencia" class="transparency-section">` até `</section>`, incluindo a `trust-stats-bar` interna) para `src/components/ReelsShowcase.astro`. Ajustar os dois `<video src="assets/...">` (linhas 300 e 330) para `/assets/troca-tela-iphone-13.mp4` e `/assets/delivery-dose-dupla.mp4`.

- [ ] **Step 2: Verificar**

Run: `grep -n 'src="/assets/' src/components/ReelsShowcase.astro`
Expected: 2 linhas, uma para cada vídeo.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ReelsShowcase component"
```

---

### Task 7: Criar `Diferenciais.astro`

**Files:**
- Create: `src/components/Diferenciais.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:426-523` (`<section id="diferenciais">` até `</section>`, incluindo a seção seguinte `trust-shield-section` de Privacidade/Garantia/Anatel) para `src/components/Diferenciais.astro`, sem alterações — não há assets externos nesta seção.

- [ ] **Step 2: Verificar**

Run: `grep -c 'id="diferenciais"' src/components/Diferenciais.astro && grep -c "trust-shield-section" src/components/Diferenciais.astro`
Expected: `1` e `1`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Diferenciais component"
```

---

### Task 8: Criar `ComoFunciona.astro`

**Files:**
- Create: `src/components/ComoFunciona.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:525-561` (`<section id="como-funciona" class="how-it-works-section">` até `</section>`) sem alterações.

- [ ] **Step 2: Verificar**

Run: `grep -c 'id="como-funciona"' src/components/ComoFunciona.astro`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ComoFunciona component"
```

---

### Task 9: Criar `PricingSelector.astro`

**Files:**
- Create: `src/components/PricingSelector.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:563-644` (`<section id="telas-precos">` até `</section>`) sem alterações — os elementos `#device-search-select` e `#selector-results-grid` são preenchidos dinamicamente por `main.js`, não há markup adicional a portar.

- [ ] **Step 2: Verificar**

Run: `grep -c 'id="device-search-select"' src/components/PricingSelector.astro && grep -c 'id="selector-results-grid"' src/components/PricingSelector.astro`
Expected: `1` e `1`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add PricingSelector component"
```

---

### Task 10: Criar `ComparativoTelas.astro`

**Files:**
- Create: `src/components/ComparativoTelas.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:646-715` (`<section id="comparativo-telas" class="comparison-section">` até `</section>`) sem alterações.

- [ ] **Step 2: Verificar**

Run: `grep -c 'id="comparativo-telas"' src/components/ComparativoTelas.astro`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ComparativoTelas component"
```

---

### Task 11: Criar `DiagnosticForm.astro`

**Files:**
- Create: `src/components/DiagnosticForm.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:717-788` (`<section id="diagnostico-wizard" class="diagnostic-section">` até `</section>`) sem alterações — `#diagnostic-device-select` e `#btn-submit-diagnostic` são manipulados por `main.js`.

- [ ] **Step 2: Verificar**

Run: `grep -c 'id="diagnostico-wizard"' src/components/DiagnosticForm.astro`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add DiagnosticForm component"
```

---

### Task 12: Criar `Sobre.astro`

**Files:**
- Create: `src/components/Sobre.astro`

- [ ] **Step 1: Copiar a seção**

Copiar `index.html:792-852` (`<section id="sobre" class="about-section">` até `</section>`) sem alterações.

- [ ] **Step 2: Verificar**

Run: `grep -c 'id="sobre"' src/components/Sobre.astro`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Sobre component"
```

---

### Task 13: Criar `Faq.astro` (com o texto que alimenta o JSON-LD `FAQPage`)

**Files:**
- Create: `src/components/Faq.astro`

**Interfaces:**
- Produces: exporta uma constante `faqItems` (array de `{ question: string, answer: string }`) usada por `index.astro` (Task 15) para montar o JSON-LD `FAQPage` — evitando que o texto do schema divirja do texto visível, conforme exigido nas Global Constraints.

- [ ] **Step 1: Criar o componente**

Copiar `index.html:854-936` (`<section class="faq-section" id="faq">` até `</section>`, os 5 itens de FAQ) para o corpo do componente, e adicionar no frontmatter a lista `faqItems` com o texto **em texto plano** (sem tags HTML) de cada resposta, correspondente ao JSON-LD atual (`index.html:150-190`):

```astro
---
export const faqItems = [
  {
    question: "Qual é a garantia das telas e baterias?",
    answer: "Qualidade Premium: Garantia de 90 dias. Qualidade Intermediária: Garantia de 30 dias. Qualidade Básica: Garantia de 7 dias. Todas as peças são de alta performance com certificação."
  },
  {
    question: "Quanto tempo leva o reparo?",
    answer: "A maioria dos reparos de tela e bateria é concluída em 20 a 40 minutos, diretamente na sua frente, onde você estiver em Manaus."
  },
  {
    question: "Vocês cobram taxa de deslocamento?",
    answer: "Não cobramos taxa de deslocamento para a maioria dos bairros de Manaus. Nosso serviço delivery é totalmente gratuito na maioria das regiões."
  },
  {
    question: "Em quantas vezes posso parcelar?",
    answer: "Você pode parcelar em até 12x no cartão de crédito. Também aceitamos Pix com desconto especial."
  },
  {
    question: "Como funciona o atendimento delivery?",
    answer: "Basta agendar pelo WhatsApp. Nosso técnico especializado vai até sua casa, escritório ou local de preferência, realiza o reparo na sua frente com total transparência e segurança."
  }
];
---
<!-- conteúdo copiado de index.html:854-936 -->
```

- [ ] **Step 2: Verificar**

Run: `node -e "const fs=require('fs'); const m=fs.readFileSync('src/components/Faq.astro','utf8').match(/question: \"(.*?)\"/g); console.log(m.length)"`
Expected: `5`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Faq component with schema-ready faqItems"
```

---

### Task 14: Criar `CtaFinal.astro` e `Footer.astro`

**Files:**
- Create: `src/components/CtaFinal.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Criar `CtaFinal.astro`**

Copiar `index.html:938-954` (`<section class="cta-section">` até `</section>`) sem alterações.

- [ ] **Step 2: Criar `Footer.astro`**

Copiar `index.html:957-1043` (`<footer class="footer-main">` até `</footer>`) para `src/components/Footer.astro`, ajustando o `src="Logo Brotherstechcell.jpeg"` (linha 962) para `src="/Logo Brotherstechcell.jpeg"`.

- [ ] **Step 3: Verificar**

Run:
```bash
grep -c "cta-section" src/components/CtaFinal.astro
grep -c "footer-main" src/components/Footer.astro
grep -c "Todos os dias, das 8h às 20h" src/components/Footer.astro
grep -c 'src="/Logo Brotherstechcell.jpeg"' src/components/Footer.astro
```
Expected: `1`, `1`, `1`, `1`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add CtaFinal and Footer components"
```

---

### Task 15: Montar `src/pages/index.astro` e configurar o sitemap automático

**Files:**
- Modify: `src/pages/index.astro`
- Delete: `public/sitemap.xml` (substituído pela geração automática)

**Interfaces:**
- Consumes: todos os componentes das Tasks 4–14, `BaseLayout` (Task 2), `faqItems` exportado por `Faq.astro` (Task 13).

- [ ] **Step 1: Montar a página**

Substituir `src/pages/index.astro` por:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import ReelsShowcase from '../components/ReelsShowcase.astro';
import Diferenciais from '../components/Diferenciais.astro';
import ComoFunciona from '../components/ComoFunciona.astro';
import PricingSelector from '../components/PricingSelector.astro';
import ComparativoTelas from '../components/ComparativoTelas.astro';
import DiagnosticForm from '../components/DiagnosticForm.astro';
import Sobre from '../components/Sobre.astro';
import Faq, { faqItems } from '../components/Faq.astro';
import CtaFinal from '../components/CtaFinal.astro';
import Footer from '../components/Footer.astro';
import FloatingWhatsapp from '../components/FloatingWhatsapp.astro';
import BottomNav from '../components/BottomNav.astro';

const electronicsStoreJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  "name": "Brothers Techcell",
  "image": "https://brotherstechcell-orcamento.vercel.app/og-image.png",
  "url": "https://brotherstechcell-orcamento.vercel.app/",
  "telephone": "+5592993951193",
  "email": "contato@brotherstechcell.com.br",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Manaus",
    "addressRegion": "AM",
    "addressCountry": "BR"
  },
  "areaServed": { "@type": "City", "name": "Manaus" },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "08:00",
    "closes": "20:00"
  },
  "sameAs": ["https://www.instagram.com/brothers_techcell/"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Serviços de Assistência Técnica iPhone",
    "itemListElement": [
      "Troca de Tela de iPhone",
      "Troca de Bateria de iPhone",
      "Troca de Tampa Traseira de iPhone",
      "Troca de Câmera de iPhone",
      "Troca de Dock (Conector de Carga) de iPhone",
      "Reparo de Face ID de iPhone",
      "Reparo em Placa de iPhone"
    ].map((name) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        name,
        "areaServed": "Manaus",
        "provider": { "@type": "ElectronicsStore", "name": "Brothers Techcell" }
      }
    }))
  }
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(({ question, answer }) => ({
    "@type": "Question",
    "name": question,
    "acceptedAnswer": { "@type": "Answer", "text": answer }
  }))
});
---
<BaseLayout
  title="Assistência Técnica iPhone Delivery Manaus | Brothers Techcell"
  description="Assistência Técnica Delivery de iPhone em Manaus. Troca de tela e bateria em poucos minutos na sua frente onde você estiver. Peças premium com garantia real."
  ogDescription="Troca de tela e bateria de iPhone na sua frente, onde você estiver em Manaus. Agende pelo WhatsApp."
  canonicalPath="/"
  extraJsonLd={[electronicsStoreJsonLd, faqJsonLd]}
>
  <Header />
  <main>
    <Hero />
    <ReelsShowcase />
    <Diferenciais />
    <ComoFunciona />
    <PricingSelector />
    <ComparativoTelas />
    <DiagnosticForm />
    <Sobre />
    <Faq />
    <CtaFinal />
  </main>
  <Footer />
  <FloatingWhatsapp />
  <BottomNav />
  <script src="../scripts/prices.js"></script>
  <script src="../scripts/main.js"></script>
</BaseLayout>
```

Nota: a ordem `prices.js` antes de `main.js` é obrigatória (ver Global Constraints).

- [ ] **Step 2: Remover o sitemap manual**

Run: `git rm public/sitemap.xml`
(O `@astrojs/sitemap`, já configurado na Task 1, passa a gerar `sitemap-index.xml` e `sitemap-0.xml` automaticamente a partir das páginas em `src/pages/`.)

- [ ] **Step 3: Verificar que a página monta sem erros**

Run: `npx astro build 2>&1 | tail -30`
Expected: build termina com `✓ Complete` (ou equivalente), sem erros de import ou de sintaxe.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: assemble index.astro from all components, enable automatic sitemap"
```

---

### Task 16: Verificação final completa e limpeza dos arquivos antigos

**Files:**
- Delete: `index.html` (raiz), `vite.config.js`, `js/` (se ainda existir vazio), `css/` (se ainda existir vazio)

**Interfaces:** N/A (task de verificação e limpeza).

- [ ] **Step 1: Build de produção limpo**

Run:
```bash
rm -rf dist
npx astro build 2>&1 | tail -40
ls dist/
```
Expected: `dist/` contém `index.html`, `robots.txt`, `og-image.png`, `sitemap-index.xml`, `sitemap-0.xml`, e a pasta `assets/` (vídeos, CSS/JS com hash, ícones/imagens processadas pelo Vite).

- [ ] **Step 2: Validar o JSON-LD do build final**

Run:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
let m, i = 0;
while ((m = re.exec(html))) {
  i++;
  const parsed = JSON.parse(m[1]);
  console.log('Bloco ' + i + ': ' + parsed['@type']);
}
console.log('Total:', i);
"
```
Expected:
```
Bloco 1: ElectronicsStore
Bloco 2: FAQPage
Total: 2
```

- [ ] **Step 3: Conferir presença de todas as seções no HTML final**

Run:
```bash
for id in inicio transparencia diferenciais como-funciona telas-precos comparativo-telas diagnostico-wizard sobre faq; do
  echo -n "$id: "; grep -c "id=\"$id\"" dist/index.html
done
```
Expected: cada seção retorna `1`.

- [ ] **Step 4: Rodar visualmente no navegador (checagem manual)**

Run: `npx astro preview --port 4322` e abrir `http://localhost:4322/` no navegador.
Checklist manual (comparar com o site antes da migração):
- Vídeo do hero controlado por scroll funciona.
- Os dois vídeos da seção "Veja Como Nós Trabalhamos" tocam ao passar o mouse/scroll.
- Seletor de preços: dropdown de modelos populado, resultados de tela/bateria aparecem ao escolher um modelo, busca dos preços na Supabase funcionando (sem erro no console).
- Comparativo de telas (Básica/Intermediária/Premium) exibido corretamente.
- Formulário de pré-diagnóstico: botões de sintoma alternam estado ativo, botão final gera link `wa.me` com a mensagem certa.
- FAQ: accordion abre/fecha ao clicar.
- Botão flutuante do WhatsApp e dock de navegação mobile aparecem e funcionam.
- Footer mostra telefone, e-mail, Instagram, horário e "Manaus - AM (Atendimento Delivery)".
- Nenhum erro no console do navegador.

- [ ] **Step 5: Remover arquivos antigos do Vite puro**

Run:
```bash
git rm index.html vite.config.js
rmdir js css 2>/dev/null || true
```

- [ ] **Step 6: Build final pós-limpeza**

Run: `rm -rf dist && npx astro build 2>&1 | tail -20`
Expected: build continua funcionando sem referência aos arquivos removidos.

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "chore: remove legacy Vite entry files after Astro migration"
```

---

## Fora de escopo (próximas etapas)

- Páginas de serviço (`/servicos/*`), páginas por modelo (`/iphone-XX/*`), blog — Etapas 2, 3 e 4 do plano de SEO, cada uma com seu próprio design e plano.
- GA4/GTM/Meta Pixel, migração de domínio.
