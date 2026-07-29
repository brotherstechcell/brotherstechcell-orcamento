# GSAP — Efeitos de Scroll Premium (Fase 7 do Plano Master) — Design

## Contexto

Fase 7 do "Plano Master — Brothers Techcell Premium Experience". As Fases 1+2 (redesign visual da home) e a Fase 6 (Motion — counter animation, Hero text reveal, page transitions) já foram implementadas e estão no ar. Esta etapa aplica GSAP (já instalado como dependência desde o início desta série de trabalhos, mas nunca usado até agora) para os 2 efeitos que o usuário confirmou fazerem sentido para o conteúdo real deste site — não a lista genérica original do Plano Master, que incluía itens (Before/After, Progress Bar, Timeline coreografada) sem uma aplicação natural no conteúdo atual.

## Decisões confirmadas com o usuário

1. **Vídeo do Hero em scroll-scrub no desktop** (≥1024px), com fallback para o autoplay em loop atual no mobile — reduz risco de jank em iOS/Android, onde scrubbing de vídeo via `currentTime` é historicamente instável.
2. **Barra fixa de preço/CTA** no lugar de uma interpretação literal de "sticky sections" dentro do `PricingSelector` — o layout atual da seção (busca + 2 cards lado a lado) é compacto demais para justificar um painel grudado internamente; a barra fixa ativada ao rolar para além da seção é o padrão real de e-commerce premium que se aplica aqui.
3. A barra fixa mostra **apenas o modelo selecionado + CTA de WhatsApp**, sem replicar o preço exato — evita uma segunda fonte de verdade para o preço (que já é renderizado dinamicamente em `renderSelectorResults()`).
4. Itens da lista original do Plano Master **não aplicados**: Before/After, Progress Bar, Timeline coreografada, Background Animation, Section Reveal genérico (já coberto pelo `.scroll-reveal` existente — usar GSAP para a mesma coisa seria redundante e infla o bundle sem ganho visual, exatamente o "parque de diversões" que o plano pede para evitar).

## Refinamento pós-aprovação: barra fixa de preço é desktop-only

Verificação técnica encontrou um problema no design original: o `BottomNav.astro` (mobile, `display: none` em desktop) já tem um item fixo de CTA do WhatsApp (`bottom-nav-item bottom-nav-cta btn-whatsapp-global`) sempre visível na parte inferior da tela. Adicionar a `StickyPriceBar` também no mobile empilharia duas barras fixas concorrentes na mesma região da tela — redundante, não um ganho. Desktop, ao contrário, não tem nenhum CTA persistente depois que o usuário rola para além do Hero/Header. Correção: a barra fixa de preço entra no **mesmo bloco condicional "desktop e sem `prefers-reduced-motion`"** do efeito do Hero, em vez de rodar em todos os tamanhos de tela — não aparece no mobile.

## Achado técnico: reaproveitar a disciplina do Motion (Fase 6)

A Fase 6 terminou com uma revisão final que encontrou um vazamento real: listeners em `window`/`document` e `IntersectionObserver`s se acumulavam a cada navegação client-side, porque esses objetos sobrevivem à troca de `<body>` do `<ClientRouter />`, mas `astro:page-load` dispara a cada navegação. A correção foi um `AbortController` por carregamento de página. `ScrollTrigger` do GSAP tem o mesmo risco (cada `ScrollTrigger.create()` continua vivo entre navegações se não for limpo) — esta etapa aplica a mesma disciplina desde o início, usando `gsap.context()` (revertido a cada `astro:page-load`) em vez de aprender a lição de novo depois.

## Achado técnico: coordenação de posse do vídeo do Hero

`setupHeroScrollVideo()` (em `src/scripts/main.js`, já modificada na Fase 6 para corrigir o bug de vídeo quebrado após transição de página) hoje sempre assume dono do elemento `<video id="hero-scroll-video">`: dá autoplay, gerencia play/pause via `IntersectionObserver`. Se o novo `gsap-effects.js` também tentar controlar `currentTime`/`play()`/`pause()` no mesmo elemento no desktop, os dois sistemas brigam pelo vídeo. A correção: `setupHeroScrollVideo()` ganha uma verificação no início da função — se a condição "desktop E sem `prefers-reduced-motion`" for verdadeira, a função retorna cedo (não faz autoplay, não cria o `IntersectionObserver`), cedendo o controle total ao GSAP. Essa mesma condição é calculada de forma idêntica (duplicada, sem módulo compartilhado — é uma checagem de 1 linha, não vale a complexidade de um import cruzado) em `gsap-effects.js`.

## Arquitetura técnica

### Novo arquivo: `src/scripts/gsap-effects.js`

