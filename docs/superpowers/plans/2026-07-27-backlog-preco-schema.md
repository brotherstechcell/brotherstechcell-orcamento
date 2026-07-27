# Backlog: Preço nas Páginas de Serviço Geral + `lowPrice` no Schema — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar 3 achados Important adiados da revisão final da etapa anterior: FAQ/meta description das páginas de serviço geral sem preço real, e `AggregateOffer` sem `lowPrice`/`highPrice` nas páginas de modelo.

**Architecture:** `services.ts` ganha um placeholder literal `{price}` no `metaDescription` e na resposta "Quanto custa" de cada um dos 7 serviços. `src/pages/servicos/[slug].astro` substitui `{price}` pelo valor real de `getServiceStartingPrice()` (já existente) em tempo de build. `src/pages/iphone-[model]/[service].astro` ganha `lowPrice`/`highPrice` no `AggregateOffer`, calculados a partir de `page.prices` (já existente).

**Tech Stack:** Astro 7, TypeScript.

## Global Constraints

- **Zero regressão:** o HTML de `troca-de-tela`/`troca-de-bateria` (metaDescription, FAQ JSON-LD, texto visível do FAQ) deve ficar byte-idêntico ao atual depois do preenchimento do placeholder.
- **Nenhum dado novo fabricado:** os textos novos só reaproveitam o preço já calculado por `getServiceStartingPrice()` — o mesmo valor já exibido no bloco de preço da página (`ServicePricing.astro`). Nenhum tempo, depoimento ou taxa é inventado.
- **Limite de 155 caracteres** no `metaDescription` de cada serviço — verificado abaixo contra os preços reais atuais.
- Nenhuma mudança em `intro`, `symptoms`, ou qualquer outra pergunta do FAQ além de "Quanto custa" em cada serviço.

---

### Task 1: `services.ts` + `src/pages/servicos/[slug].astro` — preço no metaDescription e FAQ

**Files:**
- Modify: `src/data/services.ts`
- Modify: `src/pages/servicos/[slug].astro`

**Interfaces:**
- Consumes: `getServiceStartingPrice`, `type ServiceSlug` (já existentes em `src/data/modelPages.ts`).

- [ ] **Step 1: Trocar `metaDescription` dos 7 serviços em `src/data/services.ts`**

Troque o valor de `metaDescription` de cada uma das 7 entradas pelo texto abaixo (mantendo a mesma indentação/formato `metaDescription:\n  "..."` já usado no arquivo):

`troca-de-tela` (linha ~26):
```
"Troca de tela de iPhone com delivery gratuito em Manaus. Peças Econômica ou Premium, a partir de R${price}, com até 6 meses de garantia."
```

`troca-de-bateria` (linha ~76):
```
"Troca de bateria de iPhone com delivery gratuito em Manaus. Bateria homologada Anatel, a partir de R${price}, com até 6 meses de garantia."
```

`tampa-traseira` (linha ~124):
```
"Troca de tampa traseira de iPhone trincada ou quebrada, a partir de R${price}, com atendimento delivery em Manaus."
```

`camera` (linha ~173):
```
"Troca de câmera frontal ou traseira de iPhone com foco quebrado ou lente trincada, a partir de R${price}. Delivery em Manaus, orçamento pelo WhatsApp."
```

`dock` (linha ~217):
```
"Troca do dock (conector de carga) de iPhone que não carrega, a partir de R${price}. Delivery em Manaus, orçamento pelo WhatsApp."
```

`face-id` (linha ~261):
```
"Reparo de Face ID de iPhone que parou de reconhecer o rosto, a partir de R${price}. Diagnóstico e delivery em Manaus, orçamento pelo WhatsApp."
```

`reparo-em-placa` (linha ~304):
```
"Reparo em placa de iPhone que não liga, reinicia sozinho ou molhou, a partir de R${price}. Diagnóstico técnico com delivery em Manaus."
```

Nota: o `${price}` acima é **texto literal** — a string deve conter os caracteres `$`, `{`, `p`, `r`, `i`, `c`, `e`, `}` de verdade, não um template literal JavaScript sendo interpolado agora. Escreva exatamente como uma string TypeScript normal, ex.: `"...a partir de R${price}, com..."` (dentro de aspas duplas comuns, igual ao resto do arquivo). Não use crase/backtick.

- [ ] **Step 2: Trocar a resposta "Quanto custa" de cada serviço**

