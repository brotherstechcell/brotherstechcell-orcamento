# Páginas de Serviço (`/servicos/*`) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar 7 páginas de serviço (`/servicos/troca-de-tela`, `/troca-de-bateria`, `/tampa-traseira`, `/camera`, `/dock`, `/face-id`, `/reparo-em-placa`) geradas a partir de um único template Astro + arquivo de dados, com SEO completo (title/description, canonical, `Service`+`FAQPage`+`BreadcrumbList` JSON-LD) e sem tocar na home existente.

**Architecture:** Rota dinâmica `src/pages/servicos/[slug].astro` com `getStaticPaths()` gerando as 7 páginas no build (`output: 'static'`, sem mudança de config). Um arquivo de dados `src/data/services.ts` centraliza o conteúdo de cada serviço. Componentes novos (`ServiceHero`, `ServiceSymptoms`, `ServicePricing`, `TrustFacts`, `ServiceFaq`, `OtherServicesList`) reaproveitam classes CSS e o SVG do WhatsApp já existentes em `src/styles/styles.css`/outros componentes — nenhuma CSS nova é escrita. `Header`, `Footer`, `FloatingWhatsapp`, `BottomNav`, `CtaFinal`, `BaseLayout` são reaproveitados sem alteração.

**Tech Stack:** Astro 7 (já instalado), TypeScript para o arquivo de dados, mesmos scripts globais `src/scripts/{prices.js,main.js}` (funcionam automaticamente nas novas páginas, sem alteração — ambos já são defensivos: `initPricingSelector()` e `setupDiagnosticWizard()` fazem early-return quando os elementos daquelas seções não existem na página, e `setupFaqAccordion()`/os handlers de `.btn-whatsapp-global` usam `querySelectorAll` global, funcionando em qualquer página que tenha esses elementos).

## Global Constraints

- Nenhuma mudança visual, estrutural ou de conteúdo na home (`src/pages/index.astro` e seus componentes existentes permanecem intocados).
- Troca de Tela e Troca de Bateria usam dados reais de preço (`R$249,90` a `R$1.299,90` para tela, `R$249,90` a `R$749,90` para bateria, conforme `CONFIG.devices` em `src/scripts/prices.js`); os outros 5 serviços tratam preço e tempo como "sob consulta via WhatsApp" — nenhum número deve ser inventado para eles.
- Texto do FAQPage JSON-LD de cada página deve ser idêntico ao texto visível no FAQ daquela página (mesmo padrão usado em `Faq.astro`/`src/pages/index.astro` na Etapa 1).
- URL do site para canonical/OG/sitemap: `https://brotherstechcell-orcamento.vercel.app` (domínio definitivo ainda não está no ar).
- `output: 'static'` — nenhuma mudança em `astro.config.mjs` é necessária; o `@astrojs/sitemap` já configurado detecta as novas páginas automaticamente.
- CSS: nenhuma classe nova é adicionada a `src/styles/styles.css` — todos os componentes novos reaproveitam classes já existentes (`section-header`, `section-label`, `section-title`, `section-subtitle`, `other-services-bullets`, `other-services-cta-card`, `cta-glow`, `cta-card-inner`, `trust-shield-wrapper`, `trust-shield-card`, `faq-list`, `faq-item`, `faq-question`, `faq-answer`, `footer-links`, `footer-link-item`, `btn-glow`, `btn-whatsapp-global`).
- Ícone SVG do WhatsApp: sempre o mesmo path já usado em todo o site — `d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."` (path completo no Task 3 abaixo).

---

### Task 1: Criar `src/data/services.ts`

**Files:**
- Create: `src/data/services.ts`

**Interfaces:**
- Produces: `interface ServiceFaqItem { question: string; answer: string }`, `interface ServiceData { slug: string; name: string; shortName: string; metaTitle: string; metaDescription: string; intro: string; hasFixedPricing: boolean; symptoms: string[]; whatsappMessage: string; faq: ServiceFaqItem[] }`, `export const services: ServiceData[]` (array com as 7 entradas abaixo, nesta ordem). Todas as tasks seguintes consomem `services` e esses dois tipos.

- [ ] **Step 1: Criar o arquivo de dados**

