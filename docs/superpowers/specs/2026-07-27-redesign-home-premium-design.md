# Redesign Premium da Home (Fases 1+2 do Plano Master) — Design

## Contexto

O usuário enviou um "Plano Master — Brothers Techcell Premium Experience" com 9 fases (Frontend Design, ui-ux-pro-max, shadcn/ui, Claude Design Toolkit, Interface Design, Motion, GSAP, Three.js, frontend-design-review), com o objetivo de o site transmitir a mesma sensação de qualidade de Apple/Stripe/Vercel/Linear/Revolut/Nothing/Arc/Framer, sem copiar nenhum literalmente — só princípios.

O plano empacota vários subsistemas independentes demais para um único spec. Esta etapa cobre apenas as **Fases 1+2** (direção criativa + refinamento visual: tipografia, espaçamento, paleta, radius, sombra, contraste), aplicadas **somente na Home**, como piloto antes de propagar para as páginas de modelo/bairro/serviço. As fases seguintes (design system shadcn-like, motion, GSAP, Three.js, revisão final) ficam para specs futuros.

## Decisões confirmadas com o usuário

1. **Escopo do piloto**: só a Home (Header, Hero, Sobre, Diferenciais, PricingSelector, Faq, Footer e demais seções da home). Depois de aprovado, propaga para páginas de modelo/bairro em etapa futura.
2. **shadcn/ui sem React**: o projeto é 100% Astro, sem framework de componente. Em vez de instalar React + `@astrojs/react` para usar shadcn/ui de verdade (Radix), replicamos a *linguagem visual* do shadcn (tokens, variantes, radius, sombra) em componentes `.astro` + Tailwind + JS vanilla. Mantém o bundle enxuto.
3. **Cor de marca**: verde (`#29A251`) é mantido como cor de ação — já é a identidade da marca e casa com o CTA de WhatsApp. Refinado (menos glow, uso mais restrito), não substituído por azul.
4. **Consolidação de seções**: autorizado cortar/unir seções redundantes na Home, desde que nenhuma informação essencial (preço, garantia, WhatsApp) se perca.
5. **Execução**: tudo em um único ciclo de implementação (sem checkpoints intermediários por commit de tokens/chrome/seções separadamente).

## Achado técnico: chrome e tokens são compartilhados site-wide

`Header`, `Footer`, `BottomNav`, `FloatingWhatsapp` e `src/styles/styles.css` são importados por **todas** as páginas do site (home, `/iphone-{model}/{service}`, `/servicos/{slug}`, `/atendimento/{bairro}`, páginas legais) — confirmado via grep nos imports de `src/pages/`. Logo, mesmo com o piloto restrito à Home:

- Mudanças nos tokens globais (cor, radius, sombra, espaçamento) e no chrome (Header/Footer/BottomNav/FloatingWhatsapp) **aparecem em todas as páginas do site**, não só na Home.
- Isso é desejável (consistência visual imediata), mas o layout/markup interno das páginas de modelo, bairro e serviço (`ModelHero`, `ServiceHero`, `NeighborhoodHero`, `ServicePricing`, etc.) **não é tocado** nesta etapa — só herdam os tokens novos via CSS custom properties.

## Tokens de design (`src/styles/styles.css`)

### Bug existente a corrigir
`--radius-sm` e `--radius-lg` estão definidos **duas vezes** no arquivo (linhas ~71-76 e ~245-248) com valores conflitantes (`--radius-sm`: 100px vs 8px; `--radius-lg`: 5px vs 24px). Consolidar em uma única definição.

### Cores
| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | fundo padrão |
| `--bg-secondary` | `#FAFAFA` | alternância sutil entre seções |
| `--text-primary` | `#111214` | títulos |
| `--text-secondary` | `#4B5563` | corpo de texto |
| `--text-muted` | `#8A8F98` | legendas, timestamps |
| `--border` | `#E5E7EB` | bordas de card |
| `--primary` | `#29A251` (mantido) | única cor de ação: botões, badges ativos, indicadores |
| `--primary-dark` | `#1A532D` (mantido) | hover / texto sobre fundo claro |

Remover o glow/tint verde de sombras e bordas decorativas em todo o site — verde fica restrito a elementos de ação.

### Radius (fonte única)
`--radius-sm: 8px` · `--radius-md: 12px` · `--radius-lg: 20px` · `--radius-pill: 999px`

### Sombra (neutra, quase imperceptível — sem tint de cor)
`--shadow-xs: 0 1px 2px rgba(15,23,42,.04)` · `--shadow-sm: 0 2px 8px rgba(15,23,42,.06)` · `--shadow-md: 0 8px 24px rgba(15,23,42,.08)` · `--shadow-lg: 0 20px 48px rgba(15,23,42,.10)`

Remove `--shadow-green` / `--shadow-green-lg` (tint verde) e `--shadow-DEFAULT` atual (glow verde 23px de espalhamento).

### Espaçamento — grid de 8px
`--space-1: 8px` · `--space-2: 16px` · `--space-3: 24px` · `--space-4: 32px` · `--space-5: 48px` · `--space-6: 64px` · `--space-7: 96px` · `--space-8: 128px`

