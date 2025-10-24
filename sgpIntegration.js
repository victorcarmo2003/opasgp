(() => {
  console.log('[SGP Integration] Script iniciado.');

  if (window.__opaSgpInjected) return;
  window.__opaSgpInjected = true;

  // Estado interno
  let observerCleanup = null;
  let isEnabled = true;

  // Cria botão SGP com funcionalidades aprimoradas
  function createSgpButton() {
    // Verifica se __opaUtils está disponível
    if (!window.__opaUtils || !window.__opaUtils.config) {
      console.warn('[SGP Integration] __opaUtils não disponível, usando configuração padrão');
      // Usa configuração padrão se __opaUtils não estiver disponível
      const settings = { sgpButtonEnabled: true };
      if (!settings.sgpButtonEnabled) {
        console.log('[SGP Integration] Botão SGP desabilitado nas configurações');
        return;
      }
      initializeSgpButton();
      return;
    }
    
    window.__opaUtils.config.get({ sgpButtonEnabled: true }).then(settings => {
      if (!settings.sgpButtonEnabled) {
        console.log('[SGP Integration] Botão SGP desabilitado nas configurações');
        return;
      }

      initializeSgpButton();
    }).catch(error => {
      console.error('[SGP Integration] Erro configurações:', error);
      // Fallback: inicializa mesmo com erro
      initializeSgpButton();
    });
  }
  
  function initializeSgpButton() {

      // Monitor básico que dispara a cada mudança
      const basicObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV') {
                // Verifica se é um painel candidato
                if (node.className.includes('dialog') || node.className.includes('panel') || node.className.includes('modal')) {
                  
                  // Tenta extrair ClientId
                  const clientId = extractClientIdFromElement(node);
                  if (clientId) {
                    console.log('[SGP Integration] ClientId encontrado:', clientId);
                    const botoesDiv = node.querySelector('.botoes');
                    if (botoesDiv) {
                      console.log('[SGP Integration] Criando botão SGP...');
                      createButton(botoesDiv, clientId);
                    } else {
                      console.log('[SGP Integration] Div .botoes não encontrada no painel');
                    }
                  }
                }
              }
            });
          }
        });
      });

      basicObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'data-id']
      });

      console.log('[SGP Integration] Observer ativo');
  }

  // Função auxiliar para extrair ClientId
  function extractClientIdFromElement(element) {
    if (!element) return null;
    
    // Verifica se __opaUtils está disponível
    if (!window.__opaUtils || !window.__opaUtils.dom) {
      console.warn('[SGP] __opaUtils não disponível, usando método alternativo');
      // Método alternativo sem __opaUtils
      const allElements = element.querySelectorAll('*');
      for (const el of allElements) {
        const text = el.textContent || el.innerText || '';
        const match = text.match(/(\d+)/);
        if (match && match[1].length >= 3) {
          return match[1];
        }
      }
      return null;
    }
    
    // Busca qualquer elemento com números
    const allElements = element.querySelectorAll('*');
    for (const el of allElements) {
      const text = window.__opaUtils.dom.getTextContent(el);
      const match = text.match(/(\d+)/);
      if (match && match[1].length >= 3) {
        return match[1];
      }
    }

    return null;
  }

  // Cria o botão
  function createButton(container, clientId) {
    const button = document.createElement('button');
    button.setAttribute('data-sgp-button', 'true');
    button.className = 'sgp-button';
    button.textContent = 'Visualizar no SGP';

    button.addEventListener('click', () => {
      const url = `https://intranet.fibranetbrasil.com.br/admin/cliente/${clientId}/edit/`;
      console.log('[SGP Integration] Abrindo cliente:', clientId);
      window.open(url, '_blank');
    });

    container.appendChild(button);
  }

  // Remove botão SGP
  function removeSgpButton() {
    const button = document.querySelector('button[data-sgp-button]');
    if (button) {
      button.remove();
      console.log('[SGP Integration] Botão removido');
    }
  }

  // Adiciona estilos CSS
  window.__opaUtils.dom.addStyles(`
    .sgp-button {
      width: 90%;
      background-color: #3499eb;
      color: white;
      border: none;
      padding: 10px;
      cursor: pointer;
      border-radius: 4px;
      font-family: sans-serif;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }
    .sgp-button:hover {
      background-color: #287acc;
    }

    /* Estilos específicos para container de mensagens dentro de modais de atendimento */
    form[name="new_atendimentoObservacao"] .botoes .message-templates-container {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 6px !important;
      margin: 0 !important;
      padding: 0 !important;
      background-color: transparent !important;
      border: none !important;
      border-radius: 0 !important;
      width: auto !important;
      align-items: center !important;
      flex: 1 !important;
    }

    /* Estilos específicos para botões de mensagens dentro de modais de atendimento */
    form[name="new_atendimentoObservacao"] .botoes .message-template-btn {
      /* Cores definidas dinamicamente via JavaScript */
      color: white !important;
      border: none !important;
      padding: 6px 10px !important;
      margin: 0 !important;
      border-radius: 3px !important;
      cursor: pointer !important;
      font-size: 11px !important;
      font-family: sans-serif !important;
      transition: background-color 0.2s ease !important;
      display: inline-block !important;
      white-space: nowrap !important;
      min-width: fit-content !important;
      height: 28px !important;
    }

    form[name="new_atendimentoObservacao"] .botoes .message-template-btn:hover {
      /* Hover definido dinamicamente via JavaScript */
    }

    /* Estilos específicos para div .botoes dentro de modais de atendimento */
    form[name="new_atendimentoObservacao"] .botoes {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      flex-wrap: wrap !important;
    }

    form[name="new_atendimentoObservacao"] .botoes button {
      margin: 0 !important;
      height: 28px !important;
    }

    form[name="new_atendimentoObservacao"] .botoes button#salvar {
      height: 28px !important;
      padding: 6px 12px !important;
    }
  `);

  // Configura listener
  window.__opaUtils.config.onChange((changes) => {
    console.log('[SGP Integration] Configurações alteradas:', changes);
    if (changes.sgpButtonEnabled) {
      createSgpButton();
    } else {
      removeSgpButton();
      if (observerCleanup) observerCleanup();
      isEnabled = false;
    }
  });

  // Inicializa
  createSgpButton();

  // Função de emergência
  window.__forceCreateSgpButton = () => {
    console.log('[SGP Integration] ========== FORÇANDO ==========');

    const containers = document.querySelectorAll('.botoes');
    if (containers.length > 0) {
      const container = containers[0];
      const clientId = '123'; // ClientId de teste
      createButton(container, clientId);
      return true;
    }

    return false;
  };

  console.log('[SGP Integration] ========== CARREGADO ==========');
})();