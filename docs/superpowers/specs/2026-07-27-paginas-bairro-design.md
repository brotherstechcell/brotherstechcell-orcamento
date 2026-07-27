# Páginas por Bairro (`/atendimento/{bairro}`) — Design

## Contexto

Seção 7 do "Plano Mestre de SEO" enviado pelo usuário em 2026-07-27, que amplia o plano de SEO original já em execução (Etapas 1-3 concluídas: migração Astro, 7 páginas de serviço, 80 páginas de serviço×modelo). Esta etapa cria páginas por bairro para capturar buscas com intenção local ("assistência técnica iphone Adrianópolis").

## Escopo

18 páginas, uma por bairro, lista fornecida pelo usuário: Adrianópolis, Aleixo, Centro, Dom Pedro, Flores, Parque 10, Alvorada, Cidade Nova, Compensa, Japiim, São José, Ponta Negra, Tarumã, Vieiralves, Educandos, Petrópolis, Zumbi, Coroado.

## Decisão sobre dados reais (aprovada com o usuário)

O plano mestre pede "tempo médio de deslocamento" e "depoimentos" por bairro. **O usuário confirmou que não tem esses dados prontos ainda.** Seguindo a mesma disciplina das etapas anteriores (não inventar fato/número/depoimento):

- **Tempo de deslocamento:** nenhuma estimativa específica por bairro. Reaproveita a frase já verificada e usada em todo o site: "delivery gratuito para a maioria dos bairros de Manaus".
- **Depoimentos:** seção omitida nesta rodada — não fabricamos avaliação de cliente. Pode ser adicionada numa etapa futura quando houver depoimentos reais por bairro.

## Nota sobre diferenciação de conteúdo

Diferente das páginas por modelo (Etapa 3), que tinham preço real e distinto por página, aqui a diferenciação entre as 18 páginas é mais enxuta: nome do bairro (title/H1/meta/intro) + mapa real embutido + intenção de busca local genuína. É um padrão de SEO local geralmente aceito (diferente do "thin content" descartado para os 5 serviços sem preço na Etapa 2/3), mas o conteúdo por página tende a ser mais curto (~300-500 palavras) até haver dados/depoimentos reais por região para enriquecer.

## URLs

`/atendimento/{slug-do-bairro}` — ex.: `/atendimento/adrianopolis`, `/atendimento/sao-jose`, `/atendimento/taruma`.

Slug: mesma função de normalização já usada pra modelos (`slugifyModel`), adaptada para remover acentos também (bairros têm acento, modelos não tinham essa necessidade): `bairro.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-")`. Testado contra os 18 nomes reais — 18 slugs únicos, zero colisão (`"Adrianópolis"` → `"adrianopolis"`, `"São José"` → `"sao-jose"`, `"Tarumã"` → `"taruma"`).

## Arquitetura técnica

```
src/data/neighborhoods.ts   # array com os 18 bairros (nome, slug) + FAQ genérico reaproveitável
src/pages/atendimento/[bairro].astro   # rota dinâmica, getStaticPaths() gera as 18 páginas
src/components/
├── NeighborhoodHero.astro       # novo — H1 + intro + CTA
├── NeighborhoodMap.astro        # novo — iframe do Google Maps centrado no bairro
└── NeighborhoodServicesList.astro  # novo — links pras 7 páginas de serviço
```

Reaproveitados sem alteração: `TrustFacts`, `ServiceFaq` (recebe o FAQ genérico do bairro via prop, mesmo componente da Etapa 2), `CtaFinal`, `Header`, `Footer`, `FloatingWhatsapp`, `BottomNav`, `BaseLayout`.

### Conteúdo de cada página

1. **Hero**: H1 "Assistência Técnica iPhone em {Bairro}, Manaus", intro genérica mencionando delivery gratuito e atendimento na frente do cliente, CTA WhatsApp.
2. **Mapa**: iframe do Google Maps (embed padrão, sem chave de API) centrado em "{Bairro}, Manaus - AM" — dado real e verificável, não fabricado.
3. **Serviços disponíveis**: lista com link para as 7 páginas de serviço (`/servicos/*`), frase "Atendemos os seguintes serviços em {Bairro}: ...".
4. **TrustFacts**: reaproveitado sem alteração (garantia, horário, delivery gratuito).
5. **FAQ genérico** (5 perguntas, personalizadas só com o nome do bairro, respostas reaproveitando fatos já estabelecidos):
   - "Vocês atendem no bairro {Bairro}?"
   - "Cobram taxa de deslocamento para atender em {Bairro}?"
   - "Quais serviços vocês fazem em {Bairro}?"
   - "Quanto tempo demora o atendimento?"
   - "Como agendar o atendimento em {Bairro}?"
6. **CtaFinal**: reaproveitado sem alteração.

### Título/meta

- Title: `"Assistência iPhone em {Bairro} | Brothers Techcell"` — testado contra o nome mais longo ("Adrianópolis"): 54 caracteres, dentro do limite de 60.
- Meta description: `"Assistência técnica especializada em iPhone no bairro {Bairro}, Manaus. Delivery gratuito, garantia real, orçamento pelo WhatsApp."` — testado: 134 caracteres no pior caso, dentro do limite de 155.

### Schema.org

`LocalBusiness`/`Service` com `areaServed` apontando para o bairro específico (em vez de só "Manaus" genérico) + `FAQPage` (construído a partir do array de FAQ do bairro, mesma garantia de fidelidade texto-visível-igual-ao-schema das etapas anteriores) + `BreadcrumbList` (Home → iPhone em {Bairro}).

### Links internos

- Cada página de bairro linka para as 7 páginas de serviço.
- Fora de escopo nesta etapa: adicionar links das 18 páginas de bairro de volta pra home ou pras páginas de serviço (isso seria uma mudança nas páginas já aprovadas de Etapas 1-2, não solicitada aqui — igual à disciplina já usada nas etapas anteriores de não tocar em página já aprovada sem necessidade clara).

## Critério de sucesso

1. `npx astro build` gera 18 arquivos `dist/atendimento/{bairro}/index.html`.
2. Sitemap automático inclui as 18 novas URLs.
3. Cada página tem exatamente 1 `<h1>`, JSON-LD `Service`+`FAQPage`+`BreadcrumbList` válido, texto do FAQ batendo com o visível.
4. Mapa embutido mostra coordenadas/busca correspondente ao bairro correto (verificação manual do parâmetro de busca do iframe, já que não há como renderizar visualmente neste ambiente).
5. Nenhuma mudança em páginas já existentes (home, serviços, modelos).

## Fora de escopo

- Tempo de deslocamento específico por bairro, depoimentos reais — aguardando dados do usuário.
- Blog (Etapa 4), páginas institucionais por modelo, IA do site — discutidos no plano mestre, não parte desta etapa.
- Links das páginas de serviço/home apontando para as páginas de bairro (poderia ser uma pequena adição futura, mas não pedida agora).
