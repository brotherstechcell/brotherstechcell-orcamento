# Expansão das Páginas por Modelo para os 5 Serviços Restantes — Design

## Contexto

Etapa 3 (`docs/superpowers/specs/2026-07-25-paginas-modelo-design.md`) criou 78 páginas `/iphone-{modelo}/{servico}` só para troca-de-tela e troca-de-bateria, porque na época os outros 5 serviços (tampa traseira, câmera, dock, Face ID, reparo em placa) eram "sob consulta" sem preço diferenciado por modelo — gerar página por modelo pra eles teria sido thin/duplicate content. Essa premissa não vale mais: o catálogo de preços da Supabase (`get-public-pricing-catalog`) hoje tem preço real e distinto por modelo para os 5 serviços restantes também (confirmado por consulta direta ao catálogo ao vivo em 2026-07-27).

## Escopo: contagem real por serviço

Verificado no catálogo ao vivo (`c.prices` filtrado por `active: true`, cruzado com `c.models`):

| Serviço no site | Chave no catálogo | Modelos cobertos | Páginas novas |
|---|---|---|---|
| tampa-traseira | `tampa_traseira` | 40/40 | 40 |
| dock | `conector_carga` | 40/40 | 40 |
| camera | `camera_frontal` + `camera_traseira` | 39/40 (falta "17 Air") | 39 |
| face-id | `face_id` | 31/40 (faltam 6/6S/6S Plus/7/7 Plus/8/8 Plus — sem Face ID — + SE 2/3 — usa Touch ID — + "17 Air" — dado ainda não cadastrado) | 31 |
| reparo-em-placa | `reparo_placa` | 39/40 (falta "17 Air") | 39 |
| **Total** | | | **189** |

Somado às 78 páginas de tela/bateria (Etapa 3) e às 18 de bairro (etapa anterior), o site passa de 109 para **~298 páginas**. Mesma disciplina da Etapa 3: só gera página quando existe preço real cadastrado pro par modelo×serviço — nenhum modelo sem dado ganha página "sob consulta" fabricada.

## Decisão sobre estrutura de preço

Duas descobertas no catálogo mudam a forma de exibir o preço nesses 5 serviços (diferente do padrão Econômica/Premium de tela/bateria):

1. **Preço Econômica = Premium em todos os modelos, nos 5 serviços.** Não existe diferenciação real de qualidade nesses serviços no catálogo — é 1 preço único por modelo, não 2 níveis. As páginas desses 5 serviços mostram **1 preço só**, sem mencionar "Econômica" ou "Premium".
2. **Face ID e reparo em placa têm preço variável por natureza do reparo**, não só por modelo — o FAQ já existente desses dois serviços (`services.ts`) já diz isso ("o valor depende do problema identificado no diagnóstico"). Essas 2 páginas mostram o preço do catálogo como **"A partir de R$X"** + nota de que o valor final depende do diagnóstico. Tampa traseira, câmera e dock (trocas de peça bem definidas) mostram o preço como valor direto, sem "a partir de".

Resultado: 3 modos de exibição de preço nas páginas por modelo:
- **dual-tier** (tela, bateria — já existente, sem mudança visual): Econômica + Premium lado a lado.
- **single** (tampa-traseira, dock): 1 preço direto.
- **starting-from** (face-id, reparo-em-placa): "A partir de R$X" + nota de diagnóstico.

Câmera é um caso à parte: a página `/iphone-{modelo}/camera` mostra **2 preços com rótulo** (Frontal e Traseira), cada um no modo single — não cria uma página nova, mantém a URL já prevista em `services.ts` (`camera`).

## Arquitetura técnica

### 1. `src/scripts/prices.js` — expandir `CONFIG.devices`

Regenerar o snapshot estático a partir do catálogo ao vivo, incluindo as 6 chaves de serviço que faltam por modelo (`tampa_traseira`, `conector_carga`, `camera_frontal`, `camera_traseira`, `face_id`, `reparo_placa`), usando exatamente a mesma transformação já usada pra tela/bateria (`parseCatalogToDevices()` em `main.js`, já é genérica — usa `p.service_id` cru como chave, não precisa de mudança nela): renomeia `intermediaria`→"Econômica", mantém `premium`→"Premium", ignora `basica`, fallback de parcela `(cash_price * 1.1416) / 12` quando `installment_12x` for nulo. Aditivo — não remove nem altera as chaves `tela`/`bateria` já existentes.

### 2. `src/data/modelPages.ts` — generalizar de 2 para 7 serviços

