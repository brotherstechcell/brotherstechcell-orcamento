export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceData {
  slug: string;
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  hasFixedPricing: boolean;
  symptoms: string[];
  whatsappMessage: string;
  faq: ServiceFaqItem[];
}

export const services: ServiceData[] = [
  {
    slug: "troca-de-tela",
    name: "Troca de Tela de iPhone",
    shortName: "troca de tela",
    metaTitle: "Troca de Tela de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de tela de iPhone com delivery gratuito em Manaus. Peças Econômica ou Premium, a partir de R$249,90, com até 90 dias de garantia.",
    intro:
      "A tela é a parte mais exposta a quedas e impactos do iPhone. Na Brothers Techcell, a troca é feita na sua frente, em Manaus, com peças Econômica, Intermediária ou Premium — sempre com garantia real.",
    hasFixedPricing: true,
    symptoms: [
      "Tela trincada ou estilhaçada",
      "Toque não responde em algumas áreas",
      "Manchas escuras ou vazamento de líquido sob o vidro",
      "Cores distorcidas ou linhas na tela",
      "Brilho muito baixo mesmo no máximo",
    ],
    whatsappMessage: "Olá! Quero saber o preço da troca de tela do meu iPhone.",
    faq: [
      {
        question: "Quanto custa a troca de tela?",
        answer:
          "O valor varia conforme o modelo do iPhone e a qualidade da peça (Econômica, Intermediária ou Premium), a partir de R$249,90. Consulte o preço exato do seu modelo na tabela da nossa página inicial ou pelo WhatsApp.",
      },
      {
        question: "Quanto tempo demora?",
        answer:
          "A troca de tela leva em média 20 a 40 minutos, feita na sua frente, onde você estiver em Manaus.",
      },
      {
        question: "Qual a garantia?",
        answer:
          "Tela Premium tem 90 dias de garantia real, Intermediária 30 dias e Básica 7 dias.",
      },
      {
        question: "Posso escolher a qualidade da tela?",
        answer:
          "Sim. Explicamos a diferença entre as opções e você escolhe a que preferir antes de fechar o serviço.",
      },
      {
        question: "Preciso pagar taxa de deslocamento?",
        answer: "Não cobramos taxa de deslocamento para a maioria dos bairros de Manaus.",
      },
      {
        question: "Perco meus dados na troca de tela?",
        answer:
          "Não. A troca de tela não afeta os dados armazenados no aparelho; o reparo é feito na sua frente com total transparência.",
      },
    ],
  },
  {
    slug: "troca-de-bateria",
    name: "Troca de Bateria de iPhone",
    shortName: "troca de bateria",
    metaTitle: "Troca de Bateria de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de bateria de iPhone com delivery gratuito em Manaus. Bateria homologada Anatel, a partir de R$249,90, com até 90 dias de garantia.",
    intro:
      "Bateria com saúde baixa faz o iPhone desligar sozinho, perder carga rápido ou desligar antes de chegar a 0%. Trocamos com peças homologadas Anatel, na sua frente, em Manaus.",
    hasFixedPricing: true,
    symptoms: [
      "Saúde da bateria abaixo de 80% (em Ajustes > Bateria)",
      "iPhone desliga sozinho mesmo com carga",
      "Bateria descarrega muito rápido",
      "Celular esquenta ao usar ou carregar",
      "Desempenho reduzido avisado pelo próprio iPhone",
    ],
    whatsappMessage: "Olá! Quero saber o preço da troca de bateria do meu iPhone.",
    faq: [
      {
        question: "Como sei se a bateria precisa ser trocada?",
        answer:
          "Vá em Ajustes > Bateria > Saúde da Bateria. Se a capacidade máxima estiver abaixo de 80%, ou o iPhone desliga sozinho mesmo com carga, é sinal de que a bateria está no fim da vida útil.",
      },
      {
        question: "Quanto custa a troca de bateria?",
        answer:
          "O valor varia por modelo, a partir de R$249,90. Consulte o preço do seu modelo na tabela da nossa página inicial ou pelo WhatsApp.",
      },
      {
        question: "As baterias têm selo Anatel?",
        answer:
          "Sim, trabalhamos exclusivamente com baterias homologadas pela Anatel, com chip controlador original.",
      },
      {
        question: "Quanto tempo demora a troca?",
        answer: "Em média 20 a 40 minutos, na sua frente, onde você estiver em Manaus.",
      },
      {
        question: "Qual a garantia da bateria?",
        answer: "Até 90 dias de garantia real, dependendo da qualidade escolhida.",
      },
      {
        question: "A troca de bateria apaga meus dados?",
        answer: "Não. É um procedimento de hardware que não mexe nos dados do aparelho.",
      },
    ],
  },
  {
    slug: "tampa-traseira",
    name: "Troca de Tampa Traseira de iPhone",
    shortName: "troca de tampa traseira",
    metaTitle: "Troca de Tampa Traseira de iPhone | Brothers Techcell",
    metaDescription:
      "Troca de tampa traseira de iPhone trincada ou quebrada, com atendimento delivery em Manaus. Orçamento gratuito pelo WhatsApp.",
    intro:
      "A tampa traseira de vidro do iPhone trinca ou quebra com quedas, mesmo quando a tela continua inteira. Fazemos a substituição por remoção a laser com acabamento de fábrica, direto na sua casa ou trabalho em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "Vidro traseiro trincado ou estilhaçado",
      "Lascas ou pontas que podem cortar",
      "Perda da vedação original contra poeira e umidade",
      "Peça solta ou com relevo irregular",
    ],
    whatsappMessage: "Olá! Quero orçar a troca da tampa traseira do meu iPhone.",
    faq: [
      {
        question: "É seguro usar o iPhone com a tampa traseira quebrada?",
        answer:
          "Não é recomendado: vidro trincado pode se soltar, cortar e compromete a proteção contra poeira e umidade do aparelho.",
      },
      {
        question: "Quanto custa a troca da tampa traseira?",
        answer:
          "O valor depende do modelo e disponibilidade da peça. Consulte pelo WhatsApp e receba o orçamento em poucos minutos.",
      },
      {
        question: "Como é feita a troca?",
        answer:
          "Usamos remoção a laser da tampa original danificada e instalação da nova peça com acabamento de fábrica, sem abrir mão da qualidade estética do aparelho.",
      },
      {
        question: "Isso afeta a tela ou a bateria do iPhone?",
        answer:
          "Não. É um reparo independente que não interfere na tela, bateria ou dados do aparelho.",
      },
      {
        question: "Tem garantia?",
        answer:
          "Sim, todo serviço realizado pela Brothers Techcell sai com garantia — os detalhes são combinados no orçamento, conforme a peça disponível para o seu modelo.",
      },
      {
        question: "Vocês cobram taxa de deslocamento?",
        answer: "Não cobramos taxa de deslocamento para a maioria dos bairros de Manaus.",
      },
    ],
  },
  {
    slug: "camera",
    name: "Troca de Câmera de iPhone",
    shortName: "troca de câmera",
    metaTitle: "Troca de Câmera de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Troca de câmera frontal ou traseira de iPhone com foco quebrado, lente trincada ou borrões. Delivery em Manaus, orçamento pelo WhatsApp.",
    intro:
      "Foco que não trava, lente trincada ou fotos borradas são os sinais mais comuns de problema na câmera do iPhone. Diagnosticamos e trocamos a câmera frontal ou traseira na sua frente, em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "Foco automático não funciona",
      "Lente da câmera trincada ou arranhada",
      "Fotos saindo borradas, escuras ou com manchas",
      "Câmera não abre ou trava o app",
      "Flash não funciona corretamente",
    ],
    whatsappMessage: "Olá! Minha câmera do iPhone está com problema, quero um orçamento.",
    faq: [
      {
        question: "Como sei se o problema é na câmera ou no app?",
        answer:
          "No nosso atendimento, o técnico faz um diagnóstico rápido testando a câmera na sua frente antes de qualquer troca, pra confirmar se o problema é de hardware.",
      },
      {
        question: "Quanto custa a troca de câmera?",
        answer:
          "O valor depende do modelo do iPhone e de qual câmera precisa ser trocada (frontal ou traseira). Consulte pelo WhatsApp.",
      },
      {
        question: "Dá pra trocar só uma das lentes em modelos com câmera tripla?",
        answer:
          "Depende da disponibilidade da peça pra cada modelo — o técnico avalia e informa as opções no diagnóstico.",
      },
      {
        question: "Quanto tempo demora?",
        answer: "A maioria das trocas de câmera é concluída no mesmo atendimento, direto na sua casa ou trabalho.",
      },
      {
        question: "Tem garantia?",
        answer: "Sim, o serviço sai com garantia combinada no orçamento conforme a peça utilizada.",
      },
    ],
  },
  {
    slug: "dock",
    name: "Troca de Dock (Conector de Carga) de iPhone",
    shortName: "troca do dock",
    metaTitle: "Troca de Dock (Conector) de iPhone | Brothers Techcell",
    metaDescription:
      "Troca do dock (conector de carga) de iPhone que não carrega ou tem mau contato. Delivery em Manaus, orçamento gratuito pelo WhatsApp.",
    intro:
      "iPhone que não carrega, só carrega em um ângulo específico ou tem mau contato geralmente indica problema no dock (conector de carga). Fazemos a limpeza ou troca do conector direto na sua frente, em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "iPhone não carrega ou carrega de forma intermitente",
      "Precisa mexer no cabo pra carregar",
      "Conector com poeira, fiapos ou sujeira visível",
      "Cabo esquenta muito durante a carga",
      "Mensagem de \"acessório não compatível\" ao carregar",
    ],
    whatsappMessage: "Olá! Meu iPhone não carrega direito, quero um orçamento pro conector de carga.",
    faq: [
      {
        question: "Sempre que o iPhone não carrega é o dock?",
        answer:
          "Nem sempre — às vezes é o cabo, a fonte ou sujeira no conector. Nosso técnico testa isso antes de indicar a troca da peça.",
      },
      {
        question: "Vocês limpam o conector antes de trocar?",
        answer:
          "Sim, o diagnóstico inclui verificar se uma limpeza resolve antes de partir para a substituição da peça.",
      },
      {
        question: "Quanto custa a troca do dock?",
        answer: "O valor varia por modelo. Consulte pelo WhatsApp e receba o orçamento rapidamente.",
      },
      {
        question: "Isso afeta o microfone ou alto-falante?",
        answer:
          "Em alguns modelos o conjunto do dock inclui o microfone inferior — o técnico informa no diagnóstico se esse é o seu caso.",
      },
      {
        question: "Tem garantia?",
        answer: "Sim, conforme combinado no orçamento.",
      },
    ],
  },
  {
    slug: "face-id",
    name: "Reparo de Face ID de iPhone",
    shortName: "reparo de Face ID",
    metaTitle: "Reparo de Face ID de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Reparo de Face ID de iPhone que parou de reconhecer o rosto. Diagnóstico e delivery em Manaus, orçamento gratuito pelo WhatsApp.",
    intro:
      "Face ID que parou de reconhecer o rosto ou pede senha o tempo todo costuma ser um problema no módulo de reconhecimento facial (TrueDepth). Fazemos o diagnóstico e o reparo na sua frente, em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "Mensagem \"Face ID não disponível\" ou \"Mova o iPhone mais para baixo\" que não some",
      "iPhone sempre pede senha, nunca reconhece o rosto",
      "Face ID lento ou falha com frequência mesmo em boa luz",
      "Problema começou após queda ou troca de tela em outra assistência",
    ],
    whatsappMessage: "Olá! Meu Face ID parou de funcionar, quero um orçamento.",
    faq: [
      {
        question: "Toda troca de tela feita em outro lugar pode quebrar o Face ID?",
        answer:
          "Sim, é um risco real quando o módulo TrueDepth (perto da câmera frontal) não é remanejado com cuidado na troca. Por isso levamos esse cuidado a sério nos nossos próprios reparos.",
      },
      {
        question: "Dá pra recuperar o Face ID original?",
        answer:
          "Na maioria dos casos sim, com remanejamento do circuito original do próprio aparelho. O técnico avalia a viabilidade no diagnóstico.",
      },
      {
        question: "Quanto custa o reparo de Face ID?",
        answer: "O valor depende do que causou o problema, identificado no diagnóstico. Consulte pelo WhatsApp.",
      },
      {
        question: "Sem Face ID, dá pra usar o iPhone normalmente?",
        answer:
          "Sim, mas você fica sem o desbloqueio facial e usa a senha — recomendamos o reparo pra recuperar a comodidade e segurança do aparelho.",
      },
      {
        question: "Tem garantia?",
        answer: "Sim, conforme combinado no orçamento após o diagnóstico.",
      },
    ],
  },
  {
    slug: "reparo-em-placa",
    name: "Reparo em Placa de iPhone",
    shortName: "reparo em placa",
    metaTitle: "Reparo em Placa de iPhone em Manaus | Brothers Techcell",
    metaDescription:
      "Reparo em placa de iPhone que não liga, reinicia sozinho ou molhou. Diagnóstico técnico com delivery em Manaus pelo WhatsApp.",
    intro:
      "iPhone que não liga, reinicia sozinho ou molhou e não responde mais geralmente exige reparo avançado de placa. Trabalhamos com ferramentas de laboratório para diagnosticar e resolver esses casos em Manaus.",
    hasFixedPricing: false,
    symptoms: [
      "iPhone não liga de jeito nenhum",
      "Tela preta permanente mesmo carregando",
      "Reinicia sozinho repetidamente (bootloop)",
      "Caiu na água e parou de funcionar",
      "Não é reconhecido pelo computador/iTunes",
    ],
    whatsappMessage: "Olá! Meu iPhone não liga (ou molhou), quero um diagnóstico.",
    faq: [
      {
        question: "Meu iPhone caiu na água, ainda dá pra salvar?",
        answer:
          "Depende do tempo de exposição e se houve tentativa de ligar o aparelho molhado. Quanto antes você trouxer pra avaliação, maior a chance de recuperação.",
      },
      {
        question: "Como funciona o diagnóstico de placa?",
        answer:
          "Usamos ferramentas de laboratório para identificar curtos, componentes queimados ou danificados antes de orçar o reparo.",
      },
      {
        question: "Quanto custa o reparo em placa?",
        answer:
          "O valor depende do problema identificado no diagnóstico — pode variar bastante caso a caso. Fazemos o orçamento após avaliar o aparelho.",
      },
      {
        question: "O diagnóstico tem custo?",
        answer: "Consulte as condições do diagnóstico pelo WhatsApp antes de agendar.",
      },
      {
        question: "Vocês recuperam dados de um iPhone que não liga?",
        answer:
          "Em muitos casos sim, dependendo do dano. O técnico avalia a viabilidade durante o diagnóstico.",
      },
      {
        question: "Tem garantia no reparo de placa?",
        answer:
          "Sim, conforme combinado no orçamento — reparos de placa têm garantia específica pro problema resolvido.",
      },
    ],
  },
];