Create `src/data/services.ts`:
```typescript
export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceData {
  slug: string;
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  hasFixedPricing: boolean;
  symptoms: string[];
  whatsappMessage: string;
  faq: ServiceFaqItem[];
}

export const services: ServiceData[] = [
  {
    slug: "troca-de-tela",
    name: "Troca de Tela de iPhone",
    shortName: "troca de tela",
    metaTitle: "Troca de Tela de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de tela de iPhone com delivery gratuito em Manaus. Peças Econômica ou Premium, a partir de R$249,90, com até 90 dias de garantia.",
    intro:
      "A tela é a parte mais exposta a quedas e impactos do iPhone. Na Brothers Techcell, a troca é feita na sua frente, em Manaus, com peças Econômica, Intermediária ou Premium — sempre com garantia real.",
    hasFixedPricing: true,
    symptoms: [
      "Tela trincada ou estilhaçada",
      "Toque não responde em algumas áreas",
      "Manchas escuras ou vazamento de líquido sob o vidro",
      "Cores distorcidas ou linhas na tela",
      "Brilho muito baixo mesmo no máximo",
    ],
    whatsappMessage: "Olá! Quero saber o preço da troca de tela do meu iPhone.",
    faq: [
      {
        question: "Quanto custa a troca de tela?",
        answer:
          "O valor varia conforme o modelo do iPhone e a qualidade da peça (Econômica, Intermediária ou Premium), a partir de R$249,90. Consulte o preço exato do seu modelo na tabela da nossa página inicial ou pelo WhatsApp.",
      },
      {
        question: "Quanto tempo demora?",
        answer:
          "A troca de tela leva em média 20 a 40 minutos, feita na sua frente, onde você estiver em Manaus.",
      },
      {
        question: "Qual a garantia?",
        answer:
          "Tela Premium tem 90 dias de garantia real, Intermediária 30 dias e Básica 7 dias.",
      },
      {
        question: "Posso escolher a qualidade da tela?",
        answer:
          "Sim. Explicamos a diferença entre as opções e você escolhe a que preferir antes de fechar o serviço.",
      },
      {
        question: "Preciso pagar taxa de deslocamento?",
        answer: "Não cobramos taxa de deslocamento para a maioria dos bairros de Manaus.",
      },
      {
        question: "Perco meus dados na troca de tela?",
        answer:
          "Não. A troca de tela não afeta os dados armazenados no aparelho; o reparo é feito na sua frente com total transparência.",
      },
    ],
  },
  {
    slug: "troca-de-bateria",
    name: "Troca de Bateria de iPhone",
    shortName: "troca de bateria",
    metaTitle: "Troca de Bateria de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de bateria de iPhone com delivery gratuito em Manaus. Bateria homologada Anatel, a partir de R$249,90, com até 90 dias de garantia.",
    intro:
      "Bateria com saúde baixa faz o iPhone desligar sozinho, perder carga rápido ou desligar antes de chegar a 0%. Trocamos com peças homologadas Anatel, na sua frente, em Manaus.",
    hasFixedPricing: true,
    symptoms: [
      "Saúde da bateria abaixo de 80% (em Ajustes > Bateria)",
      "iPhone desliga sozinho mesmo com carga",
      "Bateria descarrega muito rápido",
      "Celular esquenta ao usar ou carregar",
      "Desempenho reduzido avisado pelo próprio iPhone",
    ],
    whatsappMessage: "Olá! Quero saber o preço da troca de bateria do meu iPhone.",
    faq: [
      {
        question: "Como sei se a bateria precisa ser trocada?",
        answer:
          "Vá em Ajustes > Bateria > Saúde da Bateria. Se a capacidade máxima estiver abaixo de 80%, ou o iPhone desliga sozinho mesmo com carga, é sinal de que a bateria está no fim da vida útil.",
      },
      {
        question: "Quanto custa a troca de bateria?",
        answer:
          "O valor varia por modelo, a partir de R$249,90. Consulte o preço do seu modelo na tabela da nossa página inicial ou pelo WhatsApp.",
      },
      {
        question: "As baterias têm selo Anatel?",
        answer:
          "Sim, trabalhamos exclusivamente com baterias homologadas pela Anatel, com chip controlador original.",
      },
      {
        question: "Quanto tempo demora a troca?",
        answer: "Em média 20 a 40 minutos, na sua frente, onde você estiver em Manaus.",
      },
      {
        question: "Qual a garantia da bateria?",
        answer: "Até 90 dias de garantia real, dependendo da qualidade escolhida.",
      },
      {
        question: "A troca de bateria apaga meus dados?",
        answer: "Não. É um procedimento de hardware que não mexe nos dados do aparelho.",
      },
    ],
  },
  {
    slug: "tampa-traseira",
    name: "Troca de Tampa Traseira de iPhone",
    shortName: "troca de tampa traseira",
    metaTitle: "Troca de Tampa Traseira de iPhone | Brothers Techcell",
    metaDescription:
      "Troca de tampa traseira de iPhone trincada ou quebrada, com atendimento delivery em Manaus. Orçamento gratuito pelo WhatsApp.",
    intro:
      "A tampa traseira de vidro do iPhone trinca ou quebra com quedas, mesmo quando a tela continua inteira. Fazemos a substituição por remoção a laser com acabamento de fábrica, direto na sua casa ou trabalho em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "Vidro traseiro trincado ou estilhaçado",
      "Lascas ou pontas que podem cortar",
      "Perda da vedação original contra poeira e umidade",
      "Peça solta ou com relevo irregular",
    ],
    whatsappMessage: "Olá! Quero orçar a troca da tampa traseira do meu iPhone.",
    faq: [
      {
        question: "É seguro usar o iPhone com a tampa traseira quebrada?",
        answer:
          "Não é recomendado: vidro trincado pode se soltar, cortar e compromete a proteção contra poeira e umidade do aparelho.",
      },
      {
        question: "Quanto custa a troca da tampa traseira?",
        answer:
          "O valor depende do modelo e disponibilidade da peça. Consulte pelo WhatsApp e receba o orçamento em poucos minutos.",
      },
      {
        question: "Como é feita a troca?",
        answer:
          "Usamos remoção a laser da tampa original danificada e instalação da nova peça com acabamento de fábrica, sem abrir mão da qualidade estética do aparelho.",
      },
      {
        question: "Isso afeta a tela ou a bateria do iPhone?",
        answer:
          "Não. É um reparo independente que não interfere na tela, bateria ou dados do aparelho.",
      },
      {
        question: "Tem garantia?",
        answer:
          "Sim, todo serviço realizado pela Brothers Techcell sai com garantia — os detalhes são combinados no orçamento, conforme a peça disponível para o seu modelo.",
      },
      {
        question: "Vocês cobram taxa de deslocamento?",
        answer: "Não cobramos taxa de deslocamento para a maioria dos bairros de Manaus.",
      },
    ],
  },
  {
    slug: "camera",
    name: "Troca de Câmera de iPhone",
    shortName: "troca de câmera",
    metaTitle: "Troca de Câmera de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de câmera frontal ou traseira de iPhone com foco quebrado, lente trincada ou borrões. Delivery em Manaus, orçamento pelo WhatsApp.",
    intro:
      "Foco que não trava, lente trincada ou fotos borradas são os sinais mais comuns de problema na câmera do iPhone. Diagnosticamos e trocamos a câmera frontal ou traseira na sua frente, em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "Foco automático não funciona",
      "Lente da câmera trincada ou arranhada",
      "Fotos saindo borradas, escuras ou com manchas",
      "Câmera não abre ou trava o app",
      "Flash não funciona corretamente",
    ],
    whatsappMessage: "Olá! Minha câmera do iPhone está com problema, quero um orçamento.",
    faq: [
      {
        question: "Como sei se o problema é na câmera ou no app?",
        answer:
          "No nosso atendimento, o técnico faz um diagnóstico rápido testando a câmera na sua frente antes de qualquer troca, pra confirmar se o problema é de hardware.",
      },
      {
        question: "Quanto custa a troca de câmera?",
        answer:
          "O valor depende do modelo do iPhone e de qual câmera precisa ser trocada (frontal ou traseira). Consulte pelo WhatsApp.",
      },
      {
        question: "Dá pra trocar só uma das lentes em modelos com câmera tripla?",
        answer:
          "Depende da disponibilidade da peça pra cada modelo — o técnico avalia e informa as opções no diagnóstico.",
      },
      {
        question: "Quanto tempo demora?",
        answer: "A maioria das trocas de câmera é concluída no mesmo atendimento, direto na sua casa ou trabalho.",
      },
      {
        question: "Tem garantia?",
        answer: "Sim, o serviço sai com garantia combinada no orçamento conforme a peça utilizada.",
      },
    ],
  },
  {
    slug: "dock",
    name: "Troca de Dock (Conector de Carga) de iPhone",
    shortName: "troca do dock",
    metaTitle: "Troca de Dock (Conector) de iPhone | Brothers Techcell",
    metaDescription:
      "Troca do dock (conector de carga) de iPhone que não carrega ou tem mau contato. Delivery em Manaus, orçamento gratuito pelo WhatsApp.",
    intro:
      "iPhone que não carrega, só carrega em um ângulo específico ou tem mau contato geralmente indica problema no dock (conector de carga). Fazemos a limpeza ou troca do conector direto na sua frente, em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "iPhone não carrega ou carrega de forma intermitente",
      "Precisa mexer no cabo pra carregar",
      "Conector com poeira, fiapos ou sujeira visível",
      "Cabo esquenta muito durante a carga",
      "Mensagem de \"acessório não compatível\" ao carregar",
    ],
    whatsappMessage: "Olá! Meu iPhone não carrega direito, quero um orçamento pro conector de carga.",
    faq: [
      {
        question: "Sempre que o iPhone não carrega é o dock?",
        answer:
          "Nem sempre — às vezes é o cabo, a fonte ou sujeira no conector. Nosso técnico testa isso antes de indicar a troca da peça.",
      },
      {
        question: "Vocês limpam o conector antes de trocar?",
        answer:
          "Sim, o diagnóstico inclui verificar se uma limpeza resolve antes de partir para a substituição da peça.",
      },
      {
        question: "Quanto custa a troca do dock?",
        answer: "O valor varia por modelo. Consulte pelo WhatsApp e receba o orçamento rapidamente.",
      },
      {
        question: "Isso afeta o microfone ou alto-falante?",
        answer:
          "Em alguns modelos o conjunto do dock inclui o microfone inferior — o técnico informa no diagnóstico se esse é o seu caso.",
      },
      {
        question: "Tem garantia?",
        answer: "Sim, conforme combinado no orçamento.",
      },
    ],
  },
  {
    slug: "face-id",
    name: "Reparo de Face ID de iPhone",
    shortName: "reparo de Face ID",
    metaTitle: "Reparo de Face ID de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Reparo de Face ID de iPhone que parou de reconhecer o rosto. Diagnóstico e delivery em Manaus, orçamento gratuito pelo WhatsApp.",
    intro:
      "Face ID que parou de reconhecer o rosto ou pede senha o tempo todo costuma ser um problema no módulo de reconhecimento facial (TrueDepth). Fazemos o diagnóstico e o reparo na sua frente, em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "Mensagem \"Face ID não disponível\" ou \"Mova o iPhone mais para baixo\" que não some",
      "iPhone sempre pede senha, nunca reconhece o rosto",
      "Face ID lento ou falha com frequência mesmo em boa luz",
      "Problema começou após queda ou troca de tela em outra assistência",
    ],
    whatsappMessage: "Olá! Meu Face ID parou de funcionar, quero um orçamento.",
    faq: [
      {
        question: "Toda troca de tela feita em outro lugar pode quebrar o Face ID?",
        answer:
          "Sim, é um risco real quando o módulo TrueDepth (perto da câmera frontal) não é remanejado com cuidado na troca. Por isso levamos esse cuidado a sério nos nossos próprios reparos.",
      },
      {
        question: "Dá pra recuperar o Face ID original?",
        answer:
          "Na maioria dos casos sim, com remanejamento do circuito original do próprio aparelho. O técnico avalia a viabilidade no diagnóstico.",
      },
      {
        question: "Quanto custa o reparo de Face ID?",
        answer: "O valor depende do que causou o problema, identificado no diagnóstico. Consulte pelo WhatsApp.",
      },
      {
        question: "Sem Face ID, dá pra usar o iPhone normalmente?",
        answer:
          "Sim, mas você fica sem o desbloqueio facial e usa a senha — recomendamos o reparo pra recuperar a comodidade e segurança do aparelho.",
      },
      {
        question: "Tem garantia?",
        answer: "Sim, conforme combinado no orçamento após o diagnóstico.",
      },
    ],
  },
  {
    slug: "reparo-em-placa",
    name: "Reparo em Placa de iPhone",
    shortName: "reparo em placa",
    metaTitle: "Reparo em Placa de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Reparo em placa de iPhone que não liga, reinicia sozinho ou molhou. Diagnóstico técnico com delivery em Manaus pelo WhatsApp.",
    intro:
      "iPhone que não liga, reinicia sozinho ou molhou e não responde mais geralmente exige reparo avançado de placa. Trabalhamos com ferramentas de laboratório para diagnosticar e resolver esses casos em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "iPhone não liga de jeito nenhum",
      "Tela preta permanente mesmo carregando",
      "Reinicia sozinho repetidamente (bootloop)",
      "Caiu na água e parou de funcionar",
      "Não é reconhecido pelo computador/iTunes",
    ],
    whatsappMessage: "Olá! Meu iPhone não liga (ou molhou), quero um diagnóstico.",
    faq: [
      {
        question: "Meu iPhone caiu na água, ainda dá pra salvar?",
        answer:
          "Depende do tempo de exposição e se houve tentativa de ligar o aparelho molhado. Quanto antes você trouxer pra avaliação, maior a chance de recuperação.",
      },
      {
        question: "Como funciona o diagnóstico de placa?",
        answer:
          "Usamos ferramentas de laboratório para identificar curtos, componentes queimados ou danificados antes de orçar o reparo.",
      },
      {
        question: "Quanto custa o reparo em placa?",
        answer:
          "O valor depende do problema identificado no diagnóstico — pode variar bastante caso a caso. Fazemos o orçamento após avaliar o aparelho.",
      },
      {
        question: "O diagnóstico tem custo?",
        answer: "Consulte as condições do diagnóstico pelo WhatsApp antes de agendar.",
      },
      {
        question: "Vocês recuperam dados de um iPhone que não liga?",
        answer:
          "Em muitos casos sim, dependendo do dano. O técnico avalia a viabilidade durante o diagnóstico.",
      },
      {
        question: "Tem garantia no reparo de placa?",
        answer:
          "Sim, conforme combinado no orçamento — reparos de placa têm garantia específica pro problema resolvido.",
      },
    ],
  },
];
```

