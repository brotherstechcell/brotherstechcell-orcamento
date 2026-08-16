export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceData {
  slug: string; // Ex: "troca-de-tela"
  canonicalSlug: string; // Ex: "troca-de-tela-iphone-manaus"
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string;
  deliveryType: "delivery_on_site" | "lab_with_delivery";
  deliveryLabel: string;
  estimatedTime: string;
  warranty: string;
  hasFixedPricing: boolean;
  catalogKey?: string;
  symptoms: string[];
  howItWorks: { step: number; title: string; desc: string }[];
  whatsappMessage: string;
  faq: ServiceFaqItem[];
}

export const services: ServiceData[] = [
  {
    slug: "troca-de-tela",
    canonicalSlug: "troca-de-tela-iphone-manaus",
    name: "Troca de Tela de iPhone em Manaus",
    shortName: "troca de tela",
    metaTitle: "Troca de Tela iPhone em Manaus | Brothers Techcell Delivery",
    metaDescription:
      "Troca de tela de iPhone em Manaus com atendimento delivery. Nós vamos até você e realizamos o reparo na sua frente em 30 minutos. Peças com garantia de até 6 meses.",
    h1: "Troca de Tela de iPhone em Manaus",
    subtitle:
      "Assistência técnica delivery especializada. Nós vamos até você e realizamos a substituição da tela na sua frente em qualquer bairro de Manaus.",
    intro:
      "A tela é o componente mais vulnerável a quedas e impactos. Na Brothers Techcell, a substituição é realizada na sua frente, na sua residência ou trabalho em Manaus, com opções de tela Econômica e Premium — ambas com garantia real e transparência total.",
    deliveryType: "delivery_on_site",
    deliveryLabel: "Reparo no seu endereço (em domicílio)",
    estimatedTime: "20 a 40 minutos",
    warranty: "Até 6 meses de garantia real",
    hasFixedPricing: true,
    catalogKey: "tela",
    symptoms: [
      "Vidro trincado, quebrado ou estilhaçado",
      "Touch screen (toque) não responde ou falha em algumas áreas",
      "Linhas verticais, horizontais ou tela piscando",
      "Manchas pretas (vazamento de cristal líquido OLED/LCD)",
      "Tela completamente preta ou sem imagem, mas o aparelho vibra/toca",
      "Tela com tonalidade verde ou branca após impacto",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Agendamento Rápido",
        desc: "Você nos informa seu modelo de iPhone pelo WhatsApp e escolhe o melhor local e horário em Manaus.",
      },
      {
        step: 2,
        title: "Técnico Vai Até Você",
        desc: "Nosso técnico especializado chega equipado com as ferramentas e peças no endereço combinado.",
      },
      {
        step: 3,
        title: "Troca na Sua Frente",
        desc: "O reparo é feito na sua presença em 30 minutos, preservando seus dados e testando todos os recursos (toque, cores e brilho).",
      },
      {
        step: 4,
        title: "Garantia e Pagamento",
        desc: "Você testa tudo antes de pagar e recebe seu certificado de garantia de até 6 meses.",
      },
    ],
    whatsappMessage: "Olá! Gostaria de consultar o preço para troca de tela do meu iPhone com atendimento delivery.",
    faq: [
      {
        question: "Quanto custa trocar a tela de um iPhone em Manaus?",
        answer:
          "O valor varia conforme o modelo do aparelho e a qualidade escolhida (Econômica ou Premium), a partir de R${price}. Você pode consultar o valor exato selecionando o seu modelo na nossa tabela.",
      },
      {
        question: "Quanto tempo demora a troca de tela?",
        answer:
          "O procedimento leva em média de 20 a 40 minutos e é realizado no próprio endereço do cliente, sem necessidade de deixar o aparelho.",
      },
      {
        question: "Qual a diferença entre a tela Econômica e a tela Premium?",
        answer:
          "A opção Econômica oferece excelente custo-benefício e garantia padrão de 3 meses. A opção Premium entrega fidelidade máxima de cores, brilho intenso, resposta tátil idêntica e garantia estendida de 6 meses.",
      },
      {
        question: "A troca de tela pode ser feita na minha casa ou trabalho?",
        answer:
          "Sim! Nosso principal diferencial é o atendimento delivery em Manaus. O técnico vai até você com bancada móvel e ferramentas profissionais.",
      },
      {
        question: "Perco minhas fotos, conversas ou dados na troca de tela?",
        answer:
          "Não. A troca de tela é um reparo exclusivamente de hardware externo. Nenhum dado do aparelho é apagado ou acessado.",
      },
      {
        question: "O recurso True Tone continua funcionando?",
        answer:
          "Sim, sempre que tecnicamente compatível realizamos a reprogramação da memória EEPROM para preservar a função True Tone no display.",
      },
    ],
  },
  {
    slug: "troca-de-bateria",
    canonicalSlug: "troca-de-bateria-iphone-manaus",
    name: "Troca de Bateria de iPhone em Manaus",
    shortName: "troca de bateria",
    metaTitle: "Troca de Bateria iPhone em Manaus | Brothers Techcell Delivery",
    metaDescription:
      "Troca de bateria de iPhone em Manaus com atendimento delivery. Baterias com selo Anatel, saúde 100%, troca feita na sua frente em 20 min com garantia de até 6 meses.",
    h1: "Troca de Bateria de iPhone em Manaus",
    subtitle:
      "Recupere a autonomia do seu iPhone com bateria nova homologada Anatel. Nós vamos até sua casa ou trabalho em Manaus.",
    intro:
      "Bateria com saúde degradada faz o iPhone descarregar rápido, esquentar ou desligar de repente com 20% ou 30% de carga. A Brothers Techcell substitui a bateria na sua frente, em qualquer bairro de Manaus, restabelecendo o desempenho máximo do aparelho.",
    deliveryType: "delivery_on_site",
    deliveryLabel: "Reparo no seu endereço (em domicílio)",
    estimatedTime: "20 a 30 minutos",
    warranty: "Até 6 meses de garantia real",
    hasFixedPricing: true,
    catalogKey: "bateria",
    symptoms: [
      "Saúde da bateria abaixo de 80% em Ajustes > Bateria",
      "Mensagem de 'Manutenção' ou 'Degradação' no sistema iOS",
      "iPhone descarrega muito rápido ao longo do dia",
      "Aparelho desliga sozinho mesmo marcando porcentagem restante",
      "iPhone esquenta excessivamente durante o uso ou recarga",
      "Lentidão no sistema causada pelo gerenciamento de energia",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Agendamento",
        desc: "Informe seu modelo no WhatsApp e agende o horário mais conveniente para você.",
      },
      {
        step: 2,
        title: "Deslocamento Delivery",
        desc: "O técnico se desloca até o seu endereço em Manaus com a bateria e insumos homologados.",
      },
      {
        step: 3,
        title: "Substituição e Vedação",
        desc: "Troca rápida na sua frente com aplicação de novo adesivo de fixação e vedação.",
      },
      {
        step: 4,
        title: "Validação da Carga",
        desc: "Testes de corrente e inicialização com garantia de até 6 meses.",
      },
    ],
    whatsappMessage: "Olá! Gostaria de consultar o preço da troca de bateria do meu iPhone com atendimento delivery.",
    faq: [
      {
        question: "Quando é a hora certa de trocar a bateria do iPhone?",
        answer:
          "A recomendação técnica é realizar a troca quando a Saúde da Bateria estiver abaixo de 80% (verificável em Ajustes > Bateria) ou quando o aparelho começar a desligar sozinho.",
      },
      {
        question: "Quanto custa a troca de bateria em Manaus?",
        answer:
          "Os valores iniciam em R${price}, variando conforme o modelo do iPhone e a categoria da bateria escolhida (Econômica ou Premium).",
      },
      {
        question: "As baterias são homologadas pela Anatel?",
        answer:
          "Sim, trabalhamos com células de alta qualidade homologadas pela Anatel, com proteção contra sobrecarga, aquecimento e curto-circuito.",
      },
      {
        question: "Quanto tempo dura o procedimento de troca?",
        answer:
          "O serviço é super rápido, levando cerca de 20 a 30 minutos na sua frente.",
      },
      {
        question: "A troca de bateria apaga arquivos ou WhatsApp?",
        answer:
          "Não. O procedimento não afeta em nada a memória flash do dispositivo; todos os dados, fotos e aplicativos permanecem intactos.",
      },
    ],
  },
  {
    slug: "troca-de-vidro",
    canonicalSlug: "troca-de-vidro-iphone-manaus",
    name: "Troca de Vidro de iPhone em Manaus",
    shortName: "troca de vidro",
    metaTitle: "Troca de Vidro de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de vidro de iPhone em Manaus mantendo o display original e o touch intactos. Economize até 50% em relação à tela completa. Atendimento delivery!",
    h1: "Troca de Vidro de iPhone em Manaus",
    subtitle:
      "Seu vidro quebrou mas a imagem e o toque continuam perfeitos? Mantenha sua tela original de fábrica e economize.",
    intro:
      "Quando o iPhone sofre uma queda e apenas o vidro trinca — mantendo a imagem 100% perfeita sem manchas e o touch funcionando perfeitamente —, é possível trocar apenas o vidro externo através de remanufatura em maquinário térmico e laminação a vácuo (OCA).",
    deliveryType: "lab_with_delivery",
    deliveryLabel: "Coleta e entrega delivery com reparo em laboratório",
    estimatedTime: "2 a 4 horas (coleta, laminação e devolução)",
    warranty: "3 meses de garantia",
    hasFixedPricing: false,
    symptoms: [
      "Apenas o vidro superior está quebrado ou rachado",
      "O display está gerando imagem 100% limpa (sem manchas pretas nem listras)",
      "O touch responde com total precisão em todas as áreas da tela",
      "Desejo de manter o display original de fábrica da Apple",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Avaliação do Display",
        desc: "Verificamos se o display e o touch estão 100% íntegros para permitir o procedimento de vidro.",
      },
      {
        step: 2,
        title: "Coleta Delivery",
        desc: "Coletamos o aparelho com ordem de serviço e recibo formal no seu endereço em Manaus.",
      },
      {
        step: 3,
        title: "Separação e Laminação OCA",
        desc: "Em nosso laboratório, o vidro quebrado é separado com fio térmico e o novo vidro é laminado a vácuo com cola OCA.",
      },
      {
        step: 4,
        title: "Devolução no Seu Endereço",
        desc: "Entregamos seu iPhone com a tela original preservada e aspecto de novo no mesmo dia.",
      },
    ],
    whatsappMessage: "Olá! O vidro do meu iPhone quebrou mas o display funciona. Quero um orçamento de troca de vidro.",
    faq: [
      {
        question: "Quando é possível trocar somente o vidro do iPhone?",
        answer:
          "Apenas quando o display estiver sem nenhuma mancha preta, sem listras e com o toque (touch) funcionando com 100% de perfeição em toda a extensão da tela.",
      },
      {
        question: "Qual a vantagem de trocar só o vidro?",
        answer:
          "A grande vantagem é manter a tela original de fábrica com todas as propriedades de cor, taxa de atualização e brilho originais, além de um custo geralmente menor que a tela completa original.",
      },
      {
        question: "A troca de vidro pode ser feita no domicílio?",
        answer:
          "A separação e laminação com cola OCA exigem maquinário térmico de laboratório e câmara de vácuo. Nós fazemos a coleta e a entrega no seu endereço com total comodidade e segurança.",
      },
      {
        question: "Quanto tempo demora o serviço de troca de vidro?",
        answer:
          "Geralmente é concluído em poucas horas no mesmo dia, com busca e devolução delivery combinada no agendamento.",
      },
    ],
  },
  {
    slug: "tampa-traseira",
    canonicalSlug: "tampa-traseira-iphone-manaus",
    name: "Troca de Tampa Traseira de iPhone em Manaus",
    shortName: "troca de tampa traseira",
    metaTitle: "Troca de Tampa Traseira iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de tampa traseira de iPhone em Manaus. Remoção especializada a laser com acabamento de fábrica e delivery em toda Manaus. Consulte o valor!",
    h1: "Troca de Tampa Traseira de iPhone em Manaus",
    subtitle:
      "Substituição do vidro traseiro quebrado com remoção a laser e acabamento impecável. Atendimento delivery em Manaus.",
    intro:
      "A tampa traseira de vidro dos iPhones modernos confere beleza e permite o carregamento por indução MagSafe, mas pode quebrar com impactos. Realizamos a substituição com tecnologia a laser precisa, preservando a carcaça e a integridade dos componentes internos.",
    deliveryType: "lab_with_delivery",
    deliveryLabel: "Atendimento delivery com serviço a laser especializado",
    estimatedTime: "1 a 3 horas",
    warranty: "3 meses de garantia",
    hasFixedPricing: true,
    catalogKey: "tampa_traseira",
    symptoms: [
      "Vidro traseiro trincado, rachado ou estilhaçado",
      "Pedaços de vidro soltando ou pontas que podem cortar a mão",
      "Perda da proteção contra poeira e umidade na parte traseira",
      "Aro da câmera ou vidro traseiro desalinhado após queda",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Agendamento",
        desc: "Você solicita o orçamento pelo WhatsApp informando a cor e o modelo do seu iPhone.",
      },
      {
        step: 2,
        title: "Atendimento Delivery",
        desc: "Retiramos seu aparelho ou realizamos o encaminhamento com total segurança e protocolo de serviço.",
      },
      {
        step: 3,
        title: "Remoção a Laser",
        desc: "A máquina a laser queima a cola original sob o vidro sem danificar bobinas MagSafe ou cabos internos.",
      },
      {
        step: 4,
        title: "Instalação da Nova Tampa",
        desc: "Aplicação da nova tampa de alta qualidade com colagem industrial e acabamento perfeito de fábrica.",
      },
    ],
    whatsappMessage: "Olá! Gostaria de um orçamento para troca da tampa traseira de vidro do meu iPhone.",
    faq: [
      {
        question: "É perigoso usar o iPhone com a tampa traseira quebrada?",
        answer:
          "Sim. O vidro estilhaçado pode soltar farpas que cortam a pele e, mais gravemente, abre passagem para umidade, poeira e suor atingirem a bateria e a placa mãe.",
      },
      {
        question: "Quanto custa a troca da tampa traseira em Manaus?",
        answer:
          "Os valores iniciam a partir de R${price}, dependendo do modelo e da cor do aparelho.",
      },
      {
        question: "O carregamento sem fio (MagSafe) continua funcionando?",
        answer:
          "Sim! Nosso processo a laser preserva perfeitamente a bobina de indução e os ímãs do MagSafe.",
      },
      {
        question: "O serviço afeta a tela ou a bateria?",
        answer:
          "Não. É um procedimento focado exclusivamente na estrutura traseira do aparelho.",
      },
    ],
  },
  {
    slug: "conector-de-carga",
    canonicalSlug: "conector-de-carga-iphone-manaus",
    name: "Conserto de Conector de Carga (Dock) de iPhone em Manaus",
    shortName: "conector de carga",
    metaTitle: "Conserto de Conector de Carga iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Conserto e troca do conector de carga (dock Lightning/USB-C) de iPhone em Manaus. Reparo delivery rápido na sua frente com garantia real.",
    h1: "Conserto de Conector de Carga de iPhone em Manaus",
    subtitle:
      "Seu iPhone não carrega, tem mau contato ou o cabo fica folgado? Nós vamos até você e resolvemos no local.",
    intro:
      "Problemas na porta de carregamento (Lightning ou USB-C) impedem o uso normal do aparelho. A Brothers Techcell realiza o diagnóstico completo — identificando desde uma simples obstrução de sujeira até a necessidade de substituição do flex dock de carga — direto no seu endereço em Manaus.",
    deliveryType: "delivery_on_site",
    deliveryLabel: "Reparo no seu endereço (em domicílio)",
    estimatedTime: "30 a 45 minutos",
    warranty: "Até 6 meses de garantia",
    hasFixedPricing: true,
    catalogKey: "conector_carga",
    symptoms: [
      "iPhone não carrega quando conectado à tomada",
      "Precisa ficar segurando ou entortando o cabo para carregar (mau contato)",
      "Cabo fica frouxo ou não encaixa até o fim",
      "Mensagem de 'Acessório não suportado' ou 'Líquido detectado'",
      "Microfone inferior não capta áudio nas ligações ou mensagens de voz",
      "iPhone não é reconhecido ao conectar no computador",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Diagnóstico Inicial",
        desc: "O técnico verifica se há sujeira compactada ou se os pinos condutores estão oxidados/rompidos.",
      },
      {
        step: 2,
        title: "Atendimento no Local",
        desc: "Realizamos a limpeza técnica profunda ou a substituição completa do dock na sua frente.",
      },
      {
        step: 3,
        title: "Teste de Amperagem",
        desc: "Medimos a corrente elétrica de entrada com testador USB profissional para certificar a carga rápida estável.",
      },
      {
        step: 4,
        title: "Conclusão com Garantia",
        desc: "Entrega imediata com garantia comprovada.",
      },
    ],
    whatsappMessage: "Olá! Meu iPhone está com problema para carregar (conector de carga). Gostaria de um orçamento.",
    faq: [
      {
        question: "Sempre é necessário trocar a peça quando o iPhone não carrega?",
        answer:
          "Nem sempre! Em muitos casos, fiapos de tecido e poeira acumulam dentro da entrada Lightning/USB-C. Nosso técnico avalia na sua frente e, se uma desobstrução resolver, você economiza.",
      },
      {
        question: "Quanto custa o reparo do conector de carga em Manaus?",
        answer:
          "Os valores iniciam em R${price}, dependendo do modelo do iPhone.",
      },
      {
        question: "O reparo do conector afeta o microfone?",
        answer:
          "Nos iPhones, o módulo flex do conector de carga também integra o microfone principal inferior. A troca do flex restabelece tanto o carregamento quanto a nitidez do microfone.",
      },
    ],
  },
  {
    slug: "face-id",
    canonicalSlug: "face-id-iphone-manaus",
    name: "Conserto de Face ID de iPhone em Manaus",
    shortName: "conserto de Face ID",
    metaTitle: "Conserto de Face ID iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Reparo especializado de Face ID de iPhone em Manaus. Recuperamos 'Face ID Indisponível' e problemas após quedas ou contato com umidade.",
    h1: "Conserto de Face ID de iPhone em Manaus",
    subtitle:
      "Seu Face ID parou de funcionar ou exibe 'Face ID Não Disponível'? Recuperamos o sistema biométrico original do seu iPhone.",
    intro:
      "O sistema TrueDepth da Apple é composto por projetor de pontos (Dot Projector), iluminador flood e câmera infravermelha criptografados com a placa mãe. A Brothers Techcell realiza a microssolda e reprogramação dos componentes originais para restaurar o Face ID com segurança.",
    deliveryType: "lab_with_delivery",
    deliveryLabel: "Reparo avançado em laboratório com coleta delivery",
    estimatedTime: "2 a 5 horas",
    warranty: "3 meses de garantia",
    hasFixedPricing: true,
    catalogKey: "face_id",
    symptoms: [
      "Mensagem 'Face ID não disponível' nas configurações",
      "Mensagem 'Mova o iPhone um pouco mais para cima / baixo' e nunca conclui",
      "Câmera de Modo Retrato frontal não desfoca o fundo",
      "Face ID parou após o aparelho cair ou ter contato com respingos de água",
      "Face ID parou após troca de tela mal executada em outra assistência",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Diagnóstico do Sensor",
        desc: "Identificamos qual componente do módulo TrueDepth perdeu comunicação ou sofreu curto no Dot Projector.",
      },
      {
        step: 2,
        title: "Microssolda e Transferência de Chip",
        desc: "Transferimos a criptografia do chip original para um novo flex de alta precisão sem perder o pareamento de fábrica.",
      },
      {
        step: 3,
        title: "Alinhamento Óptico",
        desc: "Calibramos o feixe de infravermelho para leitura facial instantânea em qualquer condição de luz.",
      },
      {
        step: 4,
        title: "Devolução Delivery",
        desc: "Devolvemos seu iPhone com o Face ID cadastrando e desbloqueando perfeitamente.",
      },
    ],
    whatsappMessage: "Olá! Meu Face ID parou de funcionar, gostaria de consultar o orçamento de reparo.",
    faq: [
      {
        question: "Dá para recuperar o Face ID mesmo após queda ou umidade?",
        answer:
          "Sim! Na grande maioria dos casos conseguimos recuperar o Face ID através de microssolda do Dot Projector ou reparo no sensor de aproximação, preservando a criptografia original da Apple.",
      },
      {
        question: "Quanto custa o conserto de Face ID em Manaus?",
        answer:
          "Os valores iniciam a partir de R${price}, variando conforme o modelo do iPhone e o dano diagnosticado.",
      },
      {
        question: "É seguro fazer o reparo do Face ID?",
        answer:
          "Totalmente seguro. Nossos técnicos utilizam programadoras profissionais específicas para a linha Apple que respeitam as diretrizes de segurança biométrica do iOS.",
      },
    ],
  },
  {
    slug: "camera",
    canonicalSlug: "camera-iphone-manaus",
    name: "Conserto e Troca de Câmera de iPhone em Manaus",
    shortName: "troca de câmera",
    metaTitle: "Troca de Câmera iPhone em Manaus | Brothers Techcell Delivery",
    metaDescription:
      "Troca de câmera frontal e traseira de iPhone em Manaus. Foco tremendo, lente trincada ou tela preta. Atendimento delivery com garantia real.",
    h1: "Troca de Câmera de iPhone em Manaus",
    subtitle:
      "Fotos borradas, foco tremendo ou lente riscada? Nós vamos até você em Manaus para restabelecer a qualidade das suas fotos.",
    intro:
      "As câmeras do iPhone possuem estabilização óptica sensível a impactos fortes e vibrações (como suportes de moto). Na Brothers Techcell realizamos a substituição de lentes trincadas e módulos de câmeras frontal e traseira no seu endereço em Manaus.",
    deliveryType: "delivery_on_site",
    deliveryLabel: "Reparo no seu endereço (em domicílio)",
    estimatedTime: "20 a 40 minutos",
    warranty: "Até 6 meses de garantia",
    hasFixedPricing: true,
    catalogKey: "camera",
    symptoms: [
      "Câmera traseira tremendo ou fazendo barulho ao focar",
      "Lente externa de vidro da câmera trincada ou arranhada",
      "Câmera não abre, fica preta ou trava o aplicativo ao abrir",
      "Fotos com manchas roxas, pontos pretos ou reflexos anormais",
      "Modo 0.5x (ultra-angular), 1x, 2x, 3x ou 5x sem foco",
      "Flash traseiro ou lanterna não disparam",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Inspeção Óptica",
        desc: "Avaliamos se o defeito é apenas no vidro da lente externa ou no módulo sensor interno da câmera.",
      },
      {
        step: 2,
        title: "Atendimento Delivery",
        desc: "Nosso técnico vai até seu endereço com os módulos compatíveis com o seu modelo.",
      },
      {
        step: 3,
        title: "Troca e Limpeza do Sensor",
        desc: "Substituição limpa em ambiente livre de partículas para evitar poeira interna nas lentes.",
      },
      {
        step: 4,
        title: "Testes de Foco e Estabilização",
        desc: "Testamos fotos em macro, zoom óptico, modo cinema e estabilização de vídeo antes da entrega.",
      },
    ],
    whatsappMessage: "Olá! A câmera do meu iPhone está com defeito, gostaria de consultar o valor do reparo.",
    faq: [
      {
        question: "Dá para trocar só o vidro da lente sem trocar a câmera inteira?",
        answer:
          "Sim! Se a imagem estiver nítida e o foco funcionar, trocamos apenas o vidro da lente externa, o que reduz consideravelmente o valor do serviço.",
      },
      {
        question: "Por que a câmera do iPhone fica tremendo e fazendo zumbido?",
        answer:
          "Isso geralmente acontece após quedas ou por vibração constante (muito comum em quem usa iPhone no suporte de guidão de moto), o que quebra o giroscópio do estabilizador óptico (OIS). A solução é trocar o módulo da câmera.",
      },
      {
        question: "Quanto custa a troca de câmera de iPhone em Manaus?",
        answer:
          "Os valores iniciam em R${price}, variando se o reparo é na câmera frontal, lente traseira ou módulo traseiro completo.",
      },
    ],
  },
  {
    slug: "reparo-de-placa",
    canonicalSlug: "reparo-de-placa-iphone-manaus",
    name: "Reparo em Placa de iPhone em Manaus",
    shortName: "reparo de placa",
    metaTitle: "Reparo de Placa de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Reparo avançado em placa de iPhone em Manaus. Aparelho não liga, em loop infinito (bootloop), sem sinal de operadora ou curto circuito. Laboratório próprio!",
    h1: "Reparo de Placa de iPhone em Manaus",
    subtitle:
      "Diagnóstico avançado com microssolda e ferramentas de laboratório para recuperar iPhones que não ligam ou têm defeitos complexos.",
    intro:
      "Quando o iPhone não liga, reinicia na maçã (loop infinito), esquenta excessivamente ou perde sinal de rede, o problema está na placa lógica (Motherboard). Dispomos de laboratório especializado em microssolda e análise esquemática para recuperar placas sem perda de dados sempre que possível.",
    deliveryType: "lab_with_delivery",
    deliveryLabel: "Diagnóstico e reparo em laboratório com coleta delivery",
    estimatedTime: "24 a 48 horas (conforme complexidade do circuito)",
    warranty: "3 meses de garantia",
    hasFixedPricing: true,
    catalogKey: "reparo_placa",
    symptoms: [
      "iPhone totalmente morto (não liga nem dá sinal ao carregar)",
      "Travado no logo da Apple (loop da maçã / bootloop)",
      "Sem sinal de rede celular (Buscando... ou Sem Serviço / Falha no Modem Baseband)",
      "Wi-Fi ou Bluetooth desativado/esmaecido",
      "Consumo excessivo de bateria ou aparelho esquenta muito desligado",
      "iPhone com curto-circuito na linha primária VDD_MAIN",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Coleta Delivery Segura",
        desc: "Retiramos o iPhone no seu endereço em Manaus com ordem de serviço e termo de entrega.",
      },
      {
        step: 2,
        title: "Análise com Câmera Térmica e Multímetro",
        desc: "Identificamos capacitores em curto, falhas em CIs de carga (Tristar/Hydra) ou no gerenciador de energia (PMIC).",
      },
      {
        step: 3,
        title: "Orçamento Transparente",
        desc: "Explicamos exatamente qual componente falhou e enviamos o orçamento final para sua aprovação.",
      },
      {
        step: 4,
        title: "Reparo e Devolução",
        desc: "Microssolda sob microscópio de alta resolução, testes de estresse e devolução no seu endereço.",
      },
    ],
    whatsappMessage: "Olá! Meu iPhone não liga / está com problema na placa. Gostaria de agendar uma avaliação técnica.",
    faq: [
      {
        question: "Um iPhone que não liga tem conserto?",
        answer:
          "Na grande maioria dos casos sim! Geralmente a falha ocorre por um capacitor em curto ou circuito integrado danificado (como o CI de carga ou gerenciador de energia). Após a substituição do componente, o aparelho volta a funcionar perfeitamente.",
      },
      {
        question: "É possível recuperar as fotos e dados de um iPhone que não liga?",
        answer:
          "Sim! Nosso principal foco no reparo de placa é reparar as linhas de alimentação para que a memória NAND seja lida e todos os seus dados permaneçam salvos.",
      },
      {
        question: "Quanto custa o reparo em placa de iPhone?",
        answer:
          "Os valores iniciam em R${price}, sendo confirmados com precisão após o diagnóstico em bancada.",
      },
    ],
  },
  {
    slug: "iphone-caiu-na-agua",
    canonicalSlug: "iphone-caiu-na-agua-manaus",
    name: "iPhone Caiu na Água em Manaus - Desoxidação e Recuperação",
    shortName: "iPhone caiu na água",
    metaTitle: "iPhone Caiu na Água em Manaus | Desoxidação Brothers Techcell",
    metaDescription:
      "iPhone caiu na água em Manaus? Desoxidação química ultrassônica e recuperação rápida de placa e bateria. Atendimento delivery urgente!",
    h1: "iPhone Caiu na Água em Manaus",
    subtitle:
      "Desoxidação química ultrassônica profissional para salvar seu iPhone molhado e evitar corrosão irreversível.",
    intro:
      "Mesmo com classificação de resistência contra água, o desgaste das vedações ou quedas anteriores podem permitir a entrada de líquidos no iPhone. A ação rápida é determinante para evitar que a eletrólise e o zinabre corroam os circuitos da placa mãe.",
    deliveryType: "lab_with_delivery",
    deliveryLabel: "Atendimento urgente com coleta delivery e banho ultrassônico",
    estimatedTime: "2 a 6 horas (desoxidação e secagem completa)",
    warranty: "Garantia conforme componentes recuperados",
    hasFixedPricing: false,
    symptoms: [
      "iPhone entrou em contato com água doce, piscina, praia ou chuva forte",
      "Aparelho começou a esquentar, piscar a tela ou desligou após molhar",
      "Câmeras com gotículas de vapor/embaçadas por dentro",
      "Alerta de 'Líquido detectado no conector Lightning / USB-C'",
      "Som dos alto-falantes abafado ou rouco",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Desligue Imediatamente",
        desc: "Não coloque para carregar e solicite a coleta urgente pelo WhatsApp.",
      },
      {
        step: 2,
        title: "Coleta Rápida Delivery",
        desc: "Buscamos o aparelho rapidamente no seu endereço em Manaus.",
      },
      {
        step: 3,
        title: "Desmontagem e Banho Ultrassônico",
        desc: "Desconectamos a bateria imediatamente e colocamos a placa na cuba ultrassônica com produto químico desoxidante.",
      },
      {
        step: 4,
        title: "Secagem e Testes de Circuito",
        desc: "Secagem em estufa térmica, análise de curtos e remontagem com nova vedação resistente a líquidos.",
      },
    ],
    whatsappMessage: "URGENTE: Meu iPhone caiu na água e preciso de uma desoxidação em Manaus.",
    faq: [
      {
        question: "O que devo fazer imediatamente se o iPhone cair na água?",
        answer:
          "1. Desligue o aparelho imediatamente se ainda estiver ligado. 2. NÃO conecte no carregador sob hipótese alguma. 3. NÃO coloque no arroz (o amido do arroz acelera a oxidação). 4. Chame a Brothers Techcell para coleta e desoxidação profissional o mais rápido possível.",
      },
      {
        question: "Por que colocar no arroz não funciona?",
        answer:
          "O arroz apenas absorve a umidade superficial externa, enquanto os minerais da água dentro do aparelho continuam oxidando os componentes eletrônicos. O pó de amido do arroz ainda pode entrar pelos orifícios e piorar o dano.",
      },
      {
        question: "Ainda dá para salvar um iPhone molhado?",
        answer:
          "Sim, as chances de recuperação ultrapassam 85% quando o aparelho é atendido rapidamente e não foi colocado no carregador com água dentro.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, "");
  return services.find(
    (s) => s.slug === clean || s.canonicalSlug === clean
  );
}

export function getAllServiceSlugs(): string[] {
  return services.map((s) => s.canonicalSlug);
}
