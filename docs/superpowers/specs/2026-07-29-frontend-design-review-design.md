# Fase 9 — Revisão Final de Design (frontend-design-review) — Design

## Contexto

Fase 9, última do "Plano Master — Brothers Techcell Premium Experience" enviado pelo usuário em 2026-07-27. As Fases 1+2 (direção criativa + refinamento visual), 6 (Motion) e 7 (GSAP) já foram implementadas e estão em produção — todas aplicadas **somente na Home**, como piloto. A Fase 8 (Three.js) está bloqueada por falta de asset 3D e fica para depois. A Fase 9 é a revisão de QA final descrita no spec original da Fase 1+2 como "`frontend-design-review` como QA final de todo o site redesenhado".

## Achado que reduz o escopo original

"Todo o site redesenhado" pressupõe que o redesign chegou em todas as páginas. Na prática, só a Home passou pelo redesign completo (visual + Motion + GSAP). As ~297 páginas de modelo/bairro/serviço (`/iphone-[model]/[service]`, `/servicos/[slug]`, `/atendimento/[bairro]`) usam componentes próprios (`ModelHero`, `ServiceHero`, `ServiceSymptoms`, `ServiceFaq`, `ServiceHero`, `NeighborhoodHero`, `ModelCrossLinks`, `TrustFacts`, `CtaFinal`, etc.) que nunca foram tocados pelo redesign — só herdam os design tokens globais (`styles.css`, importado por `BaseLayout.astro`) e o chrome compartilhado (`Header`, `Footer`, `BottomNav`, `FloatingWhatsapp`), que sim foram redesenhados.

**Decisão confirmada com o usuário:** escopo é Home (onde todo o trabalho de design/motion/GSAP vive) + chrome compartilhado, verificado em amostra representativa das outras páginas — não uma auditoria completa das ~297 páginas ainda não redesenhadas (que já é um item futuro conhecido, "propagar redesign para páginas de modelo/bairro/serviço").

## Decisões confirmadas com o usuário

1. **Escopo:** Home + chrome compartilhado (Header/Footer/BottomNav/FloatingWhatsapp) + amostra de páginas de modelo/serviço/bairro para verificar que nada quebrou nelas.
2. **Dimensões:** todas as quatro — visual/UX (consistência com os guidelines do `ui-ux-pro-max`), acessibilidade (WCAG 2.2), performance/Core Web Vitals, responsividade (mobile/tablet/desktop).
3. **Tratamento de achados:** correção automática do que for objetivo (bugs de acessibilidade, quebras visuais, problemas claros de performance) — decisões de gosto/trade-off sobem para o usuário antes de qualquer mudança.

## Arquitetura

### Fase A — Auditoria paralela (read-only, sem código)

Três frentes independentes, despachadas em paralelo:

1. **`a11y-architect`** — WCAG 2.2 AA na Home + chrome compartilhado: contraste de cor, navegação por teclado (tab order, focus trap), indicador de foco visível, uso de ARIA, HTML semântico, labels de formulário (`DiagnosticForm`, `PricingSelector`). Inclui investigar especificamente o bug do menu hambúrguer não funcionar fora da Home — já sinalizado 3 vezes em reviews anteriores nesta sessão como um forte candidato a "próxima tarefa" mas nunca endereçado; cai neste escopo porque é `Header.astro` (chrome compartilhado) e é fundamentalmente um problema de interação/teclado-clique.
2. **`e2e-runner`** (Playwright) — responsividade em breakpoints (375/390 mobile, 768 tablet, 1024/1280/1440 desktop) na Home e numa amostra de páginas de modelo/serviço/bairro (checar overflow, sobreposição, alvos de toque pequenos demais); Lighthouse mobile+desktop na Home para Core Web Vitals (LCP, CLS, INP) e um diagnóstico geral de performance (tamanho de bundle, imagens não otimizadas, fontes).
3. **Consistência visual/UX** — comparação dos componentes da Home + chrome contra os guidelines do `ui-ux-pro-max` (tipografia, ritmo de espaçamento, uso de cor, sombra/radius, estados de hover/focus/active) e contra os tokens definidos em `src/styles/styles.css`. Feito por leitura de código (não precisa de browser), então roda inline nesta sessão ao invés de um subagent dedicado.