Hoje o arquivo tem `SERVICE_SLUGS` fixo (`troca-de-tela`, `troca-de-bateria`) e o tipo `ModelPageData` tem campos hardcoded `economica`/`premium`. Passa a ter uma tabela de configuração por serviço:

```typescript
type ServiceSlug =
  | "troca-de-tela" | "troca-de-bateria" | "tampa-traseira"
  | "camera" | "dock" | "face-id" | "reparo-em-placa";

type PriceDisplayMode = "dual-tier" | "single" | "starting-from" | "dual-single";

interface ServiceModelConfig {
  slug: ServiceSlug;
  catalogKeys: string[];       // 1 chave normalmente; 2 pra câmera (frontal + traseira)
  displayMode: PriceDisplayMode;
  priceLabels?: string[];      // só câmera: ["Câmera Frontal", "Câmera Traseira"]
}
```

`ModelPriceEntry { label: string; price: string; installment: string }` substitui os campos `economica`/`premium` por um array `prices: ModelPriceEntry[]` genérico:
- `dual-tier`: 2 entradas (`"Econômica"`, `"Premium"`).
- `single` / `starting-from`: 1 entrada (`label: ""`), lida da chave `"Premium"` do catálogo (Econômica e Premium são idênticos nesses serviços, confirmado sem exceção nos 40 modelos × 6 serviços).
- `dual-single`: 2 entradas rotuladas (`"Câmera Frontal"`, `"Câmera Traseira"`).

`getAllModelPages()` itera `SERVICE_MODEL_CONFIG` em vez da lista fixa de 2 serviços. Título, descrição e resposta do FAQ "Quanto custa" (heurística `item.question.startsWith("Quanto custa")`, já compatível com as 5 novas perguntas de `services.ts`) passam a ser montados por `displayMode` em vez de hardcoded pra Econômica/Premium.

**Garantia de zero regressão para tela/bateria:** o branch `dual-tier` do template de título/FAQ gera exatamente o mesmo texto que o código atual produz hoje — verificação obrigatória no plano: comparar o HTML gerado de 2-3 páginas de tela/bateria antes e depois do refactor (deve ser byte-idêntico no conteúdo visível).

### 3. `src/components/ModelHero.astro` — variantes de exibição

Passa a receber `page.priceDisplay` e renderizar por modo:
- `dual-tier`: exatamente o card atual (Econômica: R$X / Premium: R$Y) — sem alteração de markup.
- `single`: 1 linha de preço, sem rótulo de qualidade.
- `starting-from`: "A partir de R$X" + `<p>` com a nota "*o valor final é confirmado no diagnóstico*".
- `dual-single`: 2 linhas rotuladas (Câmera Frontal / Câmera Traseira), cada uma no formato single.

### 4. `src/components/ModelCrossLinks.astro` — generalizar de binário pra lista

Hoje só alterna entre "o outro serviço" (troca-de-tela ↔ troca-de-bateria). Passa a listar **todos os serviços que aquele modelo específico tem página**, derivado de `getAllModelPages().filter(p => p.modelSlug === modelSlug && p.serviceSlug !== currentServiceSlug)` — sem lista hardcoded de 2 opções. Efeito colateral positivo: uma vez que um modelo tenha página em mais de 2 serviços, a seção "Veja Também" cresce automaticamente, aumentando o link interno entre as páginas de modelo sem trabalho extra.

### 5. `src/components/ServicePricing.astro` — preço mínimo dinâmico (corrige bug latente)

Hoje o branch `hasFixedPricing` tem o texto **hardcoded** "A partir de R$249,90" — só correto por coincidência pra tela/bateria. Recebe um novo prop `startingPrice: string`, calculado em build-time por uma função nova `getServiceStartingPrice(serviceSlug): string` em `modelPages.ts` (mínimo de `cash_price` entre todas as páginas geradas daquele serviço, mesma formatação `R$X,XX` já usada). Isso corrige o valor mostrado nas 7 páginas de serviço gerais (incluindo tela/bateria, que ganha o mesmo tratamento pra não deixar 2 fontes de verdade divergentes) e evita reproduzir o mesmo tipo de bug de preço desatualizado já encontrado e corrigido na revisão final da Etapa 3.

`src/data/services.ts`: `hasFixedPricing` passa de `true` (2 serviços) para `true` nos 7 — o campo continua existindo no tipo (não é removido), preservando a extensibilidade pra um eventual 8º serviço sem preço por modelo no futuro (ex.: o catálogo já tem `recuperacao_tela` com só 2/40 modelos cadastrados — um caso real de serviço ainda não maduro o suficiente pra ganhar página).

