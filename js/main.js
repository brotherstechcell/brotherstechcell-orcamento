/**
 * LÓGICA E INTERATIVIDADE - BROTHERS TECHCELL
 */

// Importa explicitamente as imagens para que o Vite processe e envie para o build final
import iconeTelaSrc from '../assets/icone-tela.jpg';
import iconeBateriaSrc from '../assets/icone-bateria.jpg';

document.addEventListener("DOMContentLoaded", async () => {
  // Sincroniza preços em tempo real com o banco de dados se houver pricingEndpoint definido
  const configObj = window.CONFIG || (typeof CONFIG !== "undefined" ? CONFIG : null);
  if (configObj && configObj.pricingEndpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos de timeout limite
      
      const response = await fetch(configObj.pricingEndpoint, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          // Converte o formato do Supabase catalog para o formato aninhado CONFIG.devices
          const convertedDevices = parseCatalogToDevices(data);
          if (Object.keys(convertedDevices).length > 0) {
            console.log("Brothersystem: Preços em tempo real carregados e convertidos com sucesso. Total de modelos:", Object.keys(convertedDevices).length);
            configObj.devices = { ...configObj.devices, ...convertedDevices };
          }
        }
      }
    } catch (err) {
      console.warn("Brothersystem: Erro ao obter preços em tempo real (usando fallback local):", err);
    }
  }

  // Função helper para converter formato plano (relacional) do catálogo Supabase em árvore aninhada (devices)
  function parseCatalogToDevices(catalog) {
    const devices = {};
    if (!catalog || !catalog.prices) return devices;

    const modelMap = {};
    if (catalog.models) {
      catalog.models.forEach(m => {
        modelMap[m.id] = m.name;
      });
    }

    const qualityMap = {};
    if (catalog.qualities) {
      catalog.qualities.forEach(q => {
        qualityMap[q.id] = q.name;
      });
    }

    catalog.prices.forEach(p => {
      if (!p.active) return;
      const modelName = modelMap[p.model_id];
      const serviceName = p.service_id;
      const qualityName = qualityMap[p.quality_id];

      if (!modelName || !serviceName || !qualityName) return;

      if (!devices[modelName]) {
        devices[modelName] = {};
      }
      if (!devices[modelName][serviceName]) {
        devices[modelName][serviceName] = {};
      }

      let formattedPrice = "";
      if (typeof p.cash_price === "number") {
        formattedPrice = p.cash_price.toFixed(2).replace(".", ",");
      } else {
        formattedPrice = String(p.cash_price || "Sob Consulta");
      }

      let formattedInstallment = "";
      if (p.installment_text) {
        formattedInstallment = p.installment_text;
      } else if (typeof p.cash_price === "number") {
        let instVal = p.installment_12x;
        if (!instVal) {
          instVal = (p.cash_price * 1.1416) / 12;
        }
        formattedInstallment = `12x de R$ ${instVal.toFixed(2).replace(".", ",")}`;
      }

      devices[modelName][serviceName][qualityName] = {
        price: formattedPrice,
        installment: formattedInstallment
      };
    });

    return devices;
  }

  initPricingSelector();
  updateWhatsAppLinks();
  setupScrollEffects();
  setupVideoCarousel();
  setupHeroScrollVideo();
  setupScrollReveal();
  setupFaqAccordion();
  setupReelsAutoplay();
  setupDiagnosticWizard();
});

/**
 * Ordem lógica dos aparelhos para exibição no dropdown (do mais recente ao mais antigo)
 */
const LOGICAL_MODEL_ORDER = [
  "17 Pro Max", "17 Pro", "17 Plus", "17",
  "16 Pro Max", "16 Pro", "16 Plus", "16",
  "15 Pro Max", "15 Pro", "15 Plus", "15",
  "14 Pro Max", "14 Pro", "14 Plus", "14",
  "13 Pro Max", "13 Pro", "13 Mini", "13",
  "12 Pro Max", "12 Pro", "12 Mini", "12",
  "11 Pro Max", "11 Pro", "11",
  "XS Max", "XS", "XR", "X",
  "SE 2/3",
  "8 Plus", "8",
  "7 Plus", "7",
  "6S Plus", "6S", "6"
];