- [ ] **Step 2: Verificar**

Run: `node --experimental-strip-types -e "import('./src/data/services.ts').then(m => console.log(m.services.length, m.services.map(s => s.slug)))"`

(Node 22.6+/24 executa `.ts` diretamente com `--experimental-strip-types` — o projeto usa Node 24. O arquivo só tem `interface`/`const`/`export`, totalmente compatível com type-stripping.)

Expected: `7 [ 'troca-de-tela', 'troca-de-bateria', 'tampa-traseira', 'camera', 'dock', 'face-id', 'reparo-em-placa' ]`

- [ ] **Step 3: Commit**

```bash
git add src/data/services.ts
git commit -m "feat: add services data for /servicos pages"
```

---

### Task 2: Criar `TrustFacts.astro`

**Files:**
- Create: `src/components/TrustFacts.astro`

**Interfaces:**
- Consumes: nenhuma prop.
- Produces: nenhuma interface nova; usado por `[slug].astro` (Task 8).

- [ ] **Step 1: Criar o componente**

**Correção pós-implementação:** a classe do `<section>` abaixo era originalmente `service-trust-section` (nome inventado durante a escrita deste plano, sem regra CSS correspondente). O revisor da Task 2 encontrou que isso causaria uma regressão visual (perderia o padding compacto de 48px + fundo + borda do padrão "trust bar"), e a correção trocou pela classe já existente `trust-shield-section` (`src/styles/styles.css:465-471`, mesma usada por `Diferenciais.astro`). O código abaixo já reflete a versão corrigida (commit `16a5910`).

