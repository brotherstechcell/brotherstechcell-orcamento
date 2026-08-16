export interface VideoDemoData {
  title: string;
  duration: string;
  equipment: string;
  description: string;
  youtubeId?: string;
  youtubeUrl?: string;
  steps: string[];
}

export interface ArticleData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  category: "Telas e Displays" | "Baterias e Carga" | "Laboratório e Sensores" | "Cuidados e Segurança" | "Guia de Preços";
  readTime: string;
  publishDate: string;
  author: string;
  featuredImageAlt: string;
  thumbnailIcon: string;
  thumbnailBadge: string;
  thumbnailGradient: string;
  ctaDeliveryPhrase: string;
  videoDemo?: VideoDemoData;
  relatedServiceSlug?: string;
  relatedModelSlug?: string;
  sections: {
    heading: string;
    content: string[];
    callout?: {
      type: "tip" | "warning" | "important";
      text: string;
    };
  }[];
  faq?: { question: string; answer: string }[];
}

export const articles: ArticleData[] = [
  // 1. Tela Verde no iPhone 13
  {
    slug: "iphone-13-com-tela-verde-causas-solucoes",
    title: "iPhone 13 com Tela Verde ou Branca: Causas, Sintomas e Como Resolver em Manaus",
    metaTitle: "iPhone 13 com Tela Verde: O Que Fazer e Como Resolver em Manaus",
    metaDescription:
      "Seu iPhone 13 ficou com a tela totalmente verde ou branca após atualizar ou sofrer impacto? Entenda a causa técnica do flex de display e como resolvemos em Manaus com delivery.",
    summary:
      "A falha da tela verde (Green/White Screen of Death) atinge com frequência a linha iPhone 13. Explicamos o que causa o curto na trilha de alimentação do display OLED e quais as soluções definitivas.",
    category: "Telas e Displays",
    readTime: "4 min",
    publishDate: "2026-05-10",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "iPhone 13 com display exibindo tela verde sendo analisado por técnico especializado em Manaus",
    thumbnailIcon: "📱",
    thumbnailBadge: "Display & Reparo",
    thumbnailGradient: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    ctaDeliveryPhrase: "Nossa assistência delivery avalia e conserta a tela do seu iPhone 13 no seu endereço em Manaus.",
    videoDemo: {
      title: "Diagnóstico e Troca de Tela OLED no iPhone 13",
      duration: "0:45 min",
      equipment: "Separadora Térmica Digital + Programadora True Tone",
      description: "Demonstração prática da substituição do módulo OLED e regravação do código EEPROM de calibração de cor True Tone na bancada móvel.",
      youtubeId: "8fL-E7bM6B0",
      youtubeUrl: "https://www.youtube.com/watch?v=8fL-E7bM6B0",
      steps: [
        "Desmontagem protegida com manta antiestática",
        "Leitura do serial original da tela antiga na programadora",
        "Instalação do novo painel OLED Super Retina XDR",
        "Teste completo de resposta tátil e True Tone ativo"
      ]
    },
    relatedServiceSlug: "troca-de-tela-iphone-manaus",
    relatedModelSlug: "iphone-13",
    sections: [
      {
        heading: "Por que a tela do iPhone 13 fica verde ou branca de repente?",
        content: [
          "O display do iPhone 13 e 13 Pro utiliza tecnologia OLED Super Retina XDR com alta taxa de atualização. No circuito flexível que conecta o painel de vidro à placa lógica, existe uma trilha de alimentação elétrica de alta tensão responsável por energizar os diodos emissores de luz.",
          "Com o tempo, microaquecimentos do processador ou pequenas vibrações diárias causam uma fadiga metálica nessa microtrilha, interrompendo o sinal de sincronismo. O resultado visual é a tela ficar completamente verde fluorescente ou branca leitosa, mesmo que o touch e as notificações continuem funcionando normalmente.",
        ],
        callout: {
          type: "tip",
          text: "Se você ainda ouve as notificações e sente o aparelho vibrar ao plugar o carregador, o processador e a placa mãe continuam 100% preservados.",
        },
      },
      {
        heading: "A atualização do iOS causa a tela verde?",
        content: [
          "Muitos usuários relatam que o problema começou logo após uma atualização do sistema iOS. Na realidade, a atualização exige alto processamento durante a instalação, o que eleva a temperatura interna do aparelho. Se a trilha do display já apresentava desgaste microscópico, o pico térmico apenas revela o defeito que já estava em formação.",
        ],
      },
      {
        heading: "Quais são as soluções para o iPhone 13 com tela verde?",
        content: [
          "Existem duas formas técnicas de resolver a tela verde no iPhone 13:",
          "1. Jumper no Flex do Display (Reparo de Trilha): Em alguns casos de telas originais, técnicos especializados em microssolda conseguem reconstruir a trilha interrompida com microfio de cobre isolado, recuperando o display sem precisar trocá-lo.",
          "2. Troca do Display OLED (Econômica ou Premium): Quando a reconstrução não é viável, a solução definitiva e 100% estável é a substituição da tela por uma nova unidade de alta fidelidade visual.",
        ],
        callout: {
          type: "important",
          text: "Na Brothers Techcell, nós realizamos a avaliação do seu iPhone 13 direto no seu endereço em Manaus. Nosso técnico avalia a melhor alternativa para você voltar a usar seu iPhone no mesmo dia com até 6 meses de garantia.",
        },
      },
    ],
    faq: [
      {
        question: "A tela verde no iPhone 13 apaga minhas fotos e conversas?",
        answer: "Não. A memória interna do aparelho fica totalmente intacta. É um defeito puramente de exibição de imagem no display.",
      },
      {
        question: "Quanto tempo demora o conserto da tela do iPhone 13?",
        answer: "A substituição do display leva em torno de 30 a 40 minutos e pode ser feita na sua frente através do nosso serviço delivery em Manaus.",
      },
    ],
  },

  // 2. iPhone 14 Pro Max Não Carrega
  {
    slug: "iphone-14-pro-max-nao-carrega-o-que-pode-ser",
    title: "iPhone 14 Pro Max Não Carrega: 5 Principais Causas e Testes Rápidos",
    metaTitle: "iPhone 14 Pro Max Não Carrega? Principais Causas e Soluções",
    metaDescription:
      "iPhone 14 Pro Max não reconhece o cabo Lightning ou não sobe carga? Veja os testes rápidos para fazer em casa e quando solicitar a assistência delivery em Manaus.",
    summary:
      "Seu iPhone 14 Pro Max parou de carregar, esquenta na tomada ou o cabo fica frouxo? Veja o passo a passo para identificar se o defeito é sujeira, conector, bateria ou circuito de carga.",
    category: "Baterias e Carga",
    readTime: "5 min",
    publishDate: "2026-06-02",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Diagnóstico de conector de carga de iPhone 14 Pro Max em Manaus",
    thumbnailIcon: "🔌",
    thumbnailBadge: "Conector & Carga",
    thumbnailGradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    ctaDeliveryPhrase: "Técnico vai até seu endereço em Manaus com amperímetro digital e conector novo.",
    videoDemo: {
      title: "Diagnóstico Elétrico e Troca do Dock de Carga",
      duration: "0:50 min",
      equipment: "Amperímetro Digital USB-C/Lightning + Microscópio Óptico",
      description: "Medição do consumo de corrente (amperagem) em tempo real e substituição do flex do conector de carga na presença do cliente.",
      youtubeId: "J8QZg9f7r7w",
      youtubeUrl: "https://www.youtube.com/watch?v=J8QZg9f7r7w",
      steps: [
        "Inspeção óptica dos pinos condutores de carga",
        "Teste de amperagem com consumo padrão de 2.1A a 9V",
        "Substituição do flex dock de carga com microfones integrados",
        "Teste final de carregamento rápido e sincronização de dados"
      ]
    },
    relatedServiceSlug: "conector-de-carga-iphone-manaus",
    relatedModelSlug: "iphone-14-pro-max",
    sections: [
      {
        heading: "1. Acúmulo de sujeira compactada na porta Lightning",
        content: [
          "O iPhone passa a maior parte do dia no bolso de calças, mochilas ou bolsas. Fiapos de tecido entram na porta de carregamento e, a cada vez que você insere o plugue, essa sujeira é comprimida contra o fundo do conector.",
          "Quando a camada de fiapos fica espessa, os pinos metálicos do cabo não alcançam os terminais elétricos internos. O sintoma clássico é o cabo não encaixar até o fim ou ficar 'bambeando'.",
        ],
        callout: {
          type: "warning",
          text: "NUNCA utilize agulhas metálicas ou clips de metal para limpar a entrada, pois isso pode fechar curto nos pinos e queimar o controlador de carga.",
        },
      },
      {
        heading: "2. Cabo ou adaptador de tomada incompatível ou danificado",
        content: [
          "Fontes paralelas sem homologação geram ruídos elétricos e oscilações de voltagem que fazem o iOS desativar a porta de entrada como medida de segurança. Teste com outro cabo original ou homologado de 20W antes de concluir que o problema é no aparelho.",
        ],
      },
      {
        heading: "3. Conector de Carga (Dock) com pinos oxidados ou queimados",
        content: [
          "Se você já conectou o cabo com o aparelho levemente úmido (por exemplo, após garoa ou suor de treino), pode ocorrer a queima do 4º ou 5º pino condutor (VBUS) por eletrólise. Nesses casos, o conector precisa ser substituído fisicamente.",
        ],
      },
      {
        heading: "4. Falha no Circuito Integrado de Carga (Hydra / Tristar)",
        content: [
          "Se o conector e o cabo estão perfeitos, mas o aparelho não sobe porcentagem de bateria ou só carrega desligado, o problema pode estar no chip gerenciador de carga na placa mãe. Esse reparo exige microssolda em laboratório.",
        ],
      },
    ],
    faq: [
      {
        question: "Como a Brothers Techcell resolve esse problema em Manaus?",
        answer: "Nosso técnico vai até seu endereço e realiza o teste com amperímetro digital na sua frente. Se for apenas limpeza, resolvemos na hora; se for troca do dock de carga, a substituição é feita em 30 minutos.",
      },
    ],
  },

  // 3. NOVO: Troca de Vidro vs Troca de Tela Completa
  {
    slug: "troca-de-vidro-vs-troca-de-tela-completa-iphone",
    title: "Troca de Vidro vs. Troca de Tela Completa no iPhone: Vale a Pena e Quando Fazer?",
    metaTitle: "Troca de Vidro vs Tela Completa iPhone: Como Economizar em Manaus",
    metaDescription:
      "Descubra quando é possível trocar apenas o vidro do iPhone, mantendo o display original e economizando até 50%. Entenda o processo de laminação a vácuo em Manaus.",
    summary:
      "Seu iPhone quebrou o vidro mas o toque e a imagem continuam perfeitos? Entenda como a troca apenas do vidro permite manter o display original de fábrica e economizar até 50%.",
    category: "Telas e Displays",
    readTime: "5 min",
    publishDate: "2026-08-10",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Processo de separação de vidro trincado de display original de iPhone em máquina especializada",
    thumbnailIcon: "🛡️",
    thumbnailBadge: "Economia & Originalidade",
    thumbnailGradient: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    ctaDeliveryPhrase: "Economize até 50% mantendo seu display original com nossa assistência especializada em Manaus.",
    videoDemo: {
      title: "Troca de Vidro por Laminação a Vácuo (Refurbishing)",
      duration: "1:00 min",
      equipment: "Separadora Térmica de Fio Molibdênio + Laminadora OCA a Vácuo + Autoclave",
      description: "Demonstração do corte com fio de molibdênio a 80°C, remoção do adesivo óptico antigo, alinhamento milimétrico do novo vidro e cura em autoclave pressurizada.",
      youtubeId: "W7oT5z1m_5M",
      youtubeUrl: "https://www.youtube.com/watch?v=W7oT5z1m_5M",
      steps: [
        "Remoção cirúrgica do vidro quebrado com fio de 0.03mm",
        "Limpeza química do polarizador sem arranhões",
        "Aplicação do adesivo óptico OCA e novo vidro blindado",
        "Pressurização em autoclave eliminando 100% das microbolhas"
      ]
    },
    relatedServiceSlug: "troca-de-vidro-iphone-manaus",
    sections: [
      {
        heading: "Como é composta a tela do seu iPhone?",
        content: [
          "A tela de um iPhone moderno não é uma peça única, mas sim um conjunto de camadas tecnológicas coladas sob alta pressão:",
          "1. Vidro Frontal Externo: Protege contra arranhões e impactos físicos diretos.",
          "2. Camada Touch (Digitalizador): Sensor capacitivo que detecta a posição dos seus dedos com precisão milimétrica.",
          "3. Painel de Imagem (OLED ou LCD Retina): Onde os pixels e cores são gerados.",
          "Quando o aparelho cai, em mais de 60% das vezes apenas o vidro frontal externo quebra, enquanto o painel OLED e o touch interno continuam 100% íntegros.",
        ],
      },
      {
        heading: "Quando é possível trocar APENAS o vidro?",
        content: [
          "A troca exclusiva de vidro é perfeitamente viável se o seu iPhone atender aos seguintes requisitos técnicos:",
          "• A imagem está completamente limpa: sem manchas pretas (sangramento de cristal líquido), sem listras coloridas verticais e sem tela piscando.",
          "• O touch funciona em 100% da tela: você consegue digitar todas as letras do teclado e puxar a central de controle sem travamentos.",
          "• O display atual é original de fábrica.",
        ],
        callout: {
          type: "tip",
          text: "Ao trocar apenas o vidro, você mantém as cores, o brilho, o contraste e a taxa de atualização do seu display original Apple de fábrica, gastando até metade do valor de uma tela completa nova.",
        },
      },
      {
        heading: "Como é feito o processo de laminação técnica?",
        content: [
          "Esse é um dos processos mais avançados da engenharia de manutenção de smartphones:",
          "1. Separação Térmica: A tela é aquecida a 80°C em mesa de sucção a vácuo e um fio de molibdênio de 0.03mm corta a cola entre o vidro quebrado e o OLED.",
          "2. Limpeza da Cola OCA: O adesivo antigo é removido com solvente químico especial.",
          "3. Laminação a Vácuo: Uma nova película óptica OCA e o vidro novo são alinhados em gabarito milimétrico e prensados a vácuo.",
          "4. Autoclave: O módulo passa por câmara pressurizada a 6 bar para garantir aderência cristalina e ausência total de bolhas.",
        ],
      },
      {
        heading: "Comparativo: Troca de Vidro vs. Tela Completa",
        content: [
          "• Troca de Vidro: Custo até 50% menor, preserva o painel original de fábrica, mantém 100% da calibração de cor e toque nativo.",
          "• Troca de Tela Completa: Necessária quando o painel tem manchas, listras ou touch falhando. Concluída em 30 minutos direto no seu endereço delivery.",
        ],
      },
    ],
    faq: [
      {
        question: "A troca de vidro deixa bolhas na tela?",
        answer: "Não. Com maquinário profissional de laminação a vácuo e autoclave industrial, o resultado final é idêntico ao acabamento de fábrica, com 100% de transparência.",
      },
      {
        question: "Como solicitar a avaliação do vidro do meu iPhone em Manaus?",
        answer: "Basta entrar em contato pelo WhatsApp da Brothers Techcell. Nosso técnico avalia seu display e orienta se a troca de vidro é a melhor escolha para o seu caso.",
      },
    ],
  },

  // 4. NOVO: Mitos e Verdades sobre a Saúde da Bateria
  {
    slug: "saude-bateria-iphone-80-porcento-mitos-verdades",
    title: "Saúde da Bateria do iPhone em 80%: Mitos, Verdades e a Hora Certa de Trocar",
    metaTitle: "Saúde da Bateria do iPhone em 80%: Quando Trocar em Manaus",
    metaDescription:
      "Seu iPhone chegou a 80% de saúde de bateria? Entenda os mitos, ciclos de carga e o momento exato de trocar a bateria com atendimento delivery em Manaus.",
    summary:
      "A saúde da bateria do seu iPhone caiu para 80% ou menos? Desmistificamos os principais mitos de carregamento e explicamos o momento exato da troca.",
    category: "Baterias e Carga",
    readTime: "5 min",
    publishDate: "2026-08-12",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Menu de Saúde da Bateria do iPhone exibindo 80% e teste de capacidade em bancada técnica",
    thumbnailIcon: "🔋",
    thumbnailBadge: "Saúde & Desempenho",
    thumbnailGradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    ctaDeliveryPhrase: "Troque a bateria do seu iPhone na sua frente em 20 a 30 minutos em qualquer bairro de Manaus.",
    videoDemo: {
      title: "Substituição e Calibração de Bateria de iPhone em Domicílio",
      duration: "0:40 min",
      equipment: "Ferramental Antiestático + Fita Adesiva Original de Tração + Testador de Carga",
      description: "Retirada segura da bateria degradada sem perfurar a carcaça e fixação da nova célula homologada com vedação completa.",
      youtubeId: "k0Dq0h3oPek",
      youtubeUrl: "https://www.youtube.com/watch?v=k0Dq0h3oPek",
      steps: [
        "Abertura térmica com preservação do anel de vedação",
        "Extração das fitas elásticas adesivas originais",
        "Instalação da nova bateria de polímero de lítio com alta densidade",
        "Teste de ciclo e verificação de corrente estável de carregamento"
      ]
    },
    relatedServiceSlug: "troca-de-bateria-iphone-manaus",
    sections: [
      {
        heading: "O que realmente significa a porcentagem da 'Saúde da Bateria'?",
        content: [
          "A métrica de Saúde da Bateria no iOS mede a capacidade de retenção de carga atual da célula química em comparação com quando ela saiu da fábrica novinha.",
          "As baterias de íon de lítio da Apple são projetadas para reter até 80% da sua capacidade original após 500 ciclos completos de recarga (para modelos até o iPhone 14) e 1.000 ciclos (para a linha iPhone 15 e 16).",
          "Abaixo de 80%, a resistência interna da bateria aumenta significativamente, o que impede a entrega estável de picos de energia exigidos pelo processador A-Bionic.",
        ],
      },
      {
        heading: "Mitos e Verdades mais comuns",
        content: [
          "• MITO: Deixar o iPhone carregando a noite toda vicia a bateria. O sistema de gerenciamento de energia (BMS) corta a corrente automaticamente quando atinge 100%.",
          "• VERDADE: O calor excessivo é o maior inimigo da bateria. Usar o celular em carregamento pesado sob o calor ambiente de Manaus acelera a degradação química.",
          "• MITO: Fechar todos os aplicativos em segundo plano economiza bateria. O iOS congela os apps inativos na memória RAM; reabri-los consome mais processador do que deixá-los em espera.",
          "• VERDADE: A partir de 79%, o iOS ativa o 'Gerenciamento de Desempenho', reduzindo o clock da CPU para evitar que o aparelho desligue sozinho durante o uso.",
        ],
        callout: {
          type: "warning",
          text: "Se o seu iPhone está esquentando muito durante o uso diário ou descarregando de 30% para 0% em poucos minutos, a célula já perdeu a estabilidade e precisa ser trocada.",
        },
      },
      {
        heading: "Quando é o momento exato de solicitar a troca?",
        content: [
          "Você não precisa esperar a bateria zerar para trocar. O momento ideal é quando:",
          "1. A capacidade máxima atingir 80% ou exibir a mensagem 'Manutenção'.",
          "2. Você precisar recarregar o aparelho duas ou três vezes durante o dia.",
          "3. O aparelho apresentar lentidão notável para abrir a câmera ou digitar.",
        ],
      },
      {
        heading: "Como a troca delivery funciona em Manaus",
        content: [
          "Na Brothers Techcell, você não precisa ficar sem celular. Nosso técnico vai até sua casa ou trabalho em Manaus, realiza a troca da bateria na sua frente em cerca de 25 minutos e você acompanha todo o processo com total segurança e garantia de até 6 meses.",
        ],
      },
    ],
    faq: [
      {
        question: "Quanto tempo dura uma bateria nova de iPhone?",
        answer: "Em média de 2 a 3 anos de uso intenso (cerca de 500 a 800 ciclos de recarga) mantendo excelente autonomia diária.",
      },
      {
        question: "A troca de bateria afeta o Face ID ou minhas fotos?",
        answer: "Não. A substituição de bateria é um reparo isolado na parte traseira da carcaça, mantendo todos os seus dados e sensores biométricos perfeitamente intactos.",
      },
    ],
  },

  // 5. NOVO: Face ID Parou Após Queda
  {
    slug: "face-id-parou-apos-queda-iphone-causas-reparo",
    title: "O Face ID Parou de Funcionar Após uma Queda no iPhone? Causas Técnicas e Reparo",
    metaTitle: "Face ID Não Funciona Após Queda? Entenda as Causas e Reparo",
    metaDescription:
      "Face ID desativado ou não reconhece o rosto após queda do iPhone? Entenda o projetor de pontos, transplante de flex e como consertamos em Manaus.",
    summary:
      "Apareceu o aviso 'O Face ID foi desativado' ou 'Mova o iPhone um pouco mais para cima' após um tombo? Explicamos as causas e como o laboratório restaura a leitura facial.",
    category: "Laboratório e Sensores",
    readTime: "5 min",
    publishDate: "2026-08-14",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Sensor TrueDepth e Dot Projector de Face ID sendo alinhado sob microscópio de precisão",
    thumbnailIcon: "👤",
    thumbnailBadge: "Microssolda & Face ID",
    thumbnailGradient: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
    ctaDeliveryPhrase: "Recupere o desbloqueio facial do seu iPhone com nosso serviço especializado de laboratório em Manaus.",
    videoDemo: {
      title: "Reparo de Dot Projector e Sensor TrueDepth do Face ID",
      duration: "1:15 min",
      equipment: "Microscópio Estereoscópico + Programadora de Sensores + Estação de Solda de Alta Precisão",
      description: "Demonstração do transplante do prisma e leitura do código criptográfico do Dot Projector original para novo circuito flex sem perder a biometria nativa.",
      youtubeId: "VwQf7-Qz94s",
      youtubeUrl: "https://www.youtube.com/watch?v=VwQf7-Qz94s",
      steps: [
        "Desconexão cuidadosa do sensor de proximidade e Flood Illuminator",
        "Inspeção microscópica de quebra do cristal óptico do projetor",
        "Desoldagem térmica do chip decodificador original",
        "Gravação em flex de reparo (Tag-on) e calibração do feixe infravermelho"
      ]
    },
    relatedServiceSlug: "face-id-iphone-manaus",
    sections: [
      {
        heading: "Como o Face ID funciona por dentro do iPhone?",
        content: [
          "O sistema biométrico TrueDepth da Apple é composto por múltiplos sensores de alta precisão posicionados no topo da tela:",
          "1. Flood Illuminator (Iluminador de Infravermelho): Ilumina seu rosto com luz invisível mesmo no escuro total.",
          "2. Dot Projector (Projetor de Pontos): Projeta mais de 30.000 pontos invisíveis de luz infravermelha para criar um mapa 3D único do seu rosto.",
          "3. Câmera Infravermelha: Lê os pontos refletidos e envia o mapa facial para o Secure Enclave no processador.",
        ],
      },
      {
        heading: "Por que o Face ID para de funcionar após uma queda?",
        content: [
          "O componente mais frágil do conjunto é o Projetor de Pontos (Dot Projector). Dentro dele existe um prisma de cristal microscópico extremamente sensível.",
          "Quando o iPhone sofre uma queda forte (mesmo sem quebrar o vidro da tela), o choque mecânico pode fraturar o cristal do projetor ou romper o microflex de comunicação. Quando o sistema detecta que os pontos infravermelhos não estão alinhados com perfeição, o iOS bloqueia o Face ID imediatamente por motivos de segurança.",
        ],
        callout: {
          type: "important",
          text: "Você NÃO PODE simplesmente comprar uma peça nova no mercado e instalar no lugar, pois cada Face ID é criptografado de fábrica com o processador do aparelho. Se trocar o conjunto inteiro, o Face ID fica permanentemente inativo.",
        },
      },
      {
        heading: "Como a Brothers Techcell recupera o seu Face ID em Manaus?",
        content: [
          "Para recuperar o Face ID, realizamos um procedimento de microcirurgia eletrônica em laboratório especializado:",
          "1. Lemos os dados criptográficos únicos da sua peça original com programadora especializada.",
          "2. Removemos o microchip decodificador original e transplantamos para um circuito flex de reparo reforçado.",
          "3. Realizamos o alinhamento óptico do prisma sob microscópio de 45x de aumento.",
          "Dessa forma, o sistema iOS volta a reconhecer o Face ID nativo sem qualquer mensagem de erro.",
        ],
      },
    ],
    faq: [
      {
        question: "O reparo de Face ID é seguro para o iPhone?",
        answer: "Sim. O procedimento recupera a peça original e restaura o funcionamento biométrico oficial sem comprometer nenhuma outra função da placa mãe.",
      },
      {
        question: "Vocês recolhem o iPhone para esse serviço em Manaus?",
        answer: "Sim! Nosso técnico vai até seu endereço para avaliar o aparelho e recolhe mediante ordem de serviço detalhada para o procedimento em nosso laboratório, com devolução rápida no mesmo endereço.",
      },
    ],
  },

  // 6. NOVO: Como Preparar o iPhone para Conserto
  {
    slug: "como-preparar-iphone-para-conserto-backup-privacidade",
    title: "Como Preparar o seu iPhone para o Conserto: Backup, Senhas e Privacidade Segura",
    metaTitle: "Como Preparar o iPhone para Assistência Técnica: Guia Completo",
    metaDescription:
      "Vai consertar seu iPhone? Veja como fazer backup rápido, o que fazer com senhas e por que o atendimento delivery em Manaus protege 100% sua privacidade.",
    summary:
      "Preocupado com fotos pessoais, senhas bancárias ou perda de dados antes de enviar seu iPhone para o conserto? Siga este checklist essencial de preparação.",
    category: "Cuidados e Segurança",
    readTime: "4 min",
    publishDate: "2026-08-16",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Cliente acompanhando o conserto de iPhone em domicílio com total privacidade dos dados",
    thumbnailIcon: "🔒",
    thumbnailBadge: "Segurança & Backup",
    thumbnailGradient: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
    ctaDeliveryPhrase: "Conserto no seu endereço com transparência total: você não precisa fornecer sua senha nem deixar seu aparelho.",
    videoDemo: {
      title: "Como Funciona o Atendimento Delivery com Segurança Total",
      duration: "0:45 min",
      equipment: "Mala Técnica Delivery + Bancada Móvel com Manta Antiestática",
      description: "Demonstração de como o atendimento delivery é realizado no conforto da residência ou escritório do cliente em Manaus.",
      youtubeId: "uM7i6qD_R60",
      youtubeUrl: "https://www.youtube.com/watch?v=uM7i6qD_R60",
      steps: [
        "Chegada pontual do técnico uniformizado no horário agendado",
        "Abertura da peça lacrada na frente do cliente",
        "Execução do conserto em 30 minutos sem solicitar senhas pessoais",
        "Teste conjunto de todas as funções e emissão do termo de garantia"
      ]
    },
    sections: [
      {
        heading: "1. Como fazer um backup completo e rápido",
        content: [
          "Antes de qualquer manutenção em smartphones, ter seus dados salvos em nuvem é a melhor prática:",
          "• Backup no iCloud: Conecte o iPhone ao Wi-Fi, abra Ajustes > [Seu Nome] > iCloud > Backup do iCloud e toque em 'Fazer Backup Agora'.",
          "• Backup no Computador: Se não tiver espaço no iCloud, conecte o iPhone via cabo ao computador (Finder no Mac ou aplicativo Dispositivos Apple / iTunes no Windows) e clique em 'Fazer backup de todos os dados deste iPhone no computador'.",
        ],
      },
      {
        heading: "2. Preciso desativar o 'Buscar iPhone'?",
        content: [
          "Para reparos delivery de tela, bateria, tampa traseira, conector e câmeras, NÃO é necessário desativar o Buscar iPhone nem formatar o aparelho.",
          "A desativação do Buscar iPhone só é solicitada em casos muito específicos de reparo em placa mãe ou troca de carcaça estrutural em laboratório.",
        ],
      },
      {
        heading: "3. Preciso informar minha senha de desbloqueio?",
        content: [
          "Em assistências tradicionais fechadas, muitas empresas exigem que você informe sua senha para realizar testes, deixando suas fotos, conversas de WhatsApp e aplicativos bancários vulneráveis.",
          "Na Brothers Techcell, a metodologia é totalmente transparente: o reparo é feito na sua frente no seu endereço em Manaus. Quando o conserto termina, você mesmo desbloqueia o aparelho e testa na frente do técnico.",
        ],
        callout: {
          type: "tip",
          text: "Nosso modelo delivery foi desenhado exatamente para garantir 100% de sigilo e paz de espírito para você. Seus dados nunca saem da sua visão.",
        },
      },
      {
        heading: "Checklist Rápido antes do Técnico Chegar",
        content: [
          "☑️ Certifique-se de que o aparelho tenha um pouco de carga para teste.",
          "☑️ Retire a capa de proteção para facilitar a abertura técnica.",
          "☑️ Disponibilize uma mesa ou superfície plana com boa iluminação.",
        ],
      },
    ],
    faq: [
      {
        question: "Meus dados podem ser apagados durante a troca de tela ou bateria?",
        answer: "Não. A substituição física de tela e bateria não afeta a memória flash (NAND) nem o sistema operacional do iPhone. Seus arquivos permanecem exatamente onde estavam.",
      },
      {
        question: "Como agendar um técnico delivery na minha casa em Manaus?",
        answer: "Basta clicar em qualquer botão do WhatsApp no nosso site, informar seu modelo de iPhone e endereço para agendarmos o melhor horário do seu dia.",
      },
    ],
  },

  // 7. iPhone Caiu na Água
  {
    slug: "iphone-caiu-na-agua-o-que-fazer-primeiros-socorros",
    title: "iPhone Caiu na Água: O Que Fazer e o Que NUNCA Fazer para Salvar seu Aparelho",
    metaTitle: "iPhone Caiu na Água: Guia de Primeiros Socorros | Brothers Techcell",
    metaDescription:
      "Seu iPhone molhou ou caiu na água? Não coloque no arroz! Siga o passo a passo urgente de desoxidação da Brothers Techcell em Manaus.",
    summary:
      "Aparelhos molhados sofrem corrosão acelerada se não forem desoxidados corretamente. Entenda por que o arroz é um mito perigoso e como agir rápido em Manaus.",
    category: "Laboratório e Sensores",
    readTime: "4 min",
    publishDate: "2026-06-15",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Placa de iPhone passando por banho químico ultrassônico em laboratório em Manaus",
    thumbnailIcon: "💧",
    thumbnailBadge: "Emergência & Desoxidação",
    thumbnailGradient: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
    ctaDeliveryPhrase: "Recolhemos seu iPhone molhado com urgência em Manaus para banho ultrassônico.",
    videoDemo: {
      title: "Desoxidação em Cuba Ultrassônica e Análise Termográfica",
      duration: "0:55 min",
      equipment: "Cuba Ultrassônica Digital + Câmera Térmica Infravermelha",
      description: "Processo de lavagem com álcool isopropílico 99,8% e identificação instantânea de componentes em curto por termografia.",
      youtubeId: "r-93n0VdY9A",
      youtubeUrl: "https://www.youtube.com/watch?v=r-93n0VdY9A",
      steps: [
        "Desconexão imediata da bateria para interromper a eletrólise",
        "Imersão em banho de cavitação ultrassônica de 40kHz",
        "Secagem em câmara térmica desumidificadora",
        "Mapeamento termográfico de microcurtos na placa"
      ]
    },
    relatedServiceSlug: "iphone-caiu-na-agua-manaus",
    sections: [
      {
        heading: "A verdade sobre a resistência à água do iPhone",
        content: [
          "Muitas pessoas acreditam que a classificação IP68 garante que o iPhone é à prova d'água em qualquer situação. Porém, a borracha e o adesivo de vedação sofrem desgaste natural com o tempo, calor de Manaus e impactos mecânicos anteriores.",
          "Uma simples queda pode romper a vedação microscópica e permitir que a água entre no compartimento da câmera, alto-falantes e conectores da placa.",
        ],
      },
      {
        heading: "Os 3 erros mais graves que você NÃO deve cometer",
        content: [
          "1. NUNCA coloque o iPhone no carregador: A eletricidade em contato com a água acelera a eletrólise, derretendo trilhas da placa em segundos.",
          "2. NÃO coloque o iPhone no arroz: O arroz solta um pó fino de amido que se mistura com a água dentro do aparelho, formando uma pasta ácida corrosiva que trava componentes móveis como câmeras.",
          "3. NÃO use secador de cabelo quente: O calor excessivo amolece os componentes plásticos e empurra a umidade ainda mais para o centro da placa mãe.",
        ],
        callout: {
          type: "warning",
          text: "O fator mais crítico para recuperar um iPhone molhado é o TEMPO. Quanto mais rápido a bateria for desconectada, maior a chance de 100% de sucesso.",
        },
      },
      {
        heading: "Como a desoxidação profissional funciona",
        content: [
          "Na Brothers Techcell, nós abrimos o aparelho imediatamente para desligar a fonte de energia da bateria. Em seguida, a placa mãe é mergulhada em cuba ultrassônica com solvente químico isopropílico de alta pureza, que desloca e dissolve todos os sais minerais e resíduos corrosivos.",
          "Após secagem em câmara térmica e análise de curto com câmera termográfica, seu iPhone é remontado com novas vedações.",
        ],
      },
    ],
    faq: [
      {
        question: "Dá para salvar um iPhone que caiu na água e não liga mais?",
        answer: "Sim, desde que a placa não tenha sofrido queima generalizada do processador. O banho ultrassônico e a troca de componentes em curto recuperam grande parte dos casos.",
      },
    ],
  },

  // 8. Quanto Custa Trocar Tela
  {
    slug: "quanto-custa-trocar-tela-iphone-manaus-guia",
    title: "Quanto Custa Trocar a Tela do iPhone em Manaus? Comparativo Completo de Preços",
    metaTitle: "Quanto Custa Trocar Tela de iPhone em Manaus? Tabela e Dicas",
    metaDescription:
      "Confira a faixa de preço real para troca de tela do iPhone 11, 12, 13, 14, 15 e 16 em Manaus. Opções Econômica vs Premium com atendimento delivery.",
    summary:
      "Tire suas dúvidas sobre valores reais de telas de iPhone em Manaus, o que compõe o preço e como evitar peças falsificadas de baixa resolução.",
    category: "Guia de Preços",
    readTime: "6 min",
    publishDate: "2026-07-01",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Tabela comparativa de telas de iPhone e atendimento delivery em Manaus",
    thumbnailIcon: "💰",
    thumbnailBadge: "Tabela de Preços",
    thumbnailGradient: "linear-gradient(135deg, #FEFCE8 0%, #FEF08A 100%)",
    ctaDeliveryPhrase: "Consulte a tabela completa ou receba a cotação exata no seu WhatsApp em minutos.",
    videoDemo: {
      title: "Comparativo de Telas Econômica vs Premium em Tempo Real",
      duration: "0:45 min",
      equipment: "Luxímetro Digital + Colorímetro de Precisão",
      description: "Teste de fidelidade de cores, ângulo de visão e intensidade de brilho (Nits) entre as opções de tela disponíveis.",
      youtubeId: "r8s3tV-G6cE",
      youtubeUrl: "https://www.youtube.com/watch?v=r8s3tV-G6cE",
      steps: [
        "Apresentação das duas opções para o cliente antes da instalação",
        "Comparação de espessura e acabamento das bordas",
        "Instalação na frente do cliente em 30 minutos",
        "Emissão de garantia de 3 a 6 meses"
      ]
    },
    relatedServiceSlug: "troca-de-tela-iphone-manaus",
    sections: [
      {
        heading: "O que influencia no valor da troca de tela?",
        content: [
          "O preço da tela de um iPhone varia conforme três fatores fundamentais:",
          "1. A geração do aparelho: Modelos mais recentes com painéis OLED LTPO de 120Hz (ProMotion) possuem custo de produção mais elevado que telas LCD de gerações anteriores.",
          "2. A tecnologia do painel: Telas Incell/TFT têm custo menor, enquanto telas OLED Flexíveis entregam a experiência idêntica à de fábrica.",
          "3. A garantia e o serviço delivery: Ter um técnico experiente realizando a troca no seu endereço com peças testadas e garantia formal de até 6 meses traz segurança e economia de tempo.",
        ],
      },
      {
        heading: "Faixa média de preços por geração em Manaus",
        content: [
          "• Linha iPhone 11: Telas a partir de R$ 299,90 (Econômica) a R$ 429,90 (Premium).",
          "• Linha iPhone 12: Telas OLED a partir de R$ 379,90 a R$ 699,90.",
          "• Linha iPhone 13: Telas a partir de R$ 469,90 a R$ 769,90.",
          "• Linha iPhone 14 e 15: Telas a partir de R$ 549,90 a R$ 949,90.",
          "Todos os valores já incluem o deslocamento delivery gratuito para a maioria dos bairros de Manaus e instalação completa com garantia.",
        ],
        callout: {
          type: "tip",
          text: "Você pode consultar o preço exato para o seu modelo a qualquer momento na nossa tabela de preços interativa da página inicial ou solicitando pelo WhatsApp.",
        },
      },
    ],
  },

  // 9. Tela OLED vs Incell
  {
    slug: "tela-oled-incell-original-diferencas-qual-escolher",
    title: "Tela OLED vs Incell no iPhone: Quais as Diferenças e Qual Escolher?",
    metaTitle: "Tela OLED vs Incell no iPhone: Qual a Melhor Escolha?",
    metaDescription:
      "Entenda as diferenças reais de consumo de bateria, brilho, cores e espessura entre telas Incell e OLED para iPhone antes de realizar a troca em Manaus.",
    summary:
      "Descubra as diferenças práticas entre telas Econômica (Incell) e Premium (OLED) para tomar a melhor decisão no reparo do seu iPhone.",
    category: "Telas e Displays",
    readTime: "5 min",
    publishDate: "2026-07-10",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Comparativo lado a lado de display OLED vs Incell em tela de iPhone",
    thumbnailIcon: "🔬",
    thumbnailBadge: "Comparativo Técnico",
    thumbnailGradient: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    ctaDeliveryPhrase: "Levamos as duas opções para você escolher a que melhor atende sua necessidade e orçamento.",
    videoDemo: {
      title: "Diferença Visual entre OLED e Incell em Ambiente Iluminado",
      duration: "0:40 min",
      equipment: "Microscópio Digital de Pixels + Luxímetro de Brilho",
      description: "Visualização dos subpixels e teste de contraste preto absoluto no modo escuro do iOS.",
      youtubeId: "t2BvX_Q14mE",
      youtubeUrl: "https://www.youtube.com/watch?v=t2BvX_Q14mE",
      steps: [
        "Demonstração do contraste com pixels individuais apagados",
        "Medição de espessura de borda com paquímetro digital",
        "Teste de resposta do sensor de toque a 120Hz",
        "Instalação no local em 30 minutos"
      ]
    },
    relatedServiceSlug: "troca-de-tela-iphone-manaus",
    sections: [
      {
        heading: "O que é a tecnologia OLED e por que a Apple a utiliza?",
        content: [
          "Nos displays OLED (Organic Light Emitting Diode), cada pixel emite sua própria luz individualmente. Quando a tela exibe a cor preta, esses pixels são completamente desligados. Isso gera contraste infinito, preto absoluto e economia de bateria ao usar o Modo Escuro do iOS.",
        ],
      },
      {
        heading: "Como funciona a tela Incell (Econômica)?",
        content: [
          "A tela Incell utiliza um painel LCD retroiluminado por LEDs traseiros (Backlight). Ela é uma excelente opção para quem busca um reparo com custo muito acessível sem abrir mão de boa sensibilidade ao toque.",
          "Porém, por ter iluminação traseira constante, as cores pretas ficam ligeiramente acinzentadas e a espessura da tela é minimamente superior ao OLED.",
        ],
      },
      {
        heading: "Comparativo de Benefícios",
        content: [
          "• Opção Econômica (Incell): Excelente custo-benefício, toque responsivo, 3 meses de garantia.",
          "• Opção Premium (OLED / Soft OLED): Cores vibrantes, brilho intenso sob a luz solar de Manaus, consumo ideal de bateria, espessura original e 6 meses de garantia real.",
        ],
      },
    ],
  },

  // 10. True Tone
  {
    slug: "true-tone-para-de-funcionar-troca-de-tela-iphone",
    title: "O True Tone Para de Funcionar Após Trocar a Tela do iPhone? Entenda a Verdade",
    metaTitle: "True Tone Para de Funcionar ao Trocar a Tela? | Brothers Techcell",
    metaDescription:
      "Descubra o que é o True Tone do iPhone, por que ele pode sumir após uma troca de tela e como a reprogramação técnica preserva o recurso em Manaus.",
    summary:
      "O True Tone ajusta a temperatura de cor da tela conforme a luz ambiente. Saiba como nosso processo técnico mantém essa função 100% ativa.",
    category: "Telas e Displays",
    readTime: "4 min",
    publishDate: "2026-07-22",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Aparelho programador de True Tone em display de iPhone",
    thumbnailIcon: "☀️",
    thumbnailBadge: "True Tone & Sensores",
    thumbnailGradient: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    ctaDeliveryPhrase: "Nossos técnicos utilizam programadora digital para manter seu True Tone 100% ativo na troca delivery.",
    videoDemo: {
      title: "Reprogramação Digital de True Tone na Bancada Móvel",
      duration: "0:35 min",
      equipment: "Programadora Digital de Display EEPROM QianLi / iCopy",
      description: "Transferência do código hexadecimal de calibração do display antigo para a nova tela na frente do cliente.",
      youtubeId: "mN6lq9k9h_0",
      youtubeUrl: "https://www.youtube.com/watch?v=mN6lq9k9h_0",
      steps: [
        "Leitura dos parâmetros de matriz de cor da tela original",
        "Gravação do firmware de calibração na nova tela",
        "Instalação no iPhone e verificação imediata na Central de Controle",
        "Teste com sensor de iluminação ambiente"
      ]
    },
    relatedServiceSlug: "troca-de-tela-iphone-manaus",
    sections: [
      {
        heading: "O que é a função True Tone no iPhone?",
        content: [
          "O True Tone é uma tecnologia desenvolvida pela Apple que utiliza sensores multicanal de luz ambiente para ajustar dinamicamente a tonalidade e a intensidade das cores da tela. Em ambientes com lâmpadas amareladas, a tela fica mais quente para descansar a visão; em luz solar direta, fica mais fria e nítida.",
        ],
      },
      {
        heading: "Por que o True Tone pode sumir após uma troca de tela?",
        content: [
          "Cada tela original de iPhone possui um código serial de calibração gravado em um microchip EEPROM. Quando uma nova tela é instalada sem a leitura e transferência desse código, o iOS desativa automaticamente o botão do True Tone na Central de Controle.",
        ],
      },
      {
        heading: "Como a Brothers Techcell preserva o seu True Tone",
        content: [
          "Nossos técnicos contam com programadoras digitais profissionais para ler o serial da tela antiga e regravar na nova tela no momento da substituição delivery. Dessa forma, você mantém o conforto visual e o funcionamento nativo do recurso.",
        ],
      },
    ],
  },

  // 11. Peça Desconhecida
  {
    slug: "mensagem-peca-desconhecida-iphone-o-que-significa",
    title: "Mensagem de 'Peça Desconhecida' no iPhone: O Que Significa e Afeta o Aparelho?",
    metaTitle: "Mensagem de Peça Desconhecida no iPhone: O Que É e O Que Afeta",
    metaDescription:
      "Entenda o que significa o aviso de Peça Desconhecida após trocar tela ou bateria de iPhone no iOS e por que ela não prejudica o funcionamento do aparelho.",
    summary:
      "Apareceu o aviso de Peça Desconhecida nos Ajustes do seu iPhone? Explicamos tudo sobre a política de pareamento da Apple com transparência.",
    category: "Cuidados e Segurança",
    readTime: "5 min",
    publishDate: "2026-08-01",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Aviso de Peça Desconhecida no menu Ajustes do iOS",
    thumbnailIcon: "ℹ️",
    thumbnailBadge: "Avisos & iOS",
    thumbnailGradient: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
    ctaDeliveryPhrase: "Tire todas as suas dúvidas técnicas com nossa equipe antes de qualquer reparo em Manaus.",
    videoDemo: {
      title: "Explicação Técnica da Criptografia de Peças no iOS",
      duration: "0:50 min",
      equipment: "Software de Diagnóstico Técnico iOS + Testador de Hardware",
      description: "Demonstração de que o aviso de peça não bloqueia nenhum recurso e o aparelho opera em 100% de capacidade.",
      youtubeId: "yQ3u_tG0vHk",
      youtubeUrl: "https://www.youtube.com/watch?v=yQ3u_tG0vHk",
      steps: [
        "Apresentação do menu Ajustes > Geral > Sobre",
        "Demonstração do funcionamento de touch, câmeras e biometria",
        "Esclarecimento sobre a política de criptografia da Apple",
        "Emissão do certificado de garantia de até 6 meses"
      ]
    },
    relatedServiceSlug: "troca-de-bateria-iphone-manaus",
    sections: [
      {
        heading: "Por que a Apple exibe o aviso de 'Peça Desconhecida'?",
        content: [
          "A partir dos modelos iPhone XS e XR, a Apple introduziu uma criptografia que vincula o número de série da bateria, tela e câmeras diretamente à placa mãe do aparelho no momento em que ele sai da fábrica.",
          "Mesmo se você retirar uma tela ou bateria original de outro iPhone idêntico e instalar no seu, o sistema iOS exibirá o aviso 'Peça Desconhecida' por não reconhecer o vínculo de fábrica com aquele processador específico.",
        ],
      },
      {
        heading: "O aviso afeta o funcionamento ou desempenho do meu iPhone?",
        content: [
          "NÃO. O aviso é meramente informativo no menu de Ajustes. Todos os recursos como toque, brilho, chamadas, Face ID, câmeras e desempenho do processador continuam operando normalmente a 100%.",
          "O aviso costuma aparecer com mais destaque nos primeiros dias na tela de bloqueio e depois fica restrito apenas a uma linha discreta dentro de Ajustes > Geral > Sobre.",
        ],
        callout: {
          type: "tip",
          text: "Na Brothers Techcell, nós sempre prezamos pela transparência técnica absoluta com o cliente antes e depois do reparo.",
        },
      },
    ],
  },

  // 12. Quando Trocar Bateria
  {
    slug: "quando-trocar-bateria-do-iphone-tempo-duracao",
    title: "Quando Trocar a Bateria do iPhone? 6 Sinais Claros e Duração do Reparo",
    metaTitle: "Quando Trocar a Bateria do iPhone? 6 Sinais e Dicas",
    metaDescription:
      "Seu iPhone não dura o dia todo? Veja os 6 sinais de que a bateria chegou ao fim da vida útil e quanto tempo leva para trocar em Manaus com delivery.",
    summary:
      "Aprenda a identificar a degradação da bateria do seu iPhone e conheça o processo de substituição delivery em 20 minutos no seu endereço em Manaus.",
    category: "Baterias e Carga",
    readTime: "4 min",
    publishDate: "2026-08-05",
    author: "Equipe Técnica Brothers Techcell",
    featuredImageAlt: "Técnico substituindo bateria de iPhone em domicílio em Manaus",
    thumbnailIcon: "⚡",
    thumbnailBadge: "Baterias & Autonomia",
    thumbnailGradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    ctaDeliveryPhrase: "Técnico vai até seu endereço em Manaus e substitui a bateria em 20 minutos na sua frente.",
    videoDemo: {
      title: "Troca Rápida de Bateria Delivery em 20 Minutos",
      duration: "0:30 min",
      equipment: "Kit de Chaves Pentalobe / Tri-Point + Extrator de Cola Térmico",
      description: "Procedimento ágil e seguro executado na mesa do cliente sem necessidade de deixar o celular por dias.",
      youtubeId: "a1X_7z88pGk",
      youtubeUrl: "https://www.youtube.com/watch?v=a1X_7z88pGk",
      steps: [
        "Abertura cuidadosa sem marcas na carcaça",
        "Remoção da bateria antiga com descarte ecológico",
        "Instalação da nova célula com adesivos originais",
        "Teste de ciclo de carga e saúde a 100%"
      ]
    },
    relatedServiceSlug: "troca-de-bateria-iphone-manaus",
    sections: [
      {
        heading: "1. Como verificar a integridade da bateria",
        content: [
          "No seu iPhone, abra Ajustes > Bateria > Saúde da Bateria e Carregamento. A capacidade máxima indica a porcentagem de energia que a bateria consegue reter em comparação a quando era nova.",
          "A própria Apple estabelece que, quando a capacidade máxima cai abaixo de 80%, a bateria entra em fase de degradação química, justificando a troca.",
        ],
      },
      {
        heading: "2. Principais sinais de bateria esgotada no dia a dia",
        content: [
          "• O iPhone desliga de repente com 15%, 20% ou 30% de carga ao abrir a câmera ou app pesado.",
          "• O celular esquenta na parte traseira mesmo em tarefas simples.",
          "• Lentidão e travamentos no sistema (throttling de desempenho imposto pelo iOS).",
          "• A bateria descarrega muito rápido mesmo em repouso durante a noite.",
        ],
      },
      {
        heading: "3. Quanto tempo demora a troca na Brothers Techcell?",
        content: [
          "O procedimento de troca de bateria leva de 20 a 30 minutos na sua frente. Nosso técnico realiza a desmontagem cuidadosa, aplica fita adesiva original de extração e fixa a nova bateria homologada Anatel com selo e garantia real de até 6 meses.",
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug: string): ArticleData | undefined {
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, "");
  return articles.find((a) => a.slug === clean);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
