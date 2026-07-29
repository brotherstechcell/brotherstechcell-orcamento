/**
 * LÓGICA E INTERATIVIDADE - BROTHERS TECHCELL
 */

// Importa explicitamente as imagens para que o Vite processe e envie para o build final
import iconeTelaSrc from '../../assets/icone-tela.jpg';
import iconeBateriaSrc from '../../assets/icone-bateria.jpg';

let pageAbortController;

document.addEventListener("astro:page-load", async () => {
  pageAbortController?.abort();
  pageAbortController = new AbortController();
  const pageSignal = pageAbortController.signal;

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
          let merged = false;
          if (data.devices && Object.keys(data.devices).length > 0) {
            console.log("Brothersystem: Preços em tempo real recebidos em formato tree. Total de modelos:", Object.keys(data.devices).length);
            configObj.devices = { ...configObj.devices, ...data.devices };
            merged = true;
          } else {
            // Converte o formato do Supabase catalog para o formato aninhado CONFIG.devices
            const convertedDevices = parseCatalogToDevices(data);
            if (Object.keys(convertedDevices).length > 0) {
              console.log("Brothersystem: Preços em tempo real carregados e convertidos com sucesso. Total de modelos:", Object.keys(convertedDevices).length);
              configObj.devices = { ...configObj.devices, ...convertedDevices };
              merged = true;
            }
          }

          if (merged) {
            // Re-inicializa o dropdown e re-renderiza o modelo atual se aplicável
            const dropdown = document.getElementById("device-search-select");
            if (dropdown) {
              const currentValue = dropdown.value;
              initPricingSelector(pageSignal);
              if (currentValue && configObj.devices[currentValue]) {
                dropdown.value = currentValue;
                renderSelectorResults(currentValue);
              }
            }
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
      let qualityName = qualityMap[p.quality_id];

      if (!modelName || !serviceName || !qualityName) return;

      // Normalização de qualidades legadas
      if (qualityName.trim().toLowerCase() === "intermediária" || qualityName.trim().toLowerCase() === "intermediaria") {
        qualityName = "Econômica";
      }
      if (qualityName.trim().toLowerCase() === "básica" || qualityName.trim().toLowerCase() === "basica") {
        return; // Ignorar qualidade básica
      }

      if (!devices[modelName]) {
        devices[modelName] = {};
      }
      if (!devices[modelName][serviceName]) {
        devices[modelName][serviceName] = {};
      }

      let formattedPrice = "Sob Consulta";
      let formattedInstallment = "";

      if (typeof p.cash_price === "number" && p.cash_price > 0) {
        formattedPrice = p.cash_price.toFixed(2).replace(".", ",");
        if (p.installment_text) {
          formattedInstallment = p.installment_text;
        } else {
          let instVal = p.installment_12x;
          if (!instVal) {
            instVal = (p.cash_price * 1.1416) / 12;
          }
          formattedInstallment = `12x de R$ ${instVal.toFixed(2).replace(".", ",")}`;
        }
      } else if (typeof p.cash_price === "string" && p.cash_price.trim() !== "" && !p.cash_price.toLowerCase().includes("sob consulta")) {
        formattedPrice = p.cash_price;
        formattedInstallment = p.installment_text || "";
      }

      devices[modelName][serviceName][qualityName] = {
        price: formattedPrice,
        installment: formattedInstallment
      };
    });

    return devices;
  }

  initPricingSelector(pageSignal);
  updateWhatsAppLinks();
  setupScrollEffects(pageSignal);
  setupVideoCarousel();
  setupHeroScrollVideo(pageSignal);
  setupScrollReveal(pageSignal);
  setupFaqAccordion();
  setupReelsAutoplay(pageSignal);
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
 * Detecta o modelo do iPhone do visitante via User Agent / Tela para pré-seleção inteligente
 */
