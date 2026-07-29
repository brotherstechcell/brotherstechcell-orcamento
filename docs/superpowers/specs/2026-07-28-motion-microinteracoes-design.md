# Motion — Microinterações (Fase 6 do Plano Master) — Design

## Contexto

Fase 6 do "Plano Master — Brothers Techcell Premium Experience" enviado pelo usuário em 2026-07-27. As Fases 1+2 (direção criativa + refinamento visual, spec `2026-07-27-redesign-home-premium-design.md`) já foram implementadas e vão ao ar. O usuário pediu para continuar com as próximas fases do plano; escolheu Motion como a próxima.

## Achado que reduz o escopo original

A lista original da Fase 6 (Fade, Slide, Scale, Reveal, Stagger, Hover, Ripple, Text Reveal, Button Hover, Underline Animation, Icon Animation, Counter Animation, Card Hover, Navbar Animation, Page Transition) já está majoritariamente implementada pelas Fases 1+2:

- **Fade/Slide/Reveal/Stagger**: sistema `.scroll-reveal` (+ `.scroll-left`/`.scroll-right`/`.scroll-top` + `.delay-1/2/3`) já existe site-wide, via `IntersectionObserver` em `src/scripts/main.js`'s `setupScrollReveal()`.
- **Card Hover / Button Hover**: já existem via transições CSS token-based (`.diff-card:hover`, `.review-card:hover`, `.btn-quality-order:hover`, etc.).
- **Underline Animation**: já existe em `.nav-link::after` (Header).
- **Navbar Animation**: já existe em `.header-main.scrolled` (blur/bg no scroll).

O que falta, genuinamente novo, é o escopo desta etapa: **counter animation**, **text reveal** (Hero), e **page transitions** (site-wide). **Ripple** foi descartado — é um padrão de Material Design (Android), não combina com a linguagem visual Apple/Stripe/Linear estabelecida nas Fases 1+2.

## Decisões confirmadas com o usuário

1. **Page transitions incluídas agora**, mesmo afetando todas as páginas do site (não só a home) — risco baixo, `<ClientRouter />` é aditivo no layout compartilhado.
2. **Counter animation nos 4 números** da `TrustStatsBar` (2.500+, 100%, ~30 min, 9+ anos), por consistência visual, mesmo os 2 últimos sendo menos "naturais" de contar.
3. Ripple: fora de escopo (justificativa de estilo acima).

## Achado técnico crítico: migração obrigatória de `main.js`

Confirmado via documentação oficial do Astro (Context7, `/withastro/docs`): quando `<ClientRouter />` está ativo, navegações internas viram transições client-side e **não disparam um novo `DOMContentLoaded`**. Qualquer script que dependa desse evento simplesmente para de rodar após a primeira navegação — incluindo `src/scripts/main.js`, que hoje envolve TODA a sua inicialização (seletor de preços, links de WhatsApp, accordion do FAQ, menu mobile, scroll reveal, autoplay dos reels, wizard de diagnóstico) em um único listener `DOMContentLoaded`.

A correção é direta e documentada como a migração recomendada pelo próprio Astro: trocar `document.addEventListener("DOMContentLoaded", ...)` por `document.addEventListener("astro:page-load", ...)` em `main.js`. Esse evento dispara tanto no carregamento inicial quanto após cada transição — é um substituto direto, sem mudar a lógica interna de nenhuma das funções de setup existentes.

`prefers-reduced-motion` para as transições de página é tratado automaticamente pelo `<ClientRouter />` (confirmado na documentação) — não precisa de código manual para essa parte.

## Arquitetura técnica

### Novo arquivo: `src/scripts/motion.js`

Módulo separado de `main.js` (mantém a separação de responsabilidades: `main.js` = interatividade de negócio existente, `motion.js` = as 2 novas animações). Importa `animate`, `inView`, `stagger`, `splitText` de `"motion"` (pacote já instalado). Escuta `astro:page-load` (não `DOMContentLoaded`, pelo mesmo motivo acima) e roda:

1. `initCounterAnimation()`
2. `initHeroTextReveal()`

Ambas checam `window.matchMedia('(prefers-reduced-motion: reduce)').matches` no início e retornam cedo (aplicando o estado final direto, sem animação) se o usuário preferir movimento reduzido.

### 1. Counter animation

**Arquivo tocado:** `src/components/TrustStatsBar.astro` (adiciona `data-*` attributes aos 4 números) + `motion.js` (lógica).

Cada `.trust-stat-number` ganha:
- `data-count-to="2500"` `data-count-suffix="+"` `data-count-format="thousands"` → renderiza "0" → "2.500+"
- `data-count-to="100"` `data-count-suffix="%"` → "0%" → "100%"
- `data-count-to="30"` `data-count-prefix="~"` `data-count-suffix=" min"` → "~0 min" → "~30 min"
- `data-count-to="9"` `data-count-suffix="+ anos"` → "0+ anos" → "9+ anos"