/**
 * Inicializa o componente de Seletor Único de iPhone e abas de serviços
 */
function initPricingSelector() {
  const dropdown = document.getElementById("device-search-select");
  const tabTelasBaterias = document.getElementById("tab-btn-telas-baterias");
  const tabOutrosServicos = document.getElementById("tab-btn-outros-servicos");
  const panelTelasBaterias = document.getElementById("panel-telas-baterias");
  const panelOutrosServicos = document.getElementById("panel-outros-servicos");
  
  const diagDropdown = document.getElementById("diagnostic-device-select");
  if (!dropdown || !CONFIG.devices) return;
  
  // 1. Popular o Dropdown ordenado de forma lógica
  const sortedModels = Object.keys(CONFIG.devices).sort((a, b) => {
    const indexA = LOGICAL_MODEL_ORDER.indexOf(a);
    const indexB = LOGICAL_MODEL_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  
  // Popular Dropdown Principal
  dropdown.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Clique aqui e escolha o modelo...";
  defaultOption.disabled = true;
  dropdown.appendChild(defaultOption);
  
  sortedModels.forEach(model => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = `iPhone ${model}`;
    dropdown.appendChild(option);
  });
  
  // Popular Dropdown do Assistente de Diagnóstico
  if (diagDropdown) {
    diagDropdown.innerHTML = "";
    const defaultOptionDiag = document.createElement("option");
    defaultOptionDiag.value = "";
    defaultOptionDiag.textContent = "Selecione o modelo...";
    defaultOptionDiag.disabled = true;
    diagDropdown.appendChild(defaultOptionDiag);
    
    sortedModels.forEach(model => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = `iPhone ${model}`;
      diagDropdown.appendChild(option);
    });
    diagDropdown.value = sortedModels[0];
  }
  
  // Define o valor padrão para o primeiro modelo (ex: 17 Pro Max ou 11 dependendo da carga)
  dropdown.value = sortedModels[0];
  renderSelectorResults(sortedModels[0]);
  
  // 2. Escutar mudanças no Dropdown
  dropdown.addEventListener("change", (e) => {
    renderSelectorResults(e.target.value);
  });
  
  // 3. Gerenciar Abas ("Telas e Baterias" vs "Outros Serviços")
  if (tabTelasBaterias && tabOutrosServicos) {
    tabTelasBaterias.addEventListener("click", () => {
      tabTelasBaterias.classList.add("active");
      tabTelasBaterias.setAttribute("aria-selected", "true");
      tabOutrosServicos.classList.remove("active");
      tabOutrosServicos.setAttribute("aria-selected", "false");
      
      panelTelasBaterias.classList.add("active");
      panelOutrosServicos.classList.remove("active");
    });
    
    tabOutrosServicos.addEventListener("click", () => {
      tabOutrosServicos.classList.add("active");
      tabOutrosServicos.setAttribute("aria-selected", "true");
      tabTelasBaterias.classList.remove("active");
      tabTelasBaterias.setAttribute("aria-selected", "false");
      
      panelOutrosServicos.classList.add("active");
      panelTelasBaterias.classList.remove("active");
    });
  }
}

/**
 * Renderiza os cards de resultados para o modelo de iPhone selecionado
 */