Troque a `answer` da pergunta que começa com `"Quanto custa"` em cada uma das 7 entradas (mantendo a `question` como está, só a `answer` muda):

`troca-de-tela` (pergunta "Quanto custa a troca de tela?", linha ~42):
```
"O valor varia conforme o modelo do iPhone e a qualidade da peça (Econômica ou Premium), a partir de R${price}. Consulte o preço exato do seu modelo na tabela da nossa página inicial ou pelo WhatsApp."
```

`troca-de-bateria` (pergunta "Quanto custa a troca de bateria?", linha ~97):
```
"O valor varia por modelo, a partir de R${price}. Consulte o preço do seu modelo na tabela da nossa página inicial ou pelo WhatsApp."
```

`tampa-traseira` (pergunta "Quanto custa a troca da tampa traseira?", linha ~144):
```
"O valor é a partir de R${price}, podendo variar conforme a disponibilidade da peça pro seu modelo. Consulte pelo WhatsApp e receba o orçamento exato em poucos minutos."
```

`camera` (pergunta "Quanto custa a troca de câmera?", linha ~194):
```
"A troca de câmera é a partir de R${price}, variando conforme o modelo e qual câmera precisa ser trocada (frontal ou traseira). Consulte pelo WhatsApp pro valor exato do seu modelo."
```

`dock` (pergunta "Quanto custa a troca do dock?", linha ~242):
```
"O valor é a partir de R${price}, variando conforme o modelo. Consulte pelo WhatsApp e receba o orçamento exato rapidamente."
```

`face-id` (pergunta "Quanto custa o reparo de Face ID?", linha ~285):
```
"O reparo de Face ID é a partir de R${price} — o valor final depende do que causou o problema, identificado no diagnóstico. Consulte pelo WhatsApp."
```

`reparo-em-placa` (pergunta "Quanto custa o reparo em placa?", linha ~329):
```
"O reparo em placa é a partir de R${price} — o valor final depende do problema identificado no diagnóstico, podendo variar bastante caso a caso. Fazemos o orçamento após avaliar o aparelho."
```

Mesma nota do Step 1: `${price}` é texto literal, não interpolação.

- [ ] **Step 3: Atualizar `src/pages/servicos/[slug].astro`**

Adicione, logo depois da linha `const { service } = Astro.props;`, o cálculo do preço e a interpolação:

```astro
const startingPrice = service.hasFixedPricing
  ? getServiceStartingPrice(service.slug as ServiceSlug)
  : undefined;
const description = startingPrice
  ? service.metaDescription.replace("{price}", startingPrice)
  : service.metaDescription;
const faq = startingPrice
  ? service.faq.map((item) =>
      item.question.startsWith("Quanto custa")
        ? { question: item.question, answer: item.answer.replace("{price}", startingPrice) }
        : item
    )
  : service.faq;
```

Troque `service.faq.map(({ question, answer }) => ({` (dentro de `faqJsonLd`) por `faq.map(({ question, answer }) => ({` — ou seja, o JSON-LD do FAQ passa a usar a variável `faq` (já com o preço interpolado) em vez de `service.faq` diretamente.

Troque `description={service.metaDescription}` (na tag `<BaseLayout>`) por `description={description}`.

Troque `<ServiceFaq faq={service.faq} />` por `<ServiceFaq faq={faq} />`.

Troque a prop `startingPrice` de `<ServicePricing .../>`, que hoje é `startingPrice={service.hasFixedPricing ? getServiceStartingPrice(service.slug as ServiceSlug) : undefined}`, por `startingPrice={startingPrice}` (reaproveita a variável já calculada, sem recalcular).

- [ ] **Step 4: Verificar**

Run:
```bash
npx astro build
grep -o 'Peças Econômica ou Premium, a partir de R\$[0-9,]*' dist/servicos/troca-de-tela/index.html
grep -o 'a partir de R\$[0-9,]*' dist/servicos/tampa-traseira/index.html
grep -o 'a partir de R\$[0-9,]*' dist/servicos/dock/index.html
grep -o 'a partir de R\$[0-9,]*' dist/servicos/camera/index.html
grep -c '{price}' dist/servicos/*/index.html
```
Expected: `troca-de-tela` mostra `"Peças Econômica ou Premium, a partir de R$249,90"` (mesmo valor de sempre); `tampa-traseira`, `dock`, `camera` mostram `"a partir de R$"` seguido de um preço real (não mais texto genérico); a busca por `{price}` literal em qualquer página de `dist/servicos/` não deve encontrar nenhuma ocorrência (confirma que todo placeholder foi substituído).

