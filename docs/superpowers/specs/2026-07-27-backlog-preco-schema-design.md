# Backlog: Preço nas Páginas de Serviço Geral + `lowPrice` no Schema — Design

## Contexto

Achados Important da revisão final da etapa "Expansão das Páginas por Modelo" (2026-07-27), registrados como pendência deliberada em vez de expandir o escopo daquela etapa:

1. As FAQ "Quanto custa" de `tampa-traseira`, `dock` e `camera` (`/servicos/*`) ainda respondem "consulte pelo WhatsApp" mesmo a página já mostrando um preço real acima (`ServicePricing.astro`, já corrigido na etapa anterior). Também replicado no JSON-LD `FAQPage`.
2. O `metaDescription` dessas 5 páginas (as 3 acima + `face-id` e `reparo-em-placa`) não cita preço, diferente de `troca-de-tela`/`troca-de-bateria`.
3. O JSON-LD `Product`/`AggregateOffer` em `/iphone-{modelo}/{servico}` não tem `lowPrice` — Google Search Console reporta campo obrigatório faltando, suprime rich results de preço. Pré-existente da Etapa 3 (páginas de modelo original), agora replicado em 269 páginas em vez de 80.

## Decisão técnica: uma fonte de verdade, não 3 novos textos hardcoded

Simplesmente escrever 3 novos preços hardcoded em `services.ts` reproduziria o mesmo problema que a revisão já sinalizou como risco (Minor #13 daquela revisão): `troca-de-tela`/`troca-de-bateria` já têm "R$249,90" digitado 2 vezes em `services.ts` (metaDescription + FAQ), sem ligação com o preço computado que `ServicePricing.astro` já usa — se o catálogo mudar, os dois hardcoded ficam errados silenciosamente.

**Solução:** `metaDescription` e a resposta "Quanto custa" de cada serviço ganham um placeholder literal `{price}` no texto. `src/pages/servicos/[slug].astro` substitui `{price}` pelo valor real de `getServiceStartingPrice(service.slug)` (já existente, mesma função que alimenta `ServicePricing.astro`) em tempo de build, só quando `service.hasFixedPricing`. Isso fecha a lacuna nos 5 serviços pendentes **e** retroativamente em tela/bateria, eliminando de vez a duplicação de fonte de verdade.

Verificado: os 2 textos de tela/bateria com `{price}` substituído pelo preço real de hoje (`249,90`) ficam **byte-idênticos** aos textos hardcoded atuais — zero regressão.

Os textos novos das 5 páginas pendentes (metaDescription + FAQ) foram escritos incorporando o preço sem inventar nenhum fato novo — mesma disciplina do projeto inteiro (nenhum dado fabricado, só reaproveita o preço já calculado e já exibido na página). Testados programaticamente contra os preços reais atuais: todos os 7 `metaDescription` ficam ≤ 155 caracteres.

## Escopo 2: `lowPrice`/`highPrice` no schema

`src/pages/iphone-[model]/[service].astro` já recebe `page.prices: ModelPriceEntry[]` (1 ou 2 entradas conforme o modo de exibição). `AggregateOffer` ganha `lowPrice`/`highPrice` calculados a partir do mínimo/máximo desse array — pra `single`/`starting-from` (1 preço), `lowPrice === highPrice`. Nenhuma mudança de estrutura além disso (mesmo padrão já em produção, `Service`+`Product`+`FAQPage`+`BreadcrumbList`).

## Fora de escopo

- Reescrever qualquer outro campo de `services.ts` (intro, symptoms, outras perguntas do FAQ) — só `metaDescription` e a resposta "Quanto custa" mudam.
- Qualquer novo dado de negócio (tempo, depoimento, taxa) — só reaproveita preço já calculado.
- Blog, páginas institucionais por modelo, IA do site — outras seções do plano mestre.

## Critério de sucesso

1. Os 5 `metaDescription` e as 3 respostas de FAQ (tampa-traseira/dock/camera) pendentes passam a citar o preço real, sem quebrar o limite de 155 caracteres.
2. `face-id`/`reparo-em-placa` também ganham preço no metaDescription e no FAQ, mantendo a linguagem de "a partir de"/diagnóstico já usada.
3. `troca-de-tela`/`troca-de-bateria`: HTML byte-idêntico ao atual (zero regressão).
4. `AggregateOffer` em todas as 269 páginas de modelo tem `lowPrice`/`highPrice` válidos e corretos por página.
5. `npx astro build` sem erros, 298 páginas.