**Correção de API (verificada contra `node_modules/gsap/types/gsap-core.d.ts` da versão instalada, `gsap@3.15.0`, antes de finalizar este spec):** o método correto é `gsap.matchMedia()` (retorna um objeto `MatchMedia`, com `.add(query, callback)`), **não** `ScrollTrigger.matchMedia()` — esse método não existe nesta versão (confirmado: `typeof ScrollTrigger.matchMedia === "undefined"` mesmo depois de `gsap.registerPlugin`). A gestão de limpeza usa o objeto `MatchMedia` diretamente (`.revert()`), em vez de aninhar dentro de `gsap.context()` — evita depender de uma interação implícita entre as duas APIs de limpeza que a documentação não deixa clara o suficiente pra apostar sem testar ao vivo.

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let mm;

document.addEventListener("astro:page-load", () => {
  mm?.revert();
  mm = gsap.matchMedia();

  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    initHeroScrollScrub();
    initStickyPriceBar();
  });
});
```
(A condição de mídia combina os dois requisitos — desktop E sem `prefers-reduced-motion` — numa única query CSS válida, via `and`. Isso já cobre o item 4 do Critério de Sucesso sem precisar de uma checagem JS separada dentro do callback.)

### 1. Scroll-scrub do vídeo do Hero

**Arquivos tocados:** `src/scripts/gsap-effects.js` (nova lógica), `src/scripts/main.js` (guarda de posse em `setupHeroScrollVideo()`).

Dentro de `initHeroScrollScrub()` — chamada apenas de dentro do `mm.add(...)` do bloco anterior, então já roda apenas em desktop sem reduced-motion, sem precisar checar essa condição de novo aqui:
```js
function initHeroScrollScrub() {
  const video = document.getElementById("hero-scroll-video");
  const heroSection = document.getElementById("inicio");
  if (!video || !heroSection) return;

  video.pause();
  video.removeAttribute("loop");

  const setScrub = () => {
    ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        if (video.duration) {
          video.currentTime = self.progress * video.duration;
        }
      },
    });
  };

  if (video.readyState >= 1) {
    setScrub();
  } else {
    video.addEventListener("loadedmetadata", setScrub, { once: true });
  }
}
```
(`video.readyState >= 1` = `HAVE_METADATA`, ou seja, `video.duration` já está disponível. O vídeo tem `preload="auto"` no HTML, então na maioria dos casos os metadados já estarão prontos quando este código rodar.)

**Correção em `src/scripts/main.js`'s `setupHeroScrollVideo()`** — adicionar a guarda de posse logo no início da função, antes de qualquer outra lógica:
```js
function setupHeroScrollVideo(signal) {
  const video = document.getElementById("hero-scroll-video");
  const heroSection = document.getElementById("inicio");
  if (!video || !heroSection) return;

  const isDesktopScrollScrub =
    window.matchMedia("(min-width: 1024px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isDesktopScrollScrub) return;

  // ...resto da função exatamente como está hoje (tryPlay, guarda de load(), IntersectionObserver)...
}
```

### 2. Barra fixa de preço/CTA

**Arquivos tocados:** criar `src/components/StickyPriceBar.astro`, modificar `src/pages/index.astro` (renderizar o componente), `src/styles/styles.css` (estilo + transição CSS pura, sem JS animando opacidade), `src/scripts/main.js`'s `renderSelectorResults()` (sincronizar o nome do modelo), `src/scripts/gsap-effects.js` (o `ScrollTrigger` que ativa/desativa a classe).

`StickyPriceBar.astro`:
```astro
    <div class="sticky-price-bar" id="sticky-price-bar">
      <div class="container sticky-price-bar-inner">
        <span class="sticky-price-bar-model">iPhone <strong id="sticky-price-bar-model-name">—</strong></span>
        <a href="#" class="btn-glow btn-whatsapp-global sticky-price-bar-cta" id="sticky-price-bar-cta">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>AGENDAR AGORA</span>
        </a>
      </div>
    </div>
```
Sem `data-message` fixo — o texto da mensagem é montado dinamicamente por `renderSelectorResults()` (igual ao padrão já usado no `DiagnosticForm`), já que precisa incluir o modelo atual.

`renderSelectorResults(modelName)` em `main.js` — adicionar ao final da função (depois de `resultsGrid.appendChild(batteryCard);`):
```js
  const stickyModelName = document.getElementById("sticky-price-bar-model-name");
  const stickyCta = document.getElementById("sticky-price-bar-cta");
  if (stickyModelName) stickyModelName.textContent = modelName;
  if (stickyCta) {
    const message = encodeURIComponent(`Olá! Quero saber o preço da troca de tela/bateria do meu iPhone ${modelName}.`);
    stickyCta.setAttribute("href", `https://wa.me/${CONFIG.contact.phoneRaw}?text=${message}`);
  }
```

`gsap-effects.js`'s `initStickyPriceBar()`:
```js
function initStickyPriceBar() {
  const bar = document.getElementById("sticky-price-bar");
  const pricingSection = document.getElementById("telas-precos");
  const footer = document.querySelector(".footer-main");
  if (!bar || !pricingSection || !footer) return;

  ScrollTrigger.create({
    trigger: pricingSection,
    start: "bottom top",
    endTrigger: footer,
    end: "top bottom",
    toggleClass: { targets: bar, className: "visible" },
  });
}
```

CSS (`styles.css`, novo bloco):
```css
.sticky-price-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 997;
  background: var(--card-bg);
  border-top: 1px solid var(--border);
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.08);
  padding: var(--space-2) 0;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.sticky-price-bar.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.sticky-price-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.sticky-price-bar-model {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (prefers-reduced-motion: reduce) {
  .sticky-price-bar {
    transition-duration: 0.01ms;
  }
}

@media (max-width: 1023px) {
  .sticky-price-bar {
    display: none;
  }
}
```
(A transição de aparecer/sumir é 100% CSS — o `ScrollTrigger` só alterna a classe `.visible`, sem animar propriedades via GSAP diretamente. `prefers-reduced-motion` cobre quem chegar a ter a classe `.visible` alternada sem transição visível — na prática nunca acontece, já que `initStickyPriceBar()` só roda dentro do mesmo bloco `mm.add(...)` que já exclui reduced-motion, mas mantém a regra por segurança caso o JS mude no futuro. O `display: none` abaixo de 1024px é a garantia definitiva de que a barra não aparece no mobile, reforçando o que o JS já não ativa lá — evita a duplicação de CTA fixo com o `BottomNav`.)

`index.astro` — importar e renderizar `<StickyPriceBar />` perto de `<FloatingWhatsapp />`/`<BottomNav />` (fim do `<BaseLayout>`, já que é `position: fixed` e a ordem no DOM não afeta o layout):
```astro
  <Footer />
  <FloatingWhatsapp />
  <BottomNav />
  <StickyPriceBar />
```

`index.astro` também precisa da nova tag de script, depois de `motion.js`:
```astro
  <script src="../scripts/motion.js"></script>
  <script src="../scripts/gsap-effects.js"></script>
```

## Escopo de arquivos

- Criar: `src/scripts/gsap-effects.js`, `src/components/StickyPriceBar.astro`
- Modificar: `src/scripts/main.js` (guarda de posse em `setupHeroScrollVideo()`, sincronização em `renderSelectorResults()`), `src/pages/index.astro` (renderizar `<StickyPriceBar />`, nova tag de script), `src/styles/styles.css` (novo bloco `.sticky-price-bar*`)
- Nenhuma outra página precisa de mudança própria — o efeito do Hero e a barra fixa só existem na home (`#inicio`, `#telas-precos` e o `PricingSelector` só existem lá).

## Critério de sucesso

1. `npx astro build` continua gerando as 298 páginas sem erro.
2. Em desktop (≥1024px), o vídeo do Hero avança/recua conforme o usuário rola pela seção — não tem autoplay/loop independente do scroll.
3. Em mobile (<1024px), o vídeo do Hero continua com autoplay em loop, exatamente como antes desta etapa — zero mudança de comportamento.
4. Com `prefers-reduced-motion: reduce` ativo, o vídeo do Hero usa o comportamento de autoplay/loop (não scroll-scrub) mesmo em desktop.
5. Em desktop e sem `prefers-reduced-motion`, a barra fixa de preço aparece ao rolar para além do `PricingSelector`, mostra o modelo selecionado corretamente (inclusive depois de trocar o modelo no seletor principal), e desaparece antes/ao chegar no Footer. Em mobile, a barra nunca aparece (`display: none`) — o `BottomNav` já cobre o CTA fixo lá.
6. Navegar Home → outra página → Home (via `<ClientRouter />`) não deixa `ScrollTrigger`s duplicados acumulando — verificado via `mm.revert()` (o objeto `MatchMedia` retornado por `gsap.matchMedia()`) chamado no início de cada `astro:page-load`, mesma disciplina que a Fase 6 aplicou aos listeners com `AbortController`.
7. Nenhuma regressão nas funcionalidades existentes (seletor de preços, FAQ, menu mobile, WhatsApp) em nenhuma página.

## Fora de escopo

- Before/After, Progress Bar de leitura, Timeline coreografada, Background Animation nos `mesh-glow` — sem aplicação natural clara no conteúdo atual; descartados nesta etapa em vez de forçar um encaixe.
- Qualquer efeito de "section reveal" via GSAP — o `.scroll-reveal` (vanilla JS, `IntersectionObserver`) já cobre isso; usar GSAP para o mesmo efeito duplicaria funcionalidade sem ganho visual.
- Pin/sticky real da seção Hero durante o scroll-scrub — o efeito é scrub tied ao scroll natural da seção, sem travar a página.
- Propagar esses efeitos para páginas de modelo/bairro/serviço — nenhuma delas tem Hero com vídeo ou `PricingSelector` na estrutura atual; fora do escopo desta fase de qualquer forma.
- Three.js (Fase 8) e a revisão final (Fase 9) — próximas etapas separadas do Plano Master.