Create `src/components/TrustFacts.astro`:
```astro
<section class="trust-shield-section">
  <div class="container">
    <div class="trust-shield-wrapper">
      <div class="trust-shield-card">
        <div class="trust-shield-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </div>
        <div class="trust-shield-info">
          <h4 class="type-heading-16">Garantia Real</h4>
          <p class="type-small-body">De 7 a 90 dias de garantia, conforme a qualidade da peça escolhida no orçamento.</p>
        </div>
      </div>

      <div class="trust-shield-card">
        <div class="trust-shield-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        </div>
        <div class="trust-shield-info">
          <h4 class="type-heading-16">Atendimento Todos os Dias</h4>
          <p class="type-small-body">Das 8h às 20h, todos os dias da semana, direto na sua casa ou trabalho.</p>
        </div>
      </div>

      <div class="trust-shield-card">
        <div class="trust-shield-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
          </svg>
        </div>
        <div class="trust-shield-info">
          <h4 class="type-heading-16">Delivery Gratuito em Manaus</h4>
          <p class="type-small-body">Sem taxa de deslocamento para a maioria dos bairros de Manaus - AM.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

Nota: os 3 ícones SVG (escudo, relógio, pin de mapa) são os mesmos já usados em `Diferenciais.astro` (escudo, "Garantia Blindada de 90 Dias") e `Footer.astro` (relógio e pin, adicionados na Etapa 1 de SEO) — reaproveitados aqui verbatim, não criamos SVGs novos.

- [ ] **Step 2: Verificar**

Run: `grep -c "trust-shield-card" src/components/TrustFacts.astro`
Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add src/components/TrustFacts.astro
git commit -m "feat: add TrustFacts component for service pages"
```