function detectUserIphoneModel(availableModels) {
  if (typeof navigator === "undefined" || !navigator.userAgent) return null;
  const ua = navigator.userAgent;
  if (!/iPhone/i.test(ua)) return null;

  for (const model of availableModels) {
    const rawNum = model.replace(/[^0-9]/g, '');
    if (rawNum && ua.includes(`iPhone${rawNum}`)) {
      return model;
    }
  }

  // Mapeamento por tamanho lógico de tela (viewport width x height)
  if (typeof window !== "undefined" && window.screen) {
    const w = window.screen.width;
    const h = window.screen.height;
    const maxDim = Math.max(w, h);

    if (maxDim === 932 || maxDim === 956) {
      if (availableModels.includes("16 Pro Max")) return "16 Pro Max";
      if (availableModels.includes("15 Pro Max")) return "15 Pro Max";
    } else if (maxDim === 852 || maxDim === 874) {
      if (availableModels.includes("16 Pro")) return "16 Pro";
      if (availableModels.includes("15 Pro")) return "15 Pro";
    } else if (maxDim === 844) {
      if (availableModels.includes("14")) return "14";
      if (availableModels.includes("13")) return "13";
      if (availableModels.includes("12")) return "12";
    } else if (maxDim === 896) {
      if (availableModels.includes("11")) return "11";
      if (availableModels.includes("XR")) return "XR";
    }
  }

  return null;
}

const LOGICAL_MODEL_GROUPS = [
  { label: "Linha iPhone 17", models: ["17 Pro Max", "17 Pro", "17 Plus", "17"] },
  { label: "Linha iPhone 16", models: ["16 Pro Max", "16 Pro", "16 Plus", "16"] },
  { label: "Linha iPhone 15", models: ["15 Pro Max", "15 Pro", "15 Plus", "15"] },
  { label: "Linha iPhone 14", models: ["14 Pro Max", "14 Pro", "14 Plus", "14"] },
  { label: "Linha iPhone 13", models: ["13 Pro Max", "13 Pro", "13 Mini", "13"] },
  { label: "Linha iPhone 12 & 11", models: ["12 Pro Max", "12 Pro", "12 Mini", "12", "11 Pro Max", "11 Pro", "11"] },
  { label: "Modelos Anteriores", models: ["XS Max", "XS", "XR", "X", "SE 2/3", "8 Plus", "8", "7 Plus", "7", "6S Plus", "6S", "6"] }
];

function populateSelectWithOptgroups(selectEl, sortedModels, defaultText) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultText;
  defaultOption.disabled = true;
  selectEl.appendChild(defaultOption);

  LOGICAL_MODEL_GROUPS.forEach(group => {
    const groupModels = group.models.filter(m => sortedModels.includes(m));
    if (groupModels.length > 0) {
      const optGroup = document.createElement("optgroup");
      optGroup.label = group.label;
      groupModels.forEach(model => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = `iPhone ${model}`;
        optGroup.appendChild(option);
      });
      selectEl.appendChild(optGroup);
    }
  });
}

function setupMobileMenuToggle(signal) {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const navList = document.getElementById("nav-menu-list");
  if (!toggleBtn || !navList) return;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navList.classList.toggle("mobile-open");
    toggleBtn.classList.toggle("active");
  });

  document.querySelectorAll("#nav-menu-list a").forEach(link => {
    link.addEventListener("click", () => {
      navList.classList.remove("mobile-open");
      toggleBtn.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!navList.contains(e.target) && !toggleBtn.contains(e.target)) {
      navList.classList.remove("mobile-open");
      toggleBtn.classList.remove("active");
    }
  }, { signal });
}

/**
 * Inicializa o componente de Seletor Único de iPhone e abas de serviços
 */
