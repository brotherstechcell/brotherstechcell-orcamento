# Migração do site para Astro (Etapa 1 do plano de SEO)

## Contexto

O site da Brothers Techcell é hoje uma única página (`index.html`) construída com Vite + Tailwind v4 + JavaScript puro, sem framework e sem roteamento. O plano de SEO completo (ver conversa de origem) pede dezenas/centenas de páginas novas: 7 páginas de serviço, ~161 páginas de serviço×modelo de iPhone, e um blog com 200+ artigos.

Essa demanda foi dividida em subprojetos, na ordem:
1. **Migrar o site atual para Astro, sem mudar nada visualmente nem funcionalmente.** (este documento)
2. Criar as 7 páginas de serviço (`/servicos/*`).
3. Criar as ~161 páginas por modelo (`/iphone-XX/*`).
4. Montar o sistema de blog (content collection em Markdown).

Este documento cobre **apenas a Etapa 1**.

## Por que Astro

- Roda em cima do Vite (mesma base de build já usada hoje), então a curva de adoção é baixa.
- Aceita HTML/CSS/JS quase sem alteração — não é necessário reescrever a lógica existente em React/Vue/etc.
- Tem geração 100% estática por padrão (`output: 'static'`), que é o que já temos hoje e o ideal para SEO.
- Tem `@astrojs/sitemap`, que gera o sitemap automaticamente a partir das páginas existentes — importante quando o número de páginas crescer para 160+.
- Roteamento por arquivo (`src/pages/`) e rotas dinâmicas (`[...slug].astro`) atendem diretamente às Etapas 2 e 3.
- Content collections em Markdown/MDX são a forma natural de escalar o blog da Etapa 4.

Alternativa considerada: 11ty (Eleventy). Foi descartada porque não usa Vite (exigiria trocar toda a base de build) e usa motores de template (Nunjucks/Liquid) diferentes do que já existe no projeto.

## Escopo desta etapa

Migrar o `index.html` atual para Astro **preservando 100% do comportamento e visual atuais**. Nenhuma página nova é criada aqui — isso é a Etapa 2 em diante.

### Estrutura de pastas proposta

```
src/
├── layouts/
│   └── BaseLayout.astro       # <head> com SEO como props (title, description, canonical,
│                               # og:*, twitter:*, JSON-LD), estrutura HTML base
├── components/
│   ├── Header.astro
│   ├── Hero.astro
│   ├── ReelsShowcase.astro     # seção "Veja Como Nós Trabalhamos"
│   ├── Diferenciais.astro
│   ├── ComoFunciona.astro      # "3 Passos Simples"
│   ├── PricingSelector.astro   # tabela/seletor de preços por modelo
│   ├── ComparativoTelas.astro  # "Qual Tela Escolher"
│   ├── SobreExperiencia.astro
│   ├── DiagnosticForm.astro    # gerador de pré-diagnóstico
│   ├── Faq.astro
│   ├── CtaFinal.astro
│   ├── Footer.astro
│   └── FloatingWhatsapp.astro
├── pages/
│   └── index.astro             # monta os componentes acima na mesma ordem de hoje
├── scripts/
│   ├── main.js                 # migrado quase sem alteração
│   └── prices.js                # migrado quase sem alteração (CONFIG, catálogo Supabase)
└── styles/
    └── styles.css               # sem alteração de conteúdo

public/                          # sem alteração de estrutura
├── robots.txt
├── sitemap.xml                  # substituído pela geração automática do @astrojs/sitemap
├── og-image.png
└── assets/                      # vídeos e imagens (sem otimização automática do Astro,
                                  # pois são vídeos pesados — ficam como estáticos)
```

### Por que componentizar agora

Header, Footer, botão flutuante de WhatsApp e o bloco de SEO do `BaseLayout` serão reaproveitados em **todas** as páginas futuras de serviço e por modelo. Fazer essa extração durante a migração evita retrabalho na Etapa 2.

As demais seções (Hero, Diferenciais, PricingSelector, etc.) viram componentes principalmente por organização/manutenibilidade — a maioria só é usada na home por enquanto, mas `PricingSelector` provavelmente será reaproveitado nas páginas de modelo (Etapa 3).

### JavaScript

- `main.js` e `prices.js` são migrados para `src/scripts/` com o mínimo de alteração possível. Os `import` de assets (`icone-tela.jpg`, `icone-bateria.jpg`) e o fetch ao endpoint da Supabase (`get-public-pricing-catalog`) continuam funcionando, pois o Astro usa Vite internamente.
- Scripts são incluídos via tag `<script>` dentro dos componentes/`BaseLayout` relevantes (Astro faz bundling automático).
- Nenhuma lógica de negócio muda.

### CSS

- `styles.css` é copiado para `src/styles/` sem alteração de conteúdo, importado globalmente no `BaseLayout`.
- `@tailwindcss/vite` continua configurado da mesma forma, passado como plugin Vite dentro de `astro.config.mjs`.

### SEO

- `BaseLayout.astro` recebe como props: `title`, `description`, `canonicalPath` (usado para montar a URL canônica), e opcionalmente overrides de OG/Twitter. Os blocos de JSON-LD (`ElectronicsStore` + `FAQPage`) que hoje estão hardcoded no `index.html` migram para dentro do layout/componentes, com os textos do FAQ vindos do mesmo componente `Faq.astro` que renderiza o conteúdo visível (evita divergência entre o que é mostrado e o que está no schema).
- `sitemap.xml` manual é substituído pela integração oficial `@astrojs/sitemap`, configurada com a URL do site (a URL do Vercel, até a migração de domínio).
- `robots.txt` continua estático em `public/`, sem mudança de conteúdo (já aponta para `/sitemap.xml`).

### Deploy

- `output: 'static'` (padrão do Astro), sem adapter. O build gera `dist/`, e o Vercel continua servindo essa pasta exatamente como hoje — nenhuma mudança de configuração de deploy é necessária.

## Critério de sucesso / verificação

1. `astro dev` roda sem erros.
2. Comparação visual manual com o site atual: hero com vídeo controlado por scroll, seção de reels, seletor de preços (busca funcionando, fetch da Supabase retornando dados), comparativo de telas, formulário de pré-diagnóstico gerando link de WhatsApp corretamente, FAQ com accordion funcionando, botão flutuante de WhatsApp, footer com os dados adicionados na Etapa técnica anterior (horário, "Manaus - AM", texto de área de atendimento).
3. `astro build` roda sem erros e a pasta `dist/` final contém: `index.html`, `robots.txt`, `sitemap.xml` (agora gerado automaticamente), `og-image.png`, e os assets de vídeo/imagem — equivalente em conteúdo ao build atual do Vite.
4. JSON-LD validado como JSON (mesma checagem já feita na etapa anterior) e FAQ do schema batendo com o texto visível.
5. Nenhuma regressão de comportamento: todos os CTAs de WhatsApp, o diagnóstico e o seletor de preços continuam funcionando exatamente como antes.

## Fora de escopo (fica para as próximas etapas)

- Qualquer página nova (`/servicos/*`, `/iphone-XX/*`, blog).
- Mudança de conteúdo/copy da home.
- GA4/GTM/Meta Pixel (adiado a pedido do usuário).
- Migração de domínio (`brotherstechcell.com.br` ainda não está no ar).
