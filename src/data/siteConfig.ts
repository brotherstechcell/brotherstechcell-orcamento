/**
 * Configuração Global da Brothers Techcell
 * Fonte central para URLs, Contatos (NAP), Redes e Regras de Negócio
 */

export const SITE_URL = import.meta.env.SITE_URL || 'https://brotherstechcell.vercel.app';

export const BUSINESS_INFO = {
  name: 'Brothers Techcell',
  legalName: 'BROTHERSTECHCELL MANUTENCOES LTDA',
  cnpj: '67.801.378/0001-65',
  cnpjRaw: '67801378000165',
  headline: 'Assistência Técnica de iPhone Delivery em Manaus | Nós Vamos Até Você',
  shortDescription: 'Assistência técnica especializada em iPhone com atendimento delivery em Manaus. Troca de tela, bateria, tampa traseira e reparos com garantia.',
  phone: '(92) 99395-1193',
  phoneRaw: '5592993951193',
  email: 'brotherstechcelloficial@gmail.com',
  instagram: 'brothers_techcell',
  instagramUrl: 'https://www.instagram.com/brothers_techcell/',
  city: 'Manaus',
  state: 'AM',
  country: 'BR',
  addressString: 'Manaus - AM (Atendimento Delivery em Domicílio)',
  geo: {
    latitude: -3.119027,
    longitude: -60.021731,
  },
  openingHours: {
    days: ['Segunda a Domingo'],
    hours: '08:00 às 20:00',
    schemaDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '08:00',
    closes: '20:00',
  },
  bookingUrl: 'https://brothersystem.vercel.app/agendar',
  defaultWhatsAppMessage: 'Olá! Gostaria de um orçamento para reparo do meu iPhone na Brothers Techcell.',
};

export function getWhatsAppLink(message?: string, service?: string, device?: string): string {
  let text = message || BUSINESS_INFO.defaultWhatsAppMessage;
  if (service && device) {
    text = `Olá! Gostaria de consultar o orçamento para ${service} do meu iPhone ${device} com atendimento delivery em Manaus.`;
  } else if (device) {
    text = `Olá! Gostaria de consultar um orçamento para o iPhone ${device} com atendimento delivery em Manaus.`;
  } else if (service) {
    text = `Olá! Gostaria de um orçamento para ${service} de iPhone com atendimento delivery em Manaus.`;
  }
  return `https://wa.me/${BUSINESS_INFO.phoneRaw}?text=${encodeURIComponent(text)}`;
}

export function getBookingLink(serviceLink?: string, device?: string, quality?: string): string {
  const params = new URLSearchParams();
  if (serviceLink) params.set('link', serviceLink);
  if (device) params.set('device', device);
  if (quality) params.set('quality', quality);
  const qs = params.toString();
  return `${BUSINESS_INFO.bookingUrl}${qs ? `?${qs}` : ''}`;
}