Paddings de seção passam a usar essa escala em vez de valores fixos ad-hoc (ex.: `padding: 90px 0`).

### Tipografia
Mantém Inter como família única (já carregada via Google Fonts). Remove Gilroy/Outfit dos tokens `@theme` se não estiverem em uso real (checar antes de remover). H1 do Hero sobe de `--text-58` (58px) para ~64-72px desktop, peso 700-800, tracking negativo. H2 de seção ~40-48px, peso 700. Corpo 16-18px, peso 400-500, `--text-secondary`.

## Nova arquitetura da Home

14 blocos hoje (Header, Hero, Reels, GoogleReviews, ComoFunciona, Diferenciais, TrustShield, PricingSelector, ComparativoTelas, DiagnosticForm, Sobre, Faq, CtaFinal, Footer) viram 12, por 2 fusões (Diferenciais+TrustShield; Reels+GoogleReviews) e 1 corte (CtaFinal), na ordem:

1. **Header** — restilizado sobre os novos tokens.
2. **Hero** — headline maior (H1 ~64-72px), 1 CTA principal + 1 secundário, remove negrito colorido inline do parágrafo. Mantém o vídeo (`hero-iphone-disassembly.mp4`).
3. **Faixa de prova social (stats)** — números-chave (2.500+ reparos, 9+ anos, 100% transparente, ~30min) como faixa fina logo abaixo do Hero, substituindo a `trust-stats-bar` que hoje vive dentro do `ReelsShowcase` como bloco cheio.
4. **Como Funciona** — comprime de seção cheia com timeline scroll-reveal pesado para uma faixa compacta de 3 passos.
5. **Diferenciais (unificado)** — `Diferenciais` + `trust-shield-section` viram um único grid de 4 cards. Hoje os mesmos 3 fatos (ESD, vedação IP68, chip Texas Instruments) aparecem repetidos em `Diferenciais`, `trust-shield-section`, `Sobre` e `Faq` — cada fato passa a ser dito uma vez com autoridade, não repetido.
6. **Prova social (vídeos + reviews)** — `ReelsShowcase` (sem a stats bar, que subiu pro item 3) + `GoogleReviews` viram uma seção só: vídeos reais de um lado, reviews do outro.
7. **PricingSelector** — mantido funcionalmente idêntico (busca de modelo, tabs Telas/Baterias vs Outros Serviços, links de agendamento), só restilizado.
8. **ComparativoTelas** — mantido (bento Econômica vs Premium), mais compacto.
9. **DiagnosticForm** — mantido como caminho alternativo de conversão (quem não sabe o defeito), com menos peso visual que o PricingSelector.
10. **Sobre** — enxuto: foco em história/autoridade da marca, sem repetir ESD/IP68/TI (já ditos no item 5).
11. **Faq** — mantido estruturalmente (schema `FAQPage`, tabela zero-click), restilizado.
12. **Footer** — restilizado, absorve uma linha de CTA final.
13. ~~**CtaFinal**~~ — **removido**. Antes dele já existem 6 CTAs de WhatsApp (Hero, Diferenciais/PricingSelector, ComparativoTelas, DiagnosticForm, Sobre, Faq); um CTA genérico a mais sem informação nova é o tipo de enchimento que o briefing pede para eliminar.

`FloatingWhatsapp` e `BottomNav` mantidos, restilizados sobre os novos tokens.

## Fora de escopo (specs futuros, na ordem do Plano Master)

- Fase 3 — variantes completas de componentes estilo shadcn (Dialog, Sheet, Tabs, Toast, Popover, Tooltip, Carousel, Drawer).
- Fase 5 (continuação) — propagar esta direção visual para páginas de modelo (`/iphone-{model}/{service}`), bairro (`/atendimento/{bairro}`) e serviço (`/servicos/{slug}`).
- Fase 6 — Motion (microinterações: fade, slide, scale, reveal, stagger, hover, ripple, text reveal, counter animation).
- Fase 7 — GSAP (scroll, parallax, timeline, sticky sections, progress bar).
- Fase 8 — Three.js (elemento 3D do iPhone no Hero) — depende ainda de definir a origem do asset 3D (não há modelo `.glb` nem foto de produto própria em `public/`, só vídeos de reparo e logo).
- Fase 9 — `frontend-design-review` como QA final de todo o site redesenhado.

## Critério de sucesso

1. `npx astro build` conclui sem erros; todas as páginas existentes (home, modelo, bairro, serviço, legais) continuam gerando normalmente.
2. Nenhum link interno, CTA de WhatsApp ou link de agendamento (`brothersystem.vercel.app/agendar?...`) quebrado.
3. JSON-LD (`LocalBusiness`, `ElectronicsStore`, `FAQPage`) continua batendo com o texto visível — nenhum fato usado no schema pode desaparecer do HTML durante a consolidação de seções.
4. Home cai de 14 para 12 blocos renderizados, sem perda de informação essencial (preço, garantia, contato, endereço).
5. Nenhuma seção repete o mesmo fato de confiança (ESD/IP68/TI/garantia) mais de uma vez na página.
6. `--radius-sm`/`--radius-lg` passam a ter uma única definição no CSS.
7. Verificação manual em 375px, 768px, 1024px, 1440px sem scroll horizontal.