### 6. `src/pages/servicos/[slug].astro` — `ModelDirectory` nos 5 serviços novos

`ModelDirectory.astro` já é genérico o bastante (filtra por `serviceSlug` recebido via prop) — só precisa alargar o tipo do prop de `"troca-de-tela" | "troca-de-bateria"` pra `ServiceSlug` (tipo exportado de `modelPages.ts`). A condição `{service.hasFixedPricing && <ModelDirectory .../>}` já existente passa a valer pros 7 serviços automaticamente, sem mudança de lógica.

## Títulos e descrições — verificados contra os 40 modelos reais

Título: `"{Verbo} {Serviço} iPhone {modelo} | Brothers Techcell"`, mesma convenção da Etapa 3 (sem "Manaus" no título, que aparece no H1/meta description). Verificado programaticamente contra os 40 nomes reais (pior caso sempre "11 Pro Max"/"12 Pro Max", nomes mais longos):

| Serviço | Template | Pior caso (chars) |
|---|---|---|
| tampa-traseira | `"Troca Tampa Traseira iPhone {m} \| Brothers Techcell"` (sem "de" — a versão com "de" estourava 60 por 1 char) | 58 |
| camera | `"Troca de Câmera iPhone {m} \| Brothers Techcell"` | 53 |
| dock | `"Troca de Dock iPhone {m} \| Brothers Techcell"` | 51 |
| face-id | `"Reparo de Face ID iPhone {m} \| Brothers Techcell"` | 55 |
| reparo-em-placa | `"Reparo em Placa iPhone {m} \| Brothers Techcell"` | 53 |

Todos ≤ 60. Meta description (inclui preço + "Manaus" + delivery/garantia, mesmo padrão da Etapa 3): verificado ≤ 134 caracteres no pior caso pros 5 serviços — dentro do limite de 155.

## Schema.org

Mesmo padrão já em produção na rota `iphone-[model]/[service].astro`: `Service` + `Product`/`AggregateOffer` + `FAQPage` + `BreadcrumbList`. Nenhuma mudança estrutural no JSON-LD — os blocos já são genéricos (usam `page.serviceName`, `page.description`, `page.faq`, nenhum referencia `economica`/`premium` diretamente), então funcionam para os novos modos de preço sem alteração.

## Critério de sucesso

1. `npx astro build` gera as 189 páginas novas (`dist/iphone-{modelo}/{servico}/index.html`), totalizando 267 páginas de modelo (78 + 189) mais as 18 de bairro e as demais páginas estáticas.
2. Sitemap automático inclui as 189 novas URLs.
3. Cada página tem preço real e distinto (verificável comparando 2-3 modelos por serviço), no modo de exibição correto (dual-tier / single / starting-from / dual-single conforme a tabela acima).
4. **Zero regressão nas 78 páginas de tela/bateria já publicadas** — HTML visível idêntico ao gerado antes do refactor de `modelPages.ts`/`ModelHero.astro`/`ModelCrossLinks.astro`.
5. `ServicePricing.astro` mostra o preço mínimo real (não mais hardcoded) nas 7 páginas de serviço gerais — incluindo tela/bateria, cujo valor deve continuar batendo com o que já estava publicado.
6. JSON-LD válido (`Service`+`Product`+`FAQPage`+`BreadcrumbList`) em cada página nova, FAQ batendo com o texto visível.
7. `ModelDirectory` aparece nas 5 páginas de serviço gerais que ganham `hasFixedPricing: true`, listando os modelos corretos por serviço.
8. `ModelCrossLinks` em cada página de modelo lista todos os outros serviços que aquele modelo específico tem página (não mais binário).
9. Nenhuma mudança de conteúdo nas páginas sem relação (home, bairro, e o conteúdo já aprovado das 7 páginas de serviço gerais além do especificado acima).

## Fora de escopo

- Página institucional por modelo (`/iphone-13` como hub, listando todos os 7 serviços daquele modelo) — mencionada no plano mestre, não parte desta etapa.
- Sincronização automática de preço sem rebuild (mesma limitação conhecida documentada na Etapa 3).
- `recuperacao_tela` (só 2/40 modelos no catálogo — dado insuficiente demais até pra "a partir de", fica de fora).
- Blog, IA do site, GBP, backlinks — outras seções do plano mestre.
