# Páginas por Modelo (`/iphone-{modelo}/{servico}`) — Design

## Contexto

Etapa 3 do plano de SEO da Brothers Techcell. As Etapas 1 (migração pro Astro) e 2 (7 páginas de serviço) estão concluídas e no ar. Esta etapa cria páginas específicas por modelo de iPhone para os dois serviços com preço real por modelo — troca de tela e troca de bateria — capturando buscas do tipo "quanto custa trocar a tela do iPhone 13 em Manaus".

## Escopo: por que só 2 dos 7 serviços

`src/scripts/prices.js` (`CONFIG.devices`) tem preço real, distinto por modelo, para **39 modelos** × **troca de tela** e **troca de bateria** (Econômica/Premium cada). Os outros 5 serviços (tampa traseira, câmera, dock, Face ID, placa) não têm preço por modelo — são "sob consulta" igual pra qualquer aparelho. Criar páginas por modelo pra esses 5 geraria conteúdo praticamente idêntico entre os 39 modelos de cada serviço (thin/duplicate content, penalizado pelo Google). **Decisão (aprovada com o usuário):** páginas por modelo só para troca de tela e troca de bateria — **39 × 2 = 78 páginas**, todas com preço real e distinto. Os outros 5 serviços continuam só na página de serviço geral já existente.

## Fonte de dados e slug dos modelos

`CONFIG.devices` hoje só é exposto para o browser (`window.CONFIG = CONFIG;`, sem `export`). Para o build da Astro conseguir ler os preços em tempo de build (gerando HTML estático com preço real, sem depender de JS no cliente), `src/scripts/prices.js` ganha uma linha adicional `export { CONFIG };` logo após `window.CONFIG = CONFIG;` — mudança puramente aditiva, não altera nenhum comportamento existente no browser.

Os 39 nomes de modelo em `CONFIG.devices` (`"6"`, `"7"`, ..., `"13 Pro Max"`, `"SE 2/3"`, `"XS Max"`, etc.) viram slugs de URL via:
```typescript
function slugifyModel(model: string): string {
  return model.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
}
```
Testado contra os 39 nomes reais: **39 slugs únicos, zero colisão** (ex.: `"13 Pro Max"` → `"13-pro-max"`, `"SE 2/3"` → `"se-2-3"`, `"XS Max"` → `"xs-max"`, `"6S Plus"` → `"6s-plus"`).

## URLs

`/iphone-{slug-do-modelo}/{slug-do-servico}`, ex.: `/iphone-13/troca-de-tela`, `/iphone-13-pro-max/troca-de-bateria`, `/iphone-se-2-3/troca-de-tela`.

## Arquitetura técnica

```
src/pages/iphone-[model]/[service].astro   # rota dupla dinâmica, getStaticPaths() gera as 78 combinações
src/data/modelPages.ts                      # slugifyModel() + função que monta o conteúdo de cada página
                                             # combinando ServiceData (services.ts, Etapa 2) + preço real (CONFIG.devices)
```

`getStaticPaths()` itera `Object.keys(CONFIG.devices)` × `["troca-de-tela", "troca-de-bateria"]`, retornando `{ params: { model: slug, service: slug }, props: { modelName, serviceSlug, pricing } }` pra cada uma das 78 combinações.

### Conteúdo — reaproveitado, não reescrito

Cada página reaproveita os componentes da Etapa 2 (`ServiceSymptoms`, `TrustFacts`, `ServiceFaq`, `Header`, `Footer`, etc.) e o conteúdo já escrito em `services.ts`, com 3 elementos únicos por página:

1. **Título/H1/meta**: template com o nome real do modelo.
   - Title: `"Troca de {Tela|Bateria} iPhone {modelo} | Brothers Techcell"` — testado contra o nome de modelo mais longo (`"11 Pro Max"`/`"12 Pro Max"`/etc., todos do mesmo tamanho): 51 e 54 caracteres, dentro do limite de 60. **Nota:** o título não inclui "Manaus" (não cabia no limite de 60 caracteres pros nomes de modelo mais longos combinados com "Troca de Bateria") — "Manaus" aparece no H1 e na meta description, que têm mais espaço.
   - Meta description: inclui o modelo, "Manaus", e o preço a partir do modelo (ex.: `"Troca de tela do iPhone 13 em Manaus a partir de R$X. Delivery gratuito, garantia real, atendimento todos os dias."`).
2. **Bloco de preço**: valor real Econômica/Premium daquele modelo específico (não mais "a partir de R$249,90" genérico — agora é o preço exato).
3. **Resposta da pergunta "Quanto custa?" no FAQ**: substituída por uma resposta com o preço real do modelo; as outras perguntas do FAQ (garantia, tempo, deslocamento, dados) permanecem exatamente como em `services.ts`, sem reescrita.

Sintomas, processo, garantia, bairros atendidos: **idênticos** aos já escritos na página de serviço geral (mesma fonte, `services.ts`), sem nenhuma reescrita por modelo.

### Links internos

- Cada página de modelo linka para a página do outro serviço do mesmo modelo (tela ↔ bateria) e para a página de serviço geral correspondente (`/servicos/troca-de-tela` ou `/servicos/troca-de-bateria`).
- **Adição nas páginas de serviço geral já existentes:** `src/pages/servicos/troca-de-tela` e `.../troca-de-bateria` ganham uma nova seção "Escolha seu Modelo" ao final, listando os 39 modelos com link pra cada página específica. É uma adição aditiva a `src/pages/servicos/[slug].astro` (só para os 2 serviços com `hasFixedPricing: true`) — não deve alterar nada do conteúdo já aprovado nessas páginas, só acrescentar uma seção nova.

### Schema.org

Mesmo padrão da Etapa 2 por consistência: `Service` + `FAQPage` + `BreadcrumbList` (Home → Serviço → iPhone {modelo}). `Product`/`Offer` schema (que aproveitaria melhor o preço real disponível aqui) fica registrado como possível melhoria futura, fora de escopo desta etapa.

### Consistência de dados (nota, não um problema novo)

O preço exibido é o snapshot estático de `CONFIG.devices` no momento do build — o mesmo dado que a home já usa hoje pro "a partir de R$249,90". Não se atualiza sozinho se a tabela de preços mudar na Supabase; precisa de novo build e deploy. Esse comportamento já existe desde a Etapa 2, não é uma limitação nova.

## Critério de sucesso

1. `npx astro build` gera 78 arquivos `dist/iphone-{modelo}/{servico}/index.html`.
2. Sitemap automático inclui as 78 novas URLs.
3. Cada página tem preço real e distinto (verificável comparando 2-3 páginas de modelos diferentes).
4. JSON-LD válido (`Service`+`FAQPage`+`BreadcrumbList`) em cada página, com o FAQ batendo com o texto visível.
5. `/servicos/troca-de-tela` e `/servicos/troca-de-bateria` ganham a seção "Escolha seu Modelo" com 39 links cada, sem nenhuma outra mudança de conteúdo nessas páginas.
6. Nenhuma mudança nas páginas de serviço sem preço fixo, na home, ou em qualquer componente/dado da Etapa 1 e 2 além do especificado acima.

## Fora de escopo

- Páginas por modelo pros outros 5 serviços (thin content, descartado).
- Schema `Product`/`Offer`.
- Blog (Etapa 4).
- Atualização automática de preço sem rebuild.