Cada frente produz uma lista de achados com severidade (Critical/Important/Minor, mesmo vocabulário usado nas revisões desta sessão) e localização exata (arquivo/linha ou seletor CSS/página).

### Fase B — Consolidação e correção

1. Os 3 relatórios são consolidados numa lista única, removendo duplicatas (ex.: o bug do hambúrguer pode aparecer tanto no relatório de a11y quanto no de e2e/responsividade).
2. Achados são triados: **objetivos** (bug real, quebra de a11y, regressão de performance mensurável, quebra visual) entram no plano de correção; achados de **gosto/trade-off** (ex.: preferência de cor sem problema funcional) vão para uma seção separada do relatório final, sem correção automática.
3. Os achados objetivos viram um plano de implementação (`docs/superpowers/plans/2026-07-29-frontend-design-review.md`), seguindo o mesmo padrão desta sessão: uma task por cluster de achados relacionados, executado via Subagent-Driven Development (implementador + revisor por task, revisão final de branch, um fix wave se a revisão final encontrar algo nesta etapa).

## Escopo de arquivos (esperado, pode mudar conforme os achados da Fase A)

- Possível: `src/components/Header.astro` (bug do menu mobile), `src/scripts/main.js` (lógica do menu), `src/styles/styles.css` (ajustes de contraste/foco/consistência), componentes da Home individuais conforme achados de UX.
- Não esperado: componentes exclusivos de páginas de modelo/serviço/bairro (`ModelHero`, `ServiceFaq`, etc.) — fora do escopo desta fase, a menos que um achado de chrome compartilhado exija tocar neles incidentalmente.

## Critério de sucesso

1. `npx astro build` continua gerando 298 páginas sem erro.
2. Relatório consolidado de achados existe, com severidade e localização, cobrindo as 4 dimensões.
3. Todo achado objetivo (Critical/Important) foi corrigido e re-verificado; achados Minor documentados (corrigidos se triviais, ou registrados como deferred).
4. Achados de gosto/trade-off (se houver) apresentados ao usuário antes de qualquer mudança — nenhum aplicado sem aprovação.
5. O bug do menu hambúrguer fora da Home é investigado e, se confirmado, corrigido.
6. Nenhuma regressão nas páginas tocadas (Home, chrome compartilhado, amostra de páginas de modelo/serviço/bairro).
7. Lighthouse (mobile + desktop, Home) documentado como baseline nesta rodada — não há critério de nota mínima definido a priori, mas achados de performance claros (imagem não otimizada, render-blocking, etc.) são corrigidos.

## Fora de escopo

- Redesign visual das ~297 páginas de modelo/bairro/serviço — item futuro já identificado, precisa de seu próprio ciclo spec→plano.
- Fase 8 (Three.js) — bloqueada por falta de asset, tratada separadamente.
- Linkagem de páginas órfãs (`/atendimento/{bairro}` sem links de entrada, páginas internas sem link de volta pra Home) — item já identificado, mas é uma questão de arquitetura de informação/SEO, não de design visual; fica para uma tarefa própria a menos que apareça como bloqueio direto de algum achado de a11y desta fase (ex.: se o teste de navegação por teclado do a11y-architect esbarrar nisso, será documentado, não corrigido aqui).
- Otimizações de performance especulativas sem medição (ex.: code-splitting do GSAP para não carregar em mobile, já flagado como "para quando a Fase 8 chegar" na revisão final do GSAP) — só entra aqui se o Lighthouse desta rodada confirmar impacto real.
