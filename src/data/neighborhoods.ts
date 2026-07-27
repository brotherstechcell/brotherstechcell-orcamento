export interface NeighborhoodFaqItem {
  question: string;
  answer: string;
}

export interface NeighborhoodData {
  name: string;
  slug: string;
  title: string;
  description: string;
  mapQuery: string;
  faq: NeighborhoodFaqItem[];
}

const NEIGHBORHOOD_NAMES: string[] = [
  "Adrianópolis",
  "Aleixo",
  "Centro",
  "Dom Pedro",
  "Flores",
  "Parque 10",
  "Alvorada",
  "Cidade Nova",
  "Compensa",
  "Japiim",
  "São José",
  "Ponta Negra",
  "Tarumã",
  "Vieiralves",
  "Educandos",
  "Petrópolis",
  "Zumbi",
  "Coroado",
];

export function slugifyNeighborhood(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function getAllNeighborhoods(): NeighborhoodData[] {
  return NEIGHBORHOOD_NAMES.map((name) => {
    const slug = slugifyNeighborhood(name);
    const title = `Assistência iPhone em ${name} | Brothers Techcell`;
    const description = `Assistência técnica especializada em iPhone no bairro ${name}, Manaus. Delivery gratuito, garantia real, orçamento pelo WhatsApp.`;
    const mapQuery = `${name}, Manaus - AM`;

    const faq: NeighborhoodFaqItem[] = [
      {
        question: `Vocês atendem no bairro ${name}?`,
        answer: `Sim! Atendemos ${name} e toda a região de Manaus com nosso serviço delivery — o técnico vai até você.`,
      },
      {
        question: `Cobram taxa de deslocamento para atender em ${name}?`,
        answer: `Não cobramos taxa de deslocamento para a maioria dos bairros de Manaus, incluindo ${name}.`,
      },
      {
        question: `Quais serviços vocês fazem em ${name}?`,
        answer: `Fazemos troca de tela, bateria, tampa traseira, câmera, dock, reparo de Face ID e reparo em placa — tudo na sua frente, em ${name} ou onde você estiver.`,
      },
      {
        question: "Quanto tempo demora o atendimento?",
        answer: "A maioria dos reparos de tela e bateria é concluída em 20 a 40 minutos, direto na sua casa ou trabalho.",
      },
      {
        question: `Como agendar o atendimento em ${name}?`,
        answer: "Basta chamar no WhatsApp, informar o modelo do seu iPhone e o serviço desejado — agendamos o horário e enviamos o técnico até você.",
      },
    ];

    return { name, slug, title, description, mapQuery, faq };
  });
}