---

### Task 3: Criar `ServiceHero.astro`

**Files:**
- Create: `src/components/ServiceHero.astro`

**Interfaces:**
- Consumes: prop `service: ServiceData` (de `src/data/services.ts`, Task 1) — usa `service.name`, `service.intro`, `service.whatsappMessage`.
- Produces: nenhuma interface nova.

- [ ] **Step 1: Criar o componente**

Create `src/components/ServiceHero.astro`:
```astro
---
import type { ServiceData } from '../data/services';

interface Props {
  service: ServiceData;
}

const { service } = Astro.props;
---
<section class="service-hero-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Serviço</span>
      <h1 class="section-title type-h2-44">{service.name} em Manaus</h1>
      <p class="section-subtitle type-subheading-20">{service.intro}</p>
    </div>
    <div class="hero-btn-container" style="justify-content: center; display: flex; margin-top: 24px;">
      <a href="#" class="btn-glow btn-whatsapp-global" data-message={service.whatsappMessage}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span>FALAR NO WHATSAPP</span>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "<h1" src/components/ServiceHero.astro`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceHero.astro
git commit -m "feat: add ServiceHero component"
```

---

### Task 4: Criar `ServiceSymptoms.astro`

**Files:**
- Create: `src/components/ServiceSymptoms.astro`

**Interfaces:**
- Consumes: prop `symptoms: string[]` (de `service.symptoms`, `src/data/services.ts`).
- Produces: nenhuma interface nova.

- [ ] **Step 1: Criar o componente**

Create `src/components/ServiceSymptoms.astro`:
```astro
---
interface Props {
  symptoms: string[];
}