function renderSelectorResults(modelName) {
  const resultsGrid = document.getElementById("selector-results-grid");
  if (!resultsGrid || !CONFIG.devices[modelName]) return;
  
  // Renderiza Skeleton Skeletons primeiro para feedback visual premium
  resultsGrid.innerHTML = `
    <div class="price-selector-card skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-circle skeleton-shimmer"></div>
        <div class="skeleton-text-group">
          <div class="skeleton-line title skeleton-shimmer"></div>
          <div class="skeleton-line subtitle skeleton-shimmer"></div>
        </div>
      </div>
      <div class="skeleton-body">
        <div class="skeleton-row skeleton-shimmer"></div>
        <div class="skeleton-row skeleton-shimmer"></div>
        <div class="skeleton-row skeleton-shimmer"></div>
      </div>
    </div>
    <div class="price-selector-card skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-circle skeleton-shimmer"></div>
        <div class="skeleton-text-group">
          <div class="skeleton-line title skeleton-shimmer"></div>
          <div class="skeleton-line subtitle skeleton-shimmer"></div>
        </div>
      </div>
      <div class="skeleton-body">
        <div class="skeleton-row skeleton-shimmer"></div>
        <div class="skeleton-row skeleton-shimmer"></div>
        <div class="skeleton-row skeleton-shimmer"></div>
      </div>
    </div>
  `;
  
  // Cancela timeout anterior se o usuário mudar de ideia rápido (anti-bounce)
  if (window.priceSelectorTimeout) {
    clearTimeout(window.priceSelectorTimeout);
  }
  
  window.priceSelectorTimeout = setTimeout(() => {
    const deviceData = CONFIG.devices[modelName];
    resultsGrid.innerHTML = "";
    
    // 1. Criar Card de TELA
    const screenCard = document.createElement("div");
    screenCard.className = "price-selector-card fancy-card";
    
    let screenItemsHtml = "";
    if (deviceData.tela && Object.keys(deviceData.tela).length > 0) {
      // Ordenar qualidades (Premium primeiro, depois Intermediária, depois Básica)
      const qualitiesOrder = ["Premium", "Intermediária", "Básica"];
      const sortedQualities = Object.keys(deviceData.tela).sort((a, b) => {
        return qualitiesOrder.indexOf(a) - qualitiesOrder.indexOf(b);
      });
      
      sortedQualities.forEach(quality => {
        const qData = deviceData.tela[quality];
        const isSobConsulta = qData.price.toLowerCase().includes("consulta");
        const priceText = isSobConsulta ? qData.price : `R$ ${qData.price}`;
        const installmentText = isSobConsulta ? "" : `ou ${qData.installment}`;
        
        const isPremium = quality.trim().toLowerCase() === 'premium';
        const rowClass = isPremium ? 'service-quality-row premium-featured' : 'service-quality-row';
        const btnClass = isPremium ? 'btn-quality-order btn-premium-cta' : 'btn-quality-order';
        const buttonText = isPremium ? 'AGENDAR PREMIUM' : 'AGENDAR';
        
        const redirectUrl = `https://brothersystem.vercel.app/agendar?link=tela&device=${encodeURIComponent(modelName)}&quality=${encodeURIComponent(quality)}`;
        
        screenItemsHtml += `
          <div class="${rowClass}">
            <div class="quality-label">
              <div class="quality-badge-wrapper" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="quality-badge ${quality.toLowerCase()}">${quality}</span>
                ${isPremium ? '<span class="premium-recommend-badge" style="font-size: 0.6rem; background: var(--primary); color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 800; letter-spacing: 0.03em;">★ RECOMENDADA</span>' : ''}
              </div>
              ${getQualityBenefitsHtml(quality)}
            </div>
            <div class="quality-pricing">
              <span class="quality-price-cash">${priceText}</span>
              <span class="quality-price-install">${installmentText}</span>
            </div>
            <div class="quality-action">
              <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" class="${btnClass}" aria-label="Agendar troca de tela ${quality} para iPhone ${modelName}">
                ${buttonText}
              </a>
            </div>
          </div>
        `;
      });
    } else {
      screenItemsHtml = `<p class="no-prices-msg">Serviço indisponível ou sob consulta para este modelo.</p>`;
    }
    
    screenCard.innerHTML = `
      <div class="card-inner">
        <div class="service-header-row">
          <span class="icon-service-type" style="padding: 0; background: none; border: none; overflow: hidden;">
            <img src="${iconeTelaSrc}" alt="Ícone de Tela" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; display: block;">
          </span>
          <div>
            <h4 class="service-title-text">Tela de iPhone ${modelName}</h4>
            <span class="service-subtitle-text">Substituição rápida e garantida</span>
          </div>
        </div>
        <div class="service-pricing-list">
          ${screenItemsHtml}
        </div>
      </div>
    `;
    
    // 2. Criar Card de BATERIA
    const batteryCard = document.createElement("div");
    batteryCard.className = "price-selector-card fancy-card";
    
    let batteryItemsHtml = "";
    if (deviceData.bateria && Object.keys(deviceData.bateria).length > 0) {
      const qualitiesOrder = ["Premium", "Intermediária", "Básica"];
      const sortedQualities = Object.keys(deviceData.bateria).sort((a, b) => {
        return qualitiesOrder.indexOf(a) - qualitiesOrder.indexOf(b);
      });
      
      sortedQualities.forEach(quality => {
        const qData = deviceData.bateria[quality];
        const isSobConsulta = qData.price.toLowerCase().includes("consulta");
        const priceText = isSobConsulta ? qData.price : `R$ ${qData.price}`;
        const installmentText = isSobConsulta ? "" : `ou ${qData.installment}`;
        
        const redirectUrl = `https://brothersystem.vercel.app/agendar?link=bateria&device=${encodeURIComponent(modelName)}&quality=${encodeURIComponent(quality)}`;
        
        batteryItemsHtml += `
          <div class="service-quality-row">
            <div class="quality-label">
              <span class="quality-badge ${quality.toLowerCase()}">${quality}</span>
              ${getQualityBenefitsHtml(quality)}
            </div>
            <div class="quality-pricing">
              <span class="quality-price-cash">${priceText}</span>
              <span class="quality-price-install">${installmentText}</span>
            </div>
            <div class="quality-action">
              <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" class="btn-quality-order" aria-label="Agendar troca de bateria ${quality} para iPhone ${modelName}">
                AGENDAR
              </a>
            </div>
          </div>
        `;
      });
    } else {
      batteryItemsHtml = `<p class="no-prices-msg">Serviço indisponível ou sob consulta para este modelo.</p>`;
    }
    
    batteryCard.innerHTML = `
      <div class="card-inner">
        <div class="service-header-row">
          <span class="icon-service-type battery" style="padding: 0; background: none; border: none; overflow: hidden;">
            <img src="${iconeBateriaSrc}" alt="Ícone de Bateria" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; display: block;">
          </span>
          <div>
            <h4 class="service-title-text">Bateria de iPhone ${modelName}</h4>
            <span class="service-subtitle-text">Saúde 100% com selo Anatel</span>
          </div>
        </div>
        <div class="service-pricing-list">
          ${batteryItemsHtml}
        </div>
      </div>
    `;
    
    resultsGrid.appendChild(screenCard);
    resultsGrid.appendChild(batteryCard);
  }, 250);
}


