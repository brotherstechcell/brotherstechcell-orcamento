# Páginas de Serviço (`/servicos/*`) — Design

## Contexto

Etapa 2 do plano de SEO da Brothers Techcell (ver `docs/superpowers/specs/2026-07-24-migracao-astro-design.md` para a Etapa 1, já concluída e mesclada na `main`). O site hoje é uma única página Astro (`src/pages/index.astro`) com uma seção de preços (tela/bateria) e uma lista textual de "outros serviços" dentro do seletor de preços. Esta etapa cria 7 páginas dedicadas, uma por serviço, para capturar buscas orgânicas específicas ("troca de tela iPhone Manaus", "conserto de câmera iPhone Manaus" etc.) que a home não segmenta.

## Dados disponíveis vs. não disponíveis

`src/scripts/prices.js` (`CONFIG.devices`, alimentado ao vivo por um endpoint Supabase) só tem preço por modelo para **troca de tela** e **troca de bateria**, em duas variantes de qualidade (Econômica/Premium), com parcelamento em 12x. Os outros 5 serviços (tampa traseira, câmera, dock, Face ID, placa) não têm preço nem tempo médio documentado em nenhum lugar do projeto — hoje aparecem só como texto genérico ("consulte pelo WhatsApp").

**Decisão (aprovada com o usuário):** as páginas de tela e bateria usam dados reais de preço; as outras 5 tratam preço e tempo como "sob consulta via WhatsApp", sem inventar números. Isso significa essas 5 páginas terão menos texto corrido (~500-800 palavras) que o que o plano de SEO original pedia (800-1500) — decisão deliberada para não encher a página de conteúdo genérico só para bater meta de palavras (thin content é ruim pra SEO, não bom).

## URLs e nomes dos 7 serviços

Mesmos nomes já usados no JSON-LD `hasOfferCatalog` da home (`src/pages/index.astro`), para manter consistência entre o schema e as páginas reais:

| Slug | Nome | Tem preço fixo? |
|---|---|---|
| `troca-de-tela` | Troca de Tela de iPhone | Sim |
| `troca-de-bateria` | Troca de Bateria de iPhone | Sim |
| `tampa-traseira` | Troca de Tampa Traseira de iPhone | Não — sob consulta |
| `camera` | Troca de Câmera de iPhone | Não — sob consulta |
| `dock` | Troca de Dock (Conector de Carga) de iPhone | Não — sob consulta |
| `face-id` | Reparo de Face ID de iPhone | Não — sob consulta |
| `reparo-em-placa` | Reparo em Placa de iPhone | Não — sob consulta |

URL final: `/servicos/<slug>` (ex: `/servicos/troca-de-tela`).

## Arquitetura técnica

```
src/
├── data/
│   └── services.ts          # array com os 7 serviços (ver shape abaixo)
├── pages/
│   └── servicos/
│       └── [slug].astro     # rota dinâmica, getStaticPaths() gera as 7 páginas
├── components/
│   ├── ServiceHero.astro         # novo — H1 + intro + CTA, específico da página de serviço
│   ├── ServiceSymptoms.astro     # novo — "sinais de que você precisa desse reparo"
│   ├── ServicePricing.astro      # novo — bloco de preço; renderiza tabela real (tela/bateria) OU "sob consulta" (demais)
│   ├── ServiceFaq.astro          # novo — reaproveita o padrão visual de Faq.astro, conteúdo por prop
│   ├── OtherServicesList.astro   # novo — links para os outros 6 serviços
│   └── (Header, Footer, FloatingWhatsapp, BottomNav — reaproveitados sem alteração)
└── layouts/
    └── BaseLayout.astro     # reaproveitado sem alteração de interface
```

### Shape de `src/data/services.ts`

```typescript
export interface ServiceFaqItem {
  question: string;
  answer: string; // texto plano, sem HTML — mesma regra usada em Faq.astro (Etapa 1)
}

export interface ServiceData {
  slug: string;
  name: string;              // "Troca de Tela de iPhone" — usado no H1, title, schema
  shortName: string;         // "troca de tela" — usado em frases corridas ("agende sua troca de tela")
  metaTitle: string;         // ≤60 caracteres
  metaDescription: string;   // ≤155 caracteres
  intro: string;             // 2-3 frases de abertura
  hasFixedPricing: boolean;
  symptoms: string[];        // "sinais de que você precisa desse reparo"
  whatsappMessage: string;   // mensagem pré-preenchida no CTA (usa CONFIG.contact.phoneRaw)
  faq: ServiceFaqItem[];     // 5-8 perguntas
}

export const services: ServiceData[] = [ /* 7 entradas */ ];
```