`motion.js` usa `inView(".trust-stat-number", (element) => { ...anima uma vez... })` com `animate(0, to, { duration: 1.2, onUpdate: latest => element.textContent = format(latest) })`. Formatação de milhar (`2500` → `"2.500"`) é uma função pura local, sem dependência nova.

### 2. Hero text reveal

**Arquivo tocado:** `src/components/Hero.astro` (nenhuma mudança de marcação necessária — `splitText` opera sobre o elemento existente) + `motion.js`.

No `astro:page-load`, se a página atual tem `#inicio` (ou seja, é a home — o Hero só existe lá), `splitText(".hero-title")` quebra o H1 em palavras; `animate(words, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, delay: stagger(0.04) })` revela em cascata. Roda uma vez, sem gatilho de scroll (está acima da dobra, visível no load).

### 3. Page transitions

**Arquivo tocado:** `src/layouts/BaseLayout.astro` (adiciona `<ClientRouter />`) + `src/scripts/main.js` (troca o evento de inicialização).

```astro
---
import { ClientRouter } from "astro:transitions";
---
<head>
  ...
  <ClientRouter />
</head>
```

Sem `transition:animate` customizado em nenhum elemento — mantém a transição padrão do Astro (crossfade), reduzindo risco de CLS ou comportamento inesperado nesta primeira rodada. Uma escolha de transição mais elaborada (slide, elementos persistentes como o Header) fica para uma iteração futura, se fizer sentido depois de ver o padrão em produção.

Em `main.js`, a única mudança é a linha do listener:
```js
// Antes
document.addEventListener("DOMContentLoaded", async () => { ... });
// Depois
document.addEventListener("astro:page-load", async () => { ... });
```
Nenhuma outra linha do arquivo muda — todas as funções de setup internas (`initPricingSelector`, `updateWhatsAppLinks`, `setupScrollEffects`, etc.) continuam exatamente iguais.

## Escopo de arquivos

- Criar: `src/scripts/motion.js`
- Modificar: `src/components/TrustStatsBar.astro`, `src/layouts/BaseLayout.astro`, `src/scripts/main.js`, `src/pages/index.astro` (adicionar a tag `<script src="../scripts/motion.js">`, mesmo padrão de `main.js`/`prices.js` hoje)
- Nenhum arquivo de página de modelo/bairro/serviço precisa de mudança própria — `BaseLayout.astro` é compartilhado, então `<ClientRouter />` e a correção do `main.js` já cobrem todas as páginas automaticamente.

## Critério de sucesso

1. `npx astro build` continua gerando as 298 páginas sem erro.
2. Navegar entre Home → uma página de modelo → Home (via links reais do site, não refresh) mantém 100% da interatividade funcionando na segunda navegação em diante: busca de preço, accordion do FAQ, menu mobile, links de WhatsApp.
3. Os 4 números da `TrustStatsBar` contam de 0 até o valor final na primeira vez que entram na viewport dentro de um mesmo carregamento de página (dispara uma vez por `astro:page-load`). **Correção pós-implementação:** como o `<ClientRouter />` trata cada chegada à home via navegação client-side como um novo `astro:page-load`, o contador roda de novo a cada vez que o usuário volta pra home — o "dispara uma vez" original (pensado antes de page transitions entrarem no escopo) foi reinterpretado como "uma vez por carregamento", não "uma vez pra sempre na sessão do navegador". Comportamento aceito como está: recontar ao voltar pra home é consistente com o resto do sistema (`.scroll-reveal` também re-executa a cada chegada) e não seria trivial de evitar sem `sessionStorage`, que não valeria a complexidade extra.
4. O H1 do Hero aparece em cascata (palavra a palavra) no carregamento da home.
5. Com `prefers-reduced-motion: reduce` ativo no sistema: nenhuma das 2 novas animações (counter, text reveal) executa — os elementos aparecem direto no estado final. As transições de página do Astro também são automaticamente desabilitadas (comportamento nativo do `ClientRouter`).
6. Nenhuma regressão nas páginas de modelo/bairro/serviço (que não foram redesenhadas visualmente ainda) — elas devem continuar funcionando exatamente como antes, só que agora com transição de página entre navegações.

## Fora de escopo

- Ripple effect (não combina com a linguagem visual estabelecida).
- Animações de scroll mais complexas (parallax, pin, timelines coreografadas) — reservado pra Fase 7 (GSAP), que já tem essa responsabilidade no Plano Master; evita sobrepor as duas bibliotecas na mesma etapa.
- Transições de página customizadas por elemento (`transition:animate`, `transition:persist` no Header) — mantém o padrão default do Astro nesta rodada.
- Propagar o redesign visual (tokens, layout) das Fases 1+2 para as páginas de modelo/bairro/serviço — item já identificado como fase futura separada.
- Icon animation, qualquer outro item da lista original não mencionado acima — cobertos pelo hover/scroll-reveal já existentes, ou considerados granularidade demais para esta etapa.