/**
 * Atualiza todos os links do site para direcionar para o WhatsApp central configurado
 */
function updateWhatsAppLinks() {
  const baseWhatsAppUrl = `https://wa.me/${CONFIG.contact.phoneRaw}`;
  
  // Atualiza todos os botões que possuem links com comportamento de pedido
  document.querySelectorAll("[data-message]").forEach(el => {
    const customMessage = encodeURIComponent(el.getAttribute("data-message"));
    el.setAttribute("href", `${baseWhatsAppUrl}?text=${customMessage}`);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
  
  // Atualiza botões genéricos de agendamento que possuem a classe "btn-whatsapp-global"
  document.querySelectorAll(".btn-whatsapp-global").forEach(el => {
    const defaultMsg = encodeURIComponent("Olá! Vi o site de vocês e gostaria de agendar uma assistência técnica delivery para meu iPhone.");
    el.setAttribute("href", `${baseWhatsAppUrl}?text=${defaultMsg}`);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
  
  // Atualiza qualquer texto que exiba o número de telefone
  document.querySelectorAll(".contact-phone-text").forEach(el => {
    el.textContent = CONFIG.contact.phone;
  });
  
  // Atualiza link de e-mail
  document.querySelectorAll(".contact-email-link").forEach(el => {
    el.setAttribute("href", `mailto:${CONFIG.contact.email}`);
    el.textContent = CONFIG.contact.email;
  });

  // Atualiza link do Instagram
  document.querySelectorAll(".contact-instagram-link").forEach(el => {
    el.setAttribute("href", CONFIG.contact.instagramUrl);
    el.textContent = `@${CONFIG.contact.instagram}`;
  });
}

/**
 * Adiciona efeitos interativos de scroll, menu ativo e header flutuante
 */
function setupScrollEffects() {
  const header = document.querySelector(".header-main");
  const floatingBtn = document.querySelector(".floating-whatsapp-container");
  
  window.addEventListener("scroll", () => {
    // Efeito translúcido no Header ao rolar a página
    if (window.scrollY > 20) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
    
    // Exibe o botão flutuante de WhatsApp após rolar 300px
    if (window.scrollY > 300) {
      floatingBtn?.classList.add("visible");
    } else {
      floatingBtn?.classList.remove("visible");
    }
    
    // Atualiza o link ativo no menu de navegação de acordo com a seção visível
    const sections = document.querySelectorAll("section[id]");
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll(".nav-link, .bottom-nav-item").forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  });
}

/**
 * Cria a funcionalidade interativa para o Grid de Vídeos da Transparência
 */
function setupVideoCarousel() {
  // Seleciona tanto o card principal quanto os mini story cards
  const videoCards = document.querySelectorAll(".featured-video-card, .story-mini-card");
  
  videoCards.forEach(card => {
    card.addEventListener("click", () => {
      const ytUrl = card.getAttribute("data-youtube-url");
      if (!ytUrl) return;
      
      // Cria e abre um modal dinâmico elegante para reprodução do vídeo
      const modal = document.createElement("div");
      modal.className = "video-modal-overlay";
      modal.innerHTML = `
        <div class="video-modal-container">
          <button class="btn-close-modal" aria-label="Fechar Vídeo">&times;</button>
          <div class="video-iframe-wrapper">
            <iframe src="${ytUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      document.body.style.overflow = "hidden"; // Desabilita o scroll da página de fundo
      
      // Lógica de fechamento
      const closeModal = () => {
        modal.classList.add("fade-out");
        setTimeout(() => {
          modal.remove();
          document.body.style.overflow = "";
        }, 300);
      };
      
      modal.querySelector(".btn-close-modal").addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    });
  });
}

/**
 * Retorna o HTML estruturado de brindes e garantia baseado na qualidade do serviço
 */
function getQualityBenefitsHtml(quality) {
  const qClean = quality.trim().toLowerCase();
  if (qClean === 'premium') {
    return `
      <div class="quality-benefits-wrapper">
        <span class="benefit-item warranty">
          <svg viewBox="0 0 24 24" class="benefit-icon">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          90 Dias de Garantia
        </span>
        <span class="benefit-item gift">
          <svg viewBox="0 0 24 24" class="benefit-icon">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z"/>
          </svg>
          Película + Capinha Grátis
        </span>
      </div>
    `;
  } else if (qClean === 'intermediária' || qClean === 'intermediaria') {
    return `
      <div class="quality-benefits-wrapper">
        <span class="benefit-item warranty">
          <svg viewBox="0 0 24 24" class="benefit-icon">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          30 Dias de Garantia
        </span>
        <span class="benefit-item gift">
          <svg viewBox="0 0 24 24" class="benefit-icon">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z"/>
          </svg>
          Película Grátis
        </span>
      </div>
    `;
  } else {
    return `
      <div class="quality-benefits-wrapper">
        <span class="benefit-item warranty basic">
          <svg viewBox="0 0 24 24" class="benefit-icon">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          7 Dias de Garantia
        </span>
        <span class="benefit-item gift muted">Sem brindes</span>
      </div>
    `;
  }
}

/**
 * Configura e sincroniza o vídeo de fundo do Hero com o scroll da página de forma suave (LERP)
 */
function setupHeroScrollVideo() {
  const video = document.getElementById("hero-scroll-video");
  if (!video) return;

  let targetTime = 0;
  let currentTime = 0;
  const ease = 0.08; // Fator de interpolação linear (quanto menor, mais suave)
  let animFrameId = null; // ID da animação ativa (null se estiver dormindo/ocioso)

  let isSeeking = false;
  let pendingTime = null;

  // Garante que o vídeo está pausado para controle manual
  video.pause();
  
  // Força carregamento do vídeo
  video.load();

  // Escuta a conclusão do seek do navegador antes de enviar outra requisição
  video.addEventListener("seeked", () => {
    isSeeking = false;
    if (pendingTime !== null) {
      const nextTime = pendingTime;
      pendingTime = null;
      performSeek(nextTime);
    }
  });

  function performSeek(time) {
    if (isSeeking) {
      pendingTime = time;
      return;
    }
    if (video.duration) {
      isSeeking = true;
      video.currentTime = Math.min(Math.max(time, 0), video.duration - 0.02);
    }
  }

  function updateVideoTarget() {
    const heroSection = document.getElementById("inicio");
    if (!heroSection) return;

    const rect = heroSection.getBoundingClientRect();
    // O trilho rolável total é a altura da seção Hero menos a altura da viewport
    const totalScrollable = heroSection.offsetHeight - window.innerHeight;
    
    if (totalScrollable > 0) {
      // rect.top vai de 0 (seção no topo) até -totalScrollable (seção terminou)
      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);
      
      // Controla a revelação dos textos e indicadores baseado no progresso da desmontagem
      if (window.innerWidth < 1024) {
        if (progress >= 0.75) {
          heroSection.classList.add("intro-complete");
        } else if (progress < 0.10) {
          heroSection.classList.remove("intro-complete");
        }
      } else {
        heroSection.classList.add("intro-complete");
      }
      
      if (video.duration) {
        targetTime = progress * video.duration;
        
        // Se o render loop estiver dormindo (inativo), acorda ele instantaneamente
        if (!animFrameId) {
          animFrameId = requestAnimationFrame(renderLoop);
        }
      }
    }
  }

  // Atualiza o progresso-alvo no scroll e resize (passive para desempenho de scroll)
  window.addEventListener("scroll", updateVideoTarget, { passive: true });
  window.addEventListener("resize", updateVideoTarget, { passive: true });

  // Inicializa valores ao carregar metadados
  video.addEventListener("loadedmetadata", updateVideoTarget);
  
  if (video.readyState >= 1) {
    updateVideoTarget();
  }

  // Loop de renderização (suavização) sob demanda (para e poupa 100% de GPU quando parado)
  function renderLoop() {
    const diff = targetTime - currentTime;
    
    // Interpolação linear (LERP)
    currentTime += diff * ease;
    
    // Se a diferença for insignificante (estabilizado), para o render loop por completo
    if (Math.abs(diff) < 0.005) {
      currentTime = targetTime;
      performSeek(currentTime);
      animFrameId = null; // Sinaliza que o loop está inativo/dormindo
      return; // Interrompe o requestAnimationFrame, liberando 100% da GPU/CPU
    }
    
    // Apenas atualiza a seek do vídeo se a diferença for maior que meio frame (0.015s)
    if (Math.abs(diff) > 0.015) {
      performSeek(currentTime);
    }
    
    // Continua o loop enquanto a interpolação não finalizar
    animFrameId = requestAnimationFrame(renderLoop);
  }
}

function setupScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

function setupFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/**
 * Gerencia a reprodução inteligente 1 por 1.
 * Se o usuário migrar para tags <video> locais no futuro, gerencia o Autoplay sequencial (1 por 1).
 * Para os iframes atuais, garante efeitos interativos de foco visual premium.
 */
function setupReelsAutoplay() {
  const cards = document.querySelectorAll(".reel-card");
  const localVideos = document.querySelectorAll(".reel-video-wrapper video");
  
  if (localVideos.length > 0) {
    // MOTOR DE AUTOPLAY SEQUENCIAL 1 POR 1 (Para vídeos locais nativos MP4)
    let currentActiveIndex = 0;
    
    // Muta todos por segurança contra bloqueios de autoplay do navegador
    localVideos.forEach(v => {
      v.muted = true;
      v.loop = false;
      v.removeAttribute("autoplay");
    });
    
    function playVideoAtIndex(index) {
      if (index >= localVideos.length) index = 0;
      currentActiveIndex = index;
      
      // Para todos os outros
      localVideos.forEach((v, i) => {
        if (i !== index) {
          v.pause();
          v.currentTime = 0;
          cards[i].classList.remove("video-playing");
          cards[i].classList.remove("sound-active");
          v.muted = true;
        }
      });
      
      // Toca o vídeo atual
      const activeVideo = localVideos[index];
      cards[index].classList.add("video-playing");
      
      activeVideo.play()
        .then(() => {
          // Quando terminar de tocar, inicia o próximo sequencialmente
          activeVideo.onended = () => {
            playVideoAtIndex(index + 1);
          };
        })
        .catch(err => {
          console.log("Autoplay bloqueado pelo navegador. Aguardando interação.", err);
          // Em caso de bloqueio, adiciona evento de clique para destravar
          document.addEventListener("click", () => {
            activeVideo.play();
          }, { once: true });
        });
    }
    
    // Inicializa tocando o primeiro vídeo
    playVideoAtIndex(0);

    // INTERATIVIDADE PREMIUM: Hover de foco + Clique para Mutar/Desmutar
    cards.forEach((card, index) => {
      const video = localVideos[index];
      
      // Efeito de Foco Premium (esmaece os outros cards)
      card.addEventListener("mouseenter", () => {
        cards.forEach(c => {
          if (c !== card) {
            c.style.opacity = "0.45";
            c.style.filter = "blur(1px) grayscale(20%)";
          } else {
            c.style.opacity = "1";
            c.style.filter = "none";
          }
        });
      });
      
      card.addEventListener("mouseleave", () => {
        cards.forEach(c => {
          c.style.opacity = "1";
          c.style.filter = "none";
        });
      });
      
      // Clique no frame do vídeo liga/desliga o som ou alterna o foco
      const frame = card.querySelector(".reel-frame");
      if (frame) {
        frame.style.cursor = "pointer";
        frame.addEventListener("click", (e) => {
          // Evita que o clique dispare ações se clicar no botão do Instagram
          if (e.target.closest(".reel-insta-btn")) return;
          
          // Se o vídeo clicado não for o ativo, ativa ele
          if (currentActiveIndex !== index) {
            playVideoAtIndex(index);
            video.muted = false; // Começa tocando com som
            card.classList.add("sound-active");
          } else {
            // Se já for o ativo, apenas alterna o mute (som)
            video.muted = !video.muted;
            if (!video.muted) {
              card.classList.add("sound-active");
            } else {
              card.classList.remove("sound-active");
            }
          }
        });
      }
    });
  } else {
    // Efeitos premium para os embeds de Iframe do Instagram antigos (fallback)
    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        cards.forEach(c => {
          if (c !== card) {
            c.style.opacity = "0.45";
            c.style.filter = "blur(1px) grayscale(20%)";
          } else {
            c.style.opacity = "1";
            c.style.filter = "none";
          }
        });
      });
      
      card.addEventListener("mouseleave", () => {
        cards.forEach(c => {
          c.style.opacity = "1";
          c.style.filter = "none";
        });
      });
    });
  }
}

/**
 * Configura o Assistente de Pré-Diagnóstico Interativo
 */
function setupDiagnosticWizard() {
  const symptomBtns = document.querySelectorAll(".symptom-btn");
  const deviceSelect = document.getElementById("diagnostic-device-select");
  const submitBtn = document.getElementById("btn-submit-diagnostic");
  
  if (!symptomBtns.length || !deviceSelect || !submitBtn) return;
  
  let selectedSymptom = symptomBtns[0].getAttribute("data-symptom");
  
  // 1. Escuta cliques nos botões de sintomas
  symptomBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      symptomBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSymptom = btn.getAttribute("data-symptom");
      updateDiagnosticLink();
    });
  });
  
  // 2. Escuta mudanças no dropdown de aparelho
  deviceSelect.addEventListener("change", () => {
    updateDiagnosticLink();
  });
  
  // 3. Função que gera a URL personalizada do WhatsApp
  function updateDiagnosticLink() {
    const model = deviceSelect.value;
    if (!model) return;
    
    const message = `Olá! Gostaria de um orçamento para o meu iPhone ${model}.\nDefeito/Sintoma: ${selectedSymptom}.\nPoderiam me enviar o técnico delivery?`;
    const whatsappUrl = `https://wa.me/${CONFIG.contact.phoneRaw}?text=${encodeURIComponent(message)}`;
    
    submitBtn.setAttribute("href", whatsappUrl);
  }
  
  // Inicializa o link padrão
  updateDiagnosticLink();
}