### `src/pages/servicos/[slug].astro`

Usa `getStaticPaths()` retornando um path por entrada de `services`, passando o objeto inteiro como `props`. Isso gera 7 arquivos HTML estáticos no build (`dist/servicos/troca-de-tela/index.html` etc.), compatível com `output: 'static'` — nenhuma mudança de configuração do Astro é necessária.

Composição da página (mesma ordem para as 7):
1. `Header`
2. `ServiceHero` (H1, intro, CTA WhatsApp)
3. `ServiceSymptoms`
4. `ServicePricing` (tabela real para tela/bateria; card "sob consulta" com CTA WhatsApp para as demais)
5. Bloco de garantia/bairros atendidos: novo componente `TrustFacts.astro`, reaproveitado pelas 7 páginas de serviço. **Correção pós-self-review:** esse texto não existe hoje pronto em nenhum lugar do site — `Diferenciais.astro` e `Footer.astro` tratam do tema com frases diferentes entre si, não duplicadas. `TrustFacts.astro` é conteúdo novo (não uma extração), escrito uma vez a partir dos fatos já estabelecidos e verificados na Etapa 1 (garantia 7/30/90 dias por qualidade da peça, delivery gratuito na maioria dos bairros de Manaus, atendimento todos os dias das 8h às 20h) — sem introduzir nenhum fato novo não verificado.
6. `ServiceFaq`
7. `OtherServicesList`
8. `CtaFinal` (reaproveitado da home, sem alteração)
9. `Footer`, `FloatingWhatsapp`, `BottomNav`

### Schema.org por página

Cada página recebe, via `extraJsonLd` do `BaseLayout` (interface já existe, não muda):
- `Service` (nome, `areaServed: Manaus`, `provider: ElectronicsStore`) — mesmo shape já usado dentro do `hasOfferCatalog` da home, mas agora também como entidade própria da página.
- `FAQPage` — construído a partir do array `faq` de `services.ts`, mesmo padrão de fidelidade (texto do schema = texto visível) já usado em `Faq.astro`.
- `BreadcrumbList` — Home (`/`) → Serviços (posição 2, sem página própria ainda — `item` aponta pra `/#telas-precos`) → nome do serviço (posição 3, página atual).

### SEO on-page

- `<title>`: `{metaTitle}` de `services.ts` (padrão: "{Nome do Serviço} em Manaus | Brothers Techcell", ≤60 caracteres).
- Canonical: `https://brotherstechcell-orcamento.vercel.app/servicos/{slug}` (mesma ressalva de domínio provisório da Etapa 1).
- `og:image`: reaproveita `/og-image.png` (mesma imagem da home) — nenhuma imagem nova é gerada.

### Internal linking (Fase 11 do plano original)

- Home → não ganha link de navegação nova no header nesta etapa (fora de escopo, evita mexer em UI já aprovada); o crawling acontece via sitemap automático (`@astrojs/sitemap` já cobre qualquer página nova em `src/pages/`).
- Cada página de serviço → linka para as outras 6 (`OtherServicesList`) e para a home (`Header`/`Footer` já fazem isso).
- Página de modelo (Etapa 3, futura) vai linkar de volta pra cá — não implementado ainda.

## Critério de sucesso

1. `npx astro build` gera 7 arquivos `dist/servicos/<slug>/index.html`, um por serviço.
2. `sitemap-index.xml`/`sitemap-0.xml` gerado pelo `@astrojs/sitemap` inclui as 7 novas URLs automaticamente (sem configuração manual).
3. Cada página tem exatamente 1 `<h1>`, JSON-LD `Service` + `FAQPage` + `BreadcrumbList` válidos (parseáveis como JSON), e o texto do FAQPage bate com o texto visível.
4. Troca de Tela e Troca de Bateria mostram preço real (faixa Econômica/Premium) consistente com `CONFIG.devices`; as outras 5 mostram "sob consulta" sem números inventados.
5. Nenhuma mudança visual/estrutural na home (`index.astro` e seus componentes existentes permanecem intocados, exceto a extração pontual de `TrustFacts.astro` descrita acima, que deve preservar o texto exato já presente em `Diferenciais.astro`/`Footer.astro`).

## Fora de escopo

- Páginas por modelo (`/iphone-XX/*`) — Etapa 3.
- Blog — Etapa 4.
- Alterar a navegação do header da home.
- Gerar imagens novas por serviço.
- GA4/GTM/Meta Pixel, migração de domínio (adiados desde a Etapa 1).
