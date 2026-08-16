export interface ZoneCoverage {
  zoneName: string;
  badge: string;
  description: string;
  estimatedArrival: string;
  neighborhoods: string[];
  deliveryType: "delivery_gratis" | "delivery_sob_consulta";
}

export const MANAUS_COVERAGE_ZONES: ZoneCoverage[] = [
  {
    zoneName: "Zona Centro-Sul",
    badge: "Alta Frequência",
    description: "Atendimento prioritário com deslocamento rápido para condomínios, residências e empresas.",
    estimatedArrival: "30 a 60 minutos",
    deliveryType: "delivery_gratis",
    neighborhoods: [
      "Adrianópolis",
      "Vieiralves",
      "Nossa Senhora das Graças",
      "Parque 10 de Novembro",
      "Flores",
      "Aleixo",
      "São Geraldo",
      "Chapada",
    ],
  },
  {
    zoneName: "Zona Oeste & Ponta Negra",
    badge: "Condomínios e Residencial",
    description: "Atendimento completo em condomínios fechados, residenciais e comércios da orla e adjacências.",
    estimatedArrival: "40 a 70 minutos",
    deliveryType: "delivery_gratis",
    neighborhoods: [
      "Ponta Negra",
      "Tarumã",
      "Dom Pedro",
      "Planalto",
      "Alvorada",
      "Nova Esperança",
      "Santo Agostinho",
      "Compensa",
    ],
  },
  {
    zoneName: "Zona Sul & Centro",
    badge: "Comercial e Histórico",
    description: "Atendimento em escritórios comerciais, consultórios, lojas e residências centrais.",
    estimatedArrival: "35 a 65 minutos",
    deliveryType: "delivery_gratis",
    neighborhoods: [
      "Centro",
      "Praça 14 de Janeiro",
      "Cachoeirinha",
      "Educandos",
      "Petrópolis",
      "Japiim",
      "São Francisco",
      "Raiz",
    ],
  },
  {
    zoneName: "Zona Norte",
    badge: "Ampla Cobertura",
    description: "Atendimento nos principais conjuntos habitacionais e avenidas da Zona Norte de Manaus.",
    estimatedArrival: "45 a 80 minutos",
    deliveryType: "delivery_gratis",
    neighborhoods: [
      "Cidade Nova",
      "Nova Cidade",
      "Monte das Oliveiras",
      "Colônia Terra Nova",
      "Novo Aleixo",
      "Manôa",
      "Parque das Laranjeiras",
    ],
  },
  {
    zoneName: "Zona Leste",
    badge: "Atendimento Diário",
    description: "Atendimento nos grandes centros residenciais e comerciais da Zona Leste.",
    estimatedArrival: "45 a 85 minutos",
    deliveryType: "delivery_gratis",
    neighborhoods: [
      "São José Operário",
      "Coroado",
      "Armando Mendes",
      "Zumbi dos Palmares",
      "Tancredo Neves",
      "Jorge Teixeira",
    ],
  },
  {
    zoneName: "Distrito Industrial & Adjacências",
    badge: "Empresarial e Polo",
    description: "Atendimento a colaboradores e empresas do Polo Industrial de Manaus (PIM).",
    estimatedArrival: "40 a 75 minutos",
    deliveryType: "delivery_gratis",
    neighborhoods: [
      "Distrito Industrial I",
      "Distrito Industrial II",
      "Mauazinho",
      "Vila Buriti",
    ],
  },
];

export const COVERAGE_FAQS = [
  {
    question: "Como funciona a taxa de deslocamento para atendimento em Manaus?",
    answer: "Não cobramos taxa de deslocamento para a grande maioria dos bairros de Manaus quando o serviço é realizado.",
  },
  {
    question: "Vocês atendem em condomínios fechados ou empresas?",
    answer: "Sim! Nosso técnico se identifica na portaria com antecedência e realiza o atendimento no salão de festas, recepção, escritório ou na própria residência com total discrição e segurança.",
  },
  {
    question: "Quais reparos podem ser feitos direto no meu endereço?",
    answer: "Troca de tela, troca de bateria, troca de conector de carga, substituição de câmeras e pequenos reparos de periféricos são realizados no local em 20 a 40 minutos.",
  },
  {
    question: "Quando o iPhone precisa ir para o laboratório?",
    answer: "Reparos avançados de placa mãe, microssolda de Face ID, desoxidação profunda de água e laminação a laser da tampa traseira exigem maquinário térmico de bancada. Nesses casos fazemos a coleta e a devolução com protocolo de segurança.",
  },
  {
    question: "Como faço para agendar um técnico no meu bairro em Manaus?",
    answer: "Basta clicar no botão de WhatsApp, informar seu bairro, o modelo do seu iPhone e o defeito apresentado. Nossa equipe confirma a disponibilidade e agenda o horário imediatamente.",
  },
];