const { symptoms } = Astro.props;
---
<section class="service-symptoms-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Sinais de Alerta</span>
      <h2 class="section-title type-h2-44">Sinais de que Você Precisa desse Reparo</h2>
    </div>
    <ul class="other-services-bullets type-body-16">
      {symptoms.map((symptom) => (
        <li>{symptom}</li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "other-services-bullets" src/components/ServiceSymptoms.astro`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceSymptoms.astro
git commit -m "feat: add ServiceSymptoms component"
```

---

### Task 5: Criar `ServicePricing.astro`

**Files:**
- Create: `src/components/ServicePricing.astro`

**Interfaces:**
- Consumes: props `hasFixedPricing: boolean`, `whatsappMessage: string` (de `service.hasFixedPricing`/`service.whatsappMessage`).
- Produces: nenhuma interface nova.

- [ ] **Step 1: Criar o componente**

Create `src/components/ServicePricing.astro`:
```astro
---
interface Props {
  hasFixedPricing: boolean;
  whatsappMessage: string;
}

const { hasFixedPricing, whatsappMessage } = Astro.props;
---
<section class="service-pricing-section">
  <div class="container">
    <div class="other-services-cta-card" style="max-width: 600px; margin: 0 auto;">
      <div class="cta-glow"></div>
      <div class="cta-card-inner">
        {hasFixedPricing ? (
          <>
            <h4 class="type-heading-16">A partir de R$249,90</h4>
            <p class="type-small-body">
              O valor exato varia por modelo e qualidade da peça (Econômica ou Premium), em até 12x no cartão.
              Consulte o preço do seu iPhone na <a href="/#telas-precos">tabela completa da nossa página inicial</a> ou pelo WhatsApp.
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

- [ ] **Step 2: Verificar**

Run: `grep -c "other-services-cta-card" src/components/ServicePricing.astro`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/components/ServicePricing.astro
git commit -m "feat: add ServicePricing component"
```

---

### Task 6: Criar `ServiceFaq.astro`

**Files:**
- Create: `src/components/ServiceFaq.astro`

**Interfaces:**
- Consumes: prop `faq: ServiceFaqItem[]` (de `service.faq`, `src/data/services.ts`).
- Produces: nenhuma interface nova. O accordion funciona automaticamente via `setupFaqAccordion()` em `src/scripts/main.js`, que usa `document.querySelectorAll('.faq-item')` globalmente — não precisa de nenhum JS novo.

- [ ] **Step 1: Criar o componente**

Create `src/components/ServiceFaq.astro`:
```astro
---
import type { ServiceFaqItem } from '../data/services';

interface Props {
  faq: ServiceFaqItem[];
}

const { faq } = Astro.props;
---
<section class="service-faq-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Perguntas Frequentes</span>
      <h2 class="section-title type-h2-44">Dúvidas Sobre Esse Serviço</h2>
    </div>
    <div class="faq-list" style="max-width: 760px; margin: 0 auto;">
      {faq.map((item) => (
        <div class="faq-item">
          <button class="faq-question" aria-expanded="false">
            <span>{item.question}</span>
            <span class="faq-question-icon">+</span>
          </button>
          <div class="faq-answer">
            <div class="faq-answer-inner">
              <p>{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "faq-item" src/components/ServiceFaq.astro`
Expected: `1` (é um template repetido no `.map`, então só aparece 1 vez no código-fonte — a repetição real acontece em runtime/build, verificada na Task 8).

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceFaq.astro
git commit -m "feat: add ServiceFaq component"
```

---

### Task 7: Criar `OtherServicesList.astro`

**Files:**
- Create: `src/components/OtherServicesList.astro`

**Interfaces:**
- Consumes: prop `currentSlug: string`; importa `services` diretamente de `../data/services` (Task 1).
- Produces: nenhuma interface nova.

- [ ] **Step 1: Criar o componente**

Create `src/components/OtherServicesList.astro`:
```astro
---
import { services } from '../data/services';

interface Props {
  currentSlug: string;
}

const { currentSlug } = Astro.props;
const others = services.filter((s) => s.slug !== currentSlug);
---
<section class="service-other-section">
  <div class="container">
    <div class="section-header scroll-reveal scroll-top">
      <span class="section-label">Mais Serviços</span>
      <h2 class="section-title type-h2-44">Outros Reparos que Fazemos</h2>
    </div>
    <ul
      class="footer-links type-link"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; list-style: none; padding: 0; max-width: 900px; margin: 0 auto;"
    >
      {others.map((s) => (
        <li class="footer-link-item"><a href={`/servicos/${s.slug}`}>{s.name}</a></li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "footer-link-item" src/components/OtherServicesList.astro`
Expected: `1` (template dentro do `.map`, repetição real verificada em runtime na Task 8 — deve gerar 6 links por página, os 6 serviços exceto o atual).

- [ ] **Step 3: Commit**

```bash
git add src/components/OtherServicesList.astro
git commit -m "feat: add OtherServicesList component"
```

---

### Task 8: Criar `src/pages/servicos/[slug].astro`

**Files:**
- Create: `src/pages/servicos/[slug].astro`

**Interfaces:**
- Consumes: `services`, `ServiceData` (Task 1); `TrustFacts` (Task 2); `ServiceHero` (Task 3); `ServiceSymptoms` (Task 4); `ServicePricing` (Task 5); `ServiceFaq` (Task 6); `OtherServicesList` (Task 7); `BaseLayout`, `Header`, `Footer`, `FloatingWhatsapp`, `BottomNav`, `CtaFinal` (já existentes desde a Etapa 1, sem alteração).

- [ ] **Step 1: Criar a rota dinâmica**

Create `src/pages/servicos/[slug].astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import ServiceHero from '../../components/ServiceHero.astro';
import ServiceSymptoms from '../../components/ServiceSymptoms.astro';
import ServicePricing from '../../components/ServicePricing.astro';
import TrustFacts from '../../components/TrustFacts.astro';
import ServiceFaq from '../../components/ServiceFaq.astro';
import OtherServicesList from '../../components/OtherServicesList.astro';
import CtaFinal from '../../components/CtaFinal.astro';
import Footer from '../../components/Footer.astro';
import FloatingWhatsapp from '../../components/FloatingWhatsapp.astro';
import BottomNav from '../../components/BottomNav.astro';
import { services, type ServiceData } from '../../data/services';

export function getStaticPaths() {
  return services.map((service) => ({
    params: { slug: service.slug },
    props: { service },
  }));
}

interface Props {
  service: ServiceData;
}

const { service } = Astro.props;
const siteUrl = 'https://brotherstechcell-orcamento.vercel.app';

const serviceJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "areaServed": "Manaus",
  "provider": { "@type": "ElectronicsStore", "name": "Brothers Techcell" },
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": service.faq.map(({ question, answer }) => ({
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
    { "@type": "ListItem", "position": 2, "name": "Serviços", "item": `${siteUrl}/#telas-precos` },
    { "@type": "ListItem", "position": 3, "name": service.name, "item": `${siteUrl}/servicos/${service.slug}` },
  ],
});
---
<BaseLayout
  title={service.metaTitle}
  description={service.metaDescription}
  canonicalPath={`/servicos/${service.slug}`}
  extraJsonLd={[serviceJsonLd, faqJsonLd, breadcrumbJsonLd]}
>
  <Header />
  <main>
    <ServiceHero service={service} />
    <ServiceSymptoms symptoms={service.symptoms} />
    <ServicePricing hasFixedPricing={service.hasFixedPricing} whatsappMessage={service.whatsappMessage} />
    <TrustFacts />
    <ServiceFaq faq={service.faq} />
    <OtherServicesList currentSlug={service.slug} />
    <CtaFinal />
  </main>
  <Footer />
  <FloatingWhatsapp />
  <BottomNav />
  <script src="../../scripts/prices.js"></script>
  <script src="../../scripts/main.js"></script>
</BaseLayout>
```

Nota: a ordem `prices.js` antes de `main.js` é obrigatória (mesma regra da Etapa 1 — `prices.js` define `window.CONFIG` na última linha, `main.js` depende dessa variável global).

- [ ] **Step 2: Verificar que o build gera as 7 páginas**

Run: `rm -rf dist && npx astro build 2>&1 | tail -30`
Expected: build termina com sucesso, sem erros de tipo ou import.

Run: `find dist/servicos -name "index.html" | sort`
Expected:
```
dist/servicos/camera/index.html
dist/servicos/dock/index.html
dist/servicos/face-id/index.html
dist/servicos/reparo-em-placa/index.html
dist/servicos/tampa-traseira/index.html
dist/servicos/troca-de-bateria/index.html
dist/servicos/troca-de-tela/index.html
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/servicos/[slug].astro
git commit -m "feat: add dynamic /servicos/[slug] page assembling all service components"
```

---

### Task 9: Verificação final — JSON-LD, sitemap, links internos, home intocada

**Files:** nenhum arquivo novo — task de verificação.

- [ ] **Step 1: Validar JSON-LD nas 7 páginas**

Run:
```bash
node -e "
const fs = require('fs');
const slugs = ['troca-de-tela','troca-de-bateria','tampa-traseira','camera','dock','face-id','reparo-em-placa'];
for (const slug of slugs) {
  const html = fs.readFileSync('dist/servicos/' + slug + '/index.html', 'utf8');
  const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
  let m, types = [];
  while ((m = re.exec(html))) {
    const parsed = JSON.parse(m[1]);
    types.push(parsed['@type']);
  }
  console.log(slug + ':', types.join(', '));
}
"
```
Expected para cada uma das 7 linhas: `Service, FAQPage, BreadcrumbList`.

- [ ] **Step 2: Confirmar que o FAQ do JSON-LD bate com o texto vis��vel**

Run (exemplo para troca-de-tela; repita mentalmente ou rode em loop para as 7 — o padrão é idêntico já que todas usam o mesmo componente `ServiceFaq`):
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/servicos/troca-de-tela/index.html', 'utf8');
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

- [ ] **Step 3: Confirmar que o sitemap inclui as 7 novas URLs**

Run: `cat dist/sitemap-0.xml | grep -o 'servicos/[a-z-]*' | sort -u`
Expected: as 7 URLs (`servicos/troca-de-tela`, `servicos/troca-de-bateria`, `servicos/tampa-traseira`, `servicos/camera`, `servicos/dock`, `servicos/face-id`, `servicos/reparo-em-placa`).

- [ ] **Step 4: Confirmar links internos entre as páginas de serviço**

Run: `grep -o 'href="/servicos/[a-z-]*"' dist/servicos/troca-de-tela/index.html | sort -u | wc -l`
Expected: `6` (link para os outros 6 serviços, via `OtherServicesList` — a página não linka pra si mesma).

- [ ] **Step 5: Confirmar que a home não foi alterada**

Run: `git diff --stat "$(git merge-base main HEAD)"..HEAD -- src/pages/index.astro src/components/Header.astro src/components/Hero.astro src/components/ReelsShowcase.astro src/components/Diferenciais.astro src/components/ComoFunciona.astro src/components/PricingSelector.astro src/components/ComparativoTelas.astro src/components/DiagnosticForm.astro src/components/Sobre.astro src/components/Faq.astro src/components/CtaFinal.astro src/components/Footer.astro src/components/FloatingWhatsapp.astro src/components/BottomNav.astro src/layouts/BaseLayout.astro`

(Usa o merge-base com `main` em vez de contar commits, pra não depender de quantos commits exatos essa branch acabou tendo — rounds extras de correção de review mudam esse número.)

Expected: saída vazia (nenhuma dessas tasks tocou em nenhum arquivo da home).

- [ ] **Step 6: Preview manual (checagem automatizada, sem navegador)**

Run: `npx astro preview --port 4323 &` e depois `curl -s http://localhost:4323/servicos/troca-de-tela/ | grep -o "<h1[^>]*>[^<]*" ` — confirme que o H1 mostra "Troca de Tela de iPhone em Manaus". Repita para 1-2 outras páginas à sua escolha. Encerre o preview depois (`kill %1`).

**Nota (mesma limitação da Etapa 1):** nenhum navegador está disponível neste ambiente — o teste acima confirma presença de conteúdo estático, não comportamento interativo (accordion do FAQ, botão do WhatsApp abrindo com a mensagem certa). Recomenda-se um teste manual no preview do Vercel antes do sign-off final.

- [ ] **Step 7: Commit final (se a Step 5 revelou alguma mudança indevida na home, reverta-a antes de commitar; caso contrário, nada para commitar nesta task — ela é só verificação)**