function initPricingSelector(signal) {
  const dropdown = document.getElementById("device-search-select");
  const tabTelasBaterias = document.getElementById("tab-btn-telas-baterias");
  const tabOutrosServicos = document.getElementById("tab-btn-outros-servicos");
  const panelTelasBaterias = document.getElementById("panel-telas-baterias");
  const panelOutrosServicos = document.getElementById("panel-outros-servicos");

  const diagDropdown = document.getElementById("diagnostic-device-select");
  if (!dropdown || !CONFIG.devices) return;

  setupMobileMenuToggle(signal);

  // 1. Popular o Dropdown ordenado de forma lógica com optgroups
  const sortedModels = Object.keys(CONFIG.devices).sort((a, b) => {
    const indexA = LOGICAL_MODEL_ORDER.indexOf(a);
    const indexB = LOGICAL_MODEL_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  
  // Popular Dropdown Principal
  populateSelectWithOptgroups(dropdown, sortedModels, "Clique aqui e escolha o modelo...");
  
  // Detecção Inteligente do iPhone do Usuário
  const detectedModel = detectUserIphoneModel(sortedModels);
  const initialModel = (detectedModel && sortedModels.includes(detectedModel)) ? detectedModel : sortedModels[0];

  // Popular Dropdown do Assistente de Diagnóstico
  if (diagDropdown) {
    populateSelectWithOptgroups(diagDropdown, sortedModels, "Selecione o modelo...");
    diagDropdown.value = initialModel;
  }
  
  // Define o valor selecionado
  dropdown.value = initialModel;
  renderSelectorResults(initialModel);
  
  // Lógica da Barra de Busca & Grade por Gerações (Mobile Quick Select)
  setupMobileDeviceSearchAndChips(sortedModels, dropdown);

  // 2. Escutar mudanças no Dropdown
  dropdown.addEventListener("change", (e) => {
    renderSelectorResults(e.target.value);
    syncActiveModelChip(e.target.value);
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

const MODEL_SYNONYMS = {
  "17 Pro Max": ["17 pro max", "17promax", "17pm", "17 pro m", "17prom", "iphone 17 pro max", "ip 17 pm", "ip17pm"],
  "17 Pro": ["17 pro", "17pro", "17p", "iphone 17 pro", "ip 17 pro", "ip17p"],
  "17 Plus": ["17 plus", "17plus", "17+", "iphone 17 plus", "ip 17 plus", "ip17plus"],
  "17": ["17", "iphone 17", "ip 17", "ip17"],
  "17 Air": ["17 air", "17air", "iphone 17 air"],

  "16 Pro Max": ["16 pro max", "16promax", "16pm", "16 pro m", "16prom", "iphone 16 pro max", "ip 16 pm", "ip16pm"],
  "16 Pro": ["16 pro", "16pro", "16p", "iphone 16 pro", "ip 16 pro", "ip16p"],
  "16 Plus": ["16 plus", "16plus", "16+", "iphone 16 plus", "ip 16 plus", "ip16plus"],
  "16": ["16", "iphone 16", "ip 16", "ip16"],

  "15 Pro Max": ["15 pro max", "15promax", "15pm", "15 pro m", "15prom", "iphone 15 pro max", "ip 15 pm", "ip15pm"],
  "15 Pro": ["15 pro", "15pro", "15p", "iphone 15 pro", "ip 15 pro", "ip15p"],
  "15 Plus": ["15 plus", "15plus", "15+", "iphone 15 plus", "ip 15 plus", "ip15plus"],
  "15": ["15", "iphone 15", "ip 15", "ip15"],

  "14 Pro Max": ["14 pro max", "14promax", "14pm", "14 pro m", "14prom", "iphone 14 pro max", "ip 14 pm", "ip14pm"],
  "14 Pro": ["14 pro", "14pro", "14p", "iphone 14 pro", "ip 14 pro", "ip14p"],
  "14 Plus": ["14 plus", "14plus", "14+", "iphone 14 plus", "ip 14 plus", "ip14plus"],
  "14": ["14", "iphone 14", "ip 14", "ip14"],

  "13 Pro Max": ["13 pro max", "13promax", "13pm", "13 pro m", "13prom", "iphone 13 pro max", "ip 13 pm", "ip13pm"],
  "13 Pro": ["13 pro", "13pro", "13p", "iphone 13 pro", "ip 13 pro", "ip13p"],
  "13 Mini": ["13 mini", "13mini", "13m", "iphone 13 mini", "ip 13 mini", "ip13m"],
  "13": ["13", "iphone 13", "ip 13", "ip13"],

  "12 Pro Max": ["12 pro max", "12promax", "12pm", "12 pro m", "12prom", "iphone 12 pro max", "ip 12 pm", "ip12pm"],
  "12 Pro": ["12 pro", "12pro", "12p", "iphone 12 pro", "ip 12 pro", "ip12p"],
  "12 Mini": ["12 mini", "12mini", "12m", "iphone 12 mini", "ip 12 mini", "ip12m"],
  "12": ["12", "iphone 12", "ip 12", "ip12"],

  "11 Pro Max": ["11 pro max", "11promax", "11pm", "11 pro m", "11prom", "iphone 11 pro max", "ip 11 pm", "ip11pm"],
  "11 Pro": ["11 pro", "11pro", "11p", "iphone 11 pro", "ip 11 pro", "ip11p"],
  "11": ["11", "iphone 11", "ip 11", "ip11"],

  "XS Max": ["xs max", "xsmax", "xs m", "xsm", "iphone xs max", "ip xs max"],
  "XS": ["xs", "iphone xs", "ip xs"],
  "XR": ["xr", "iphone xr", "ip xr"],
  "X": ["x", "iphone x", "ip x", "ten"],

  "SE 2/3": ["se 2", "se 3", "se2", "se3", "se 2020", "se 2022", "se", "iphone se"],

  "8 Plus": ["8 plus", "8plus", "8p", "8+", "iphone 8 plus", "ip 8 plus"],
  "8": ["8", "iphone 8", "ip 8"],

  "7 Plus": ["7 plus", "7plus", "7p", "7+", "iphone 7 plus", "ip 7 plus"],
  "7": ["7", "iphone 7", "ip 7"],

  "6S Plus": ["6s plus", "6splus", "6sp", "6s+", "iphone 6s plus"],
  "6S": ["6s", "iphone 6s"],
  "6": ["6", "iphone 6"]
};

function findMatchingModel(query, availableModels) {
  if (!query) return null;
  const rawQ = query.toLowerCase().trim();
  const cleanQ = rawQ.replace(/^(iphone|ip|apple)\s*/i, '').trim();
  const compactQ = cleanQ.replace(/[\s\-\_\.]/g, '');

  if (!compactQ) return null;

  // 1. Busca por Sinônimo Exato
  for (const model of availableModels) {
    const synonyms = MODEL_SYNONYMS[model] || [model.toLowerCase()];
    for (const syn of synonyms) {
      const compactSyn = syn.replace(/^(iphone|ip|apple)\s*/i, '').replace(/[\s\-\_\.]/g, '');
      if (compactSyn === compactQ) {
        return model;
      }
    }
  }

  // 2. Busca por Início/Contém nos Sinônimos
  for (const model of availableModels) {
    const synonyms = MODEL_SYNONYMS[model] || [model.toLowerCase()];
    for (const syn of synonyms) {
      const compactSyn = syn.replace(/^(iphone|ip|apple)\s*/i, '').replace(/[\s\-\_\.]/g, '');
      if (compactSyn.startsWith(compactQ) || compactSyn.includes(compactQ)) {
        return model;
      }
    }
  }

  return null;
}

function setupMobileDeviceSearchAndChips(sortedModels, dropdown) {
  const searchInput = document.getElementById("device-search-input");
  const clearBtn = document.getElementById("search-input-clear-btn");
  const matchedBadgeName = document.getElementById("matched-model-name");
  const suggestionsContainer = document.getElementById("search-autocomplete-suggestions");

  if (!searchInput) return;

  function selectModel(model, updateInput = false) {
    if (!sortedModels.includes(model)) return;
    dropdown.value = model;
    renderSelectorResults(model);

    if (matchedBadgeName) {
      matchedBadgeName.textContent = `iPhone ${model}`;
    }

    if (updateInput && searchInput) {
      searchInput.value = `iPhone ${model}`;
      if (clearBtn) clearBtn.style.display = "block";
    }

    renderSuggestions(searchInput ? searchInput.value : "");
  }

  function renderSuggestions(queryText) {
    if (!suggestionsContainer) return;
    suggestionsContainer.innerHTML = "";

    const rawQ = queryText.toLowerCase().trim();
    const cleanQ = rawQ.replace(/^(iphone|ip|apple)\s*/i, '').trim();
    const compactQ = cleanQ.replace(/[\s\-\_\.]/g, '');

    let candidates = [];
    if (!compactQ) {
      // Sugestões populares por padrão
      candidates = ["15 Pro Max", "14 Pro Max", "13", "11", "XR", "12 Pro Max"].filter(m => sortedModels.includes(m));
    } else {
      candidates = sortedModels.filter(model => {
        const synonyms = MODEL_SYNONYMS[model] || [model.toLowerCase()];
        return synonyms.some(syn => {
          const compactSyn = syn.replace(/^(iphone|ip|apple)\s*/i, '').replace(/[\s\-\_\.]/g, '');
          return compactSyn.includes(compactQ);
        });
      });
    }

    // Renderiza chips de atalho rápido para as opções encontradas
    candidates.slice(0, 8).forEach(model => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `model-chip-btn ${dropdown.value === model ? 'active' : ''}`;
      chip.textContent = `iPhone ${model}`;
      chip.addEventListener("click", () => {
        selectModel(model, true);
      });
      suggestionsContainer.appendChild(chip);
    });
  }

  // Evento em tempo real no campo de busca
  searchInput.addEventListener("input", (e) => {
    const val = e.target.value;
    if (clearBtn) {
      clearBtn.style.display = val.trim().length > 0 ? "block" : "none";
    }

    const matched = findMatchingModel(val, sortedModels);
    if (matched) {
      selectModel(matched, false);
    } else {
      renderSuggestions(val);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      const defaultModel = dropdown.value || sortedModels[0];
      selectModel(defaultModel, false);
      searchInput.focus();
    });
  }

  // Inicialização
  const initial = dropdown.value || sortedModels[0];
  selectModel(initial, false);
}

function syncActiveModelChip(selectedModel) {
  const matchedBadgeName = document.getElementById("matched-model-name");
  if (matchedBadgeName) {
    matchedBadgeName.textContent = `iPhone ${selectedModel}`;
  }
}

/**
 * Renderiza os cards de resultados para o modelo de iPhone selecionado
 */
function renderSelectorResults(modelName) {
  const resultsGrid = document.getElementById("selector-results-grid");
  if (!resultsGrid || !CONFIG.devices || !CONFIG.devices[modelName]) return;

  const deviceData = CONFIG.devices[modelName];
  resultsGrid.innerHTML = "";
  
  // 1. Criar Card de TELA
  const screenCard = document.createElement("div");
  screenCard.className = "price-selector-card fancy-card";
  
  let screenItemsHtml = "";
  if (deviceData.tela && Object.keys(deviceData.tela).length > 0) {
    const qualitiesOrder = ["Premium", "Econômica"];
    const sortedQualities = Object.keys(deviceData.tela)
      .filter(q => {
        const qClean = q.trim().toLowerCase();
        return qClean !== "básica" && qClean !== "basica";
      })
      .sort((a, b) => {
        return qualitiesOrder.indexOf(a) - qualitiesOrder.indexOf(b);
      });
    
    sortedQualities.forEach(quality => {
      const qData = deviceData.tela[quality];
      const isSobConsulta = qData.price.toLowerCase().includes("consulta");
      const priceText = isSobConsulta ? qData.price : `R$ ${qData.price}`;
      const installmentText = isSobConsulta ? "" : `ou ${qData.installment}`;
      
      let displayQuality = quality;
      if (quality.trim().toLowerCase() === "intermediária" || quality.trim().toLowerCase() === "intermediaria") {
        displayQuality = "Econômica";
      }
      
      const isPremium = quality.trim().toLowerCase() === 'premium';
      const rowClass = isPremium ? 'service-quality-row premium-featured' : 'service-quality-row';
      const btnClass = isPremium ? 'btn-quality-order btn-premium-cta' : 'btn-quality-order';
      const buttonText = isPremium ? 'AGENDAR PREMIUM' : 'AGENDAR';
      
      const redirectUrl = `https://brothersystem.vercel.app/agendar?link=tela&device=${encodeURIComponent(modelName)}&quality=${encodeURIComponent(displayQuality)}`;
      
      screenItemsHtml += `
        <div class="${rowClass}">
          <div class="quality-row-main">
            <div class="quality-label">
              <div class="quality-badge-wrapper" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="quality-badge ${displayQuality.toLowerCase()}">${displayQuality}</span>
                ${isPremium ? '<span class="premium-recommend-badge" style="font-size: 0.65rem; background: linear-gradient(135deg, #ff9f43 0%, #ff5252 100%); color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 800; letter-spacing: 0.03em; box-shadow: 0 2px 8px rgba(255, 82, 82, 0.3);">🔥 MAIS VENDIDA</span>' : ''}
              </div>
              ${getQualityBenefitsHtml(displayQuality)}
            </div>
            <div class="quality-pricing">
              <span class="quality-price-cash">${priceText}</span>
              <span class="quality-price-install">${installmentText}</span>
            </div>
          </div>
          <div class="quality-action">
            <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" class="${btnClass}" aria-label="Agendar troca de tela ${displayQuality} para iPhone ${modelName}">
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
        <span class="icon-service-type">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
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
    const qualitiesOrder = ["Premium", "Econômica"];
    const sortedQualities = Object.keys(deviceData.bateria)
      .filter(q => {
        const qClean = q.trim().toLowerCase();
        return qClean !== "básica" && qClean !== "basica";
      })
      .sort((a, b) => {
        return qualitiesOrder.indexOf(a) - qualitiesOrder.indexOf(b);
      });
    
    sortedQualities.forEach(quality => {
      const qData = deviceData.bateria[quality];
      const isSobConsulta = qData.price.toLowerCase().includes("consulta");
      const priceText = isSobConsulta ? qData.price : `R$ ${qData.price}`;
      const installmentText = isSobConsulta ? "" : `ou ${qData.installment}`;
      
      let displayQuality = quality;
      if (quality.trim().toLowerCase() === "intermediária" || quality.trim().toLowerCase() === "intermediaria") {
        displayQuality = "Econômica";
      }
      
      const redirectUrl = `https://brothersystem.vercel.app/agendar?link=bateria&device=${encodeURIComponent(modelName)}&quality=${encodeURIComponent(displayQuality)}`;
      
      batteryItemsHtml += `
        <div class="service-quality-row">
          <div class="quality-row-main">
            <div class="quality-label">
              <span class="quality-badge ${displayQuality.toLowerCase()}">${displayQuality}</span>
              ${getQualityBenefitsHtml(displayQuality)}
            </div>
            <div class="quality-pricing">
              <span class="quality-price-cash">${priceText}</span>
              <span class="quality-price-install">${installmentText}</span>
            </div>
          </div>
          <div class="quality-action">
            <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" class="btn-quality-order" aria-label="Agendar troca de bateria ${displayQuality} para iPhone ${modelName}">
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
        <span class="icon-service-type battery">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
            <line x1="22" y1="11" x2="22" y2="13"></line>
            <line x1="6" y1="11" x2="6" y2="13"></line>
            <line x1="10" y1="11" x2="10" y2="13"></line>
          </svg>
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

  const stickyModelName = document.getElementById("sticky-price-bar-model-name");
  const stickyCta = document.getElementById("sticky-price-bar-cta");
  if (stickyModelName) stickyModelName.textContent = modelName;
  if (stickyCta) {
    const message = encodeURIComponent(`Olá! Quero saber o preço da troca de tela/bateria do meu iPhone ${modelName}.`);
    stickyCta.setAttribute("href", `https://wa.me/${CONFIG.contact.phoneRaw}?text=${message}`);
  }
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
  document.querySelectorAll(".btn-whatsapp-global:not([data-message]):not(#sticky-price-bar-cta)").forEach(el => {
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
function setupScrollEffects(signal) {
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
  }, { signal });
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
          6 Meses de Garantia
        </span>
        <span class="benefit-item gift">
          <svg viewBox="0 0 24 24" class="benefit-icon">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4V8h16v11z"/>
          </svg>
          Película + Capinha Grátis
        </span>
      </div>
    `;
  } else {
    return `
      <div class="quality-benefits-wrapper">
        <span class="benefit-item warranty">
          <svg viewBox="0 0 24 24" class="benefit-icon">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          3 Meses de Garantia
        </span>
      </div>
    `;
  }
}

/**
 * Configura o vídeo do Hero com reprodução contínua e 0 atraso no scroll
 */
function setupHeroScrollVideo(signal) {
  const video = document.getElementById("hero-scroll-video");
  const heroSection = document.getElementById("inicio");
  if (!video || !heroSection) return;

  const isDesktopScrollScrub =
    window.matchMedia("(min-width: 1024px)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (isDesktopScrollScrub) return;

  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const startPlay = () => {
          video.play();
          window.removeEventListener("touchstart", startPlay);
          window.removeEventListener("scroll", startPlay);
        };
        window.addEventListener("touchstart", startPlay, { passive: true, once: true, signal });
        window.addEventListener("scroll", startPlay, { passive: true, once: true, signal });
      });
    }
  };

  // Astro's ClientRouter adopts this element into the live document from a page fetched as a
  // separate Document (see astro/dist/transitions/swap-functions.js swapBodyElement). The
  // browser's own native `autoplay` attempt fires the instant the node lands in the live DOM —
  // well before this handler runs (it's gated behind this file's awaited pricing-sync fetch) —
  // and on a client-side transition back to this page that attempt can be rejected by Chromium
  // with MEDIA_ERR_SRC_NOT_SUPPORTED ("Media load rejected by URL safety check"), leaving the
  // element stuck in NETWORK_NO_SOURCE. There's no event to listen for after the fact (it already
  // fired before we could attach a handler). Only reset via load() when that broken state is
  // actually present — on a normal, non-transitioned first load nothing has failed, and calling
  // load() unconditionally would snap an already-playing video back to frame 0 for no reason.
  if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    video.load();
  }
  tryPlay();

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.05 });

  videoObserver.observe(heroSection);
  signal.addEventListener("abort", () => videoObserver.disconnect());
}

function setupScrollReveal(signal) {
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
  signal.addEventListener("abort", () => observer.disconnect());
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
function setupReelsAutoplay(signal) {
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

      // Same cross-document adoption issue as the Hero video (see setupHeroScrollVideo): after
      // a client-side page transition lands back on this page, these elements can be stuck in
      // NETWORK_NO_SOURCE from the browser's own invalidated resource selection. Only reset via
      // load() when that broken state is actually present, rather than unconditionally on every
      // call (this video is always paused at this point either way, so there's no visible-restart
      // risk here like the always-playing Hero video, but the guard keeps both call sites
      // consistent and avoids resetting currentTime/buffered state for no reason).
      if (activeVideo.error || activeVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        activeVideo.load();
      }

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
            activeVideo.play().catch(() => {});
          }, { once: true, signal });
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