Verifique também que o texto do FAQ visível bate com o JSON-LD:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/servicos/tampa-traseira/index.html', 'utf8');
const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
let m, faqBlock;
while ((m = re.exec(html))) { const p = JSON.parse(m[1]); if (p['@type'] === 'FAQPage') faqBlock = p; }
const custaAnswer = faqBlock.mainEntity.find(q => q.name.startsWith('Quanto custa')).acceptedAnswer.text;
console.log('resposta no JSON-LD:', custaAnswer);
console.log('aparece no HTML visivel?', html.includes(custaAnswer));
"
```
Expected: `aparece no HTML visivel? true`.

- [ ] **Step 5: Commit**

```bash
git add src/data/services.ts "src/pages/servicos/[slug].astro"
git commit -m "feat: interpolate real starting price into service page meta description and FAQ"
```

---

### Task 2: `lowPrice`/`highPrice` no `AggregateOffer` das páginas de modelo

**Files:**
- Modify: `src/pages/iphone-[model]/[service].astro`

**Interfaces:**
- Consumes: `page.prices: ModelPriceEntry[]` (já existente, de `src/data/modelPages.ts`).

- [ ] **Step 1: Calcular e adicionar `lowPrice`/`highPrice`**

Antes do bloco `const productJsonLd = JSON.stringify({...})`, adicione:

```astro
const priceValues = page.prices.map((p) => parseFloat(p.price.replace(",", ".")));
const lowPrice = Math.min(...priceValues).toFixed(2);
const highPrice = Math.max(...priceValues).toFixed(2);
```

Dentro do objeto `offers` de `productJsonLd`, adicione as duas chaves logo depois de `"priceCurrency": "BRL",`:

```astro
    "lowPrice": lowPrice,
    "highPrice": highPrice,
```

O bloco `offers` completo fica:
```astro
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "BRL",
    "lowPrice": lowPrice,
    "highPrice": highPrice,
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "ElectronicsStore", "name": "Brothers Techcell" }
  }
```

- [ ] **Step 2: Verificar**

Run:
```bash
npx astro build
node -e "
const fs = require('fs');
const samples = ['iphone-13/troca-de-tela', 'iphone-13/tampa-traseira', 'iphone-13/face-id'];
for (const s of samples) {
  const html = fs.readFileSync('dist/' + s + '/index.html', 'utf8');
  const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
  let m, prod;
  while ((m = re.exec(html))) { const p = JSON.parse(m[1]); if (p['@type'] === 'Product') prod = p; }
  console.log(s + ': lowPrice=' + prod.offers.lowPrice + ' highPrice=' + prod.offers.highPrice);
}
"
```
Expected: `iphone-13/troca-de-tela` mostra `lowPrice` ≠ `highPrice` (Econômica vs Premium, dois valores reais diferentes); `iphone-13/tampa-traseira` mostra `lowPrice === highPrice` (preço único); `iphone-13/face-id` mostra `lowPrice === highPrice` também. Nenhum valor deve ser `"NaN"` ou `"Infinity"`.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/iphone-[model]/[service].astro"
git commit -m "feat: add lowPrice/highPrice to AggregateOffer JSON-LD on model pages"
```

---

### Task 3: Verificação final

**Files:** nenhum arquivo novo — task de verificação.

- [ ] **Step 1: Build completo**

Run: `npx astro build`
Expected: sucesso, 298 páginas, sem erros.

- [ ] **Step 2: Zero regressão em tela/bateria**

Run:
```bash
node -e "
const fs = require('fs');
const tela = fs.readFileSync('dist/servicos/troca-de-tela/index.html', 'utf8');
console.log('meta description bate?', tela.includes('a partir de R\$249,90, com até 6 meses de garantia'));
"
```
Expected: `true`.

- [ ] **Step 3: Confirmar nenhuma página fora de escopo mudou**

Run:
```bash
git diff --stat 7434f6b..HEAD -- src/pages/index.astro src/pages/atendimento src/components/ModelHero.astro src/components/ModelCrossLinks.astro src/scripts/main.js
```
Expected: saída vazia.

---
