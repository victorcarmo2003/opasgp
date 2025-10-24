// Componente responsável pela criação e gerenciamento do botão principal
class FastTransferButton {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.isEnabled = true;
    this.observerCleanup = null;
    this.init();
  }

  init() {
    this.loadSettings();
    this.setupEventListeners();
  }

  loadSettings() {
    // Verifica se __opaUtils está disponível
    if (!window.__opaUtils || !window.__opaUtils.config) {
      console.warn('[FastTransferButton] __opaUtils não disponível, usando configuração padrão');
      this.startDetection();
      return;
    }

    window.__opaUtils.config.get({ fastTransferEnabled: true }).then(settings => {
      console.log('[FastTransferButton] Configurações carregadas:', settings);

      if (!settings.fastTransferEnabled) {
        console.log('[FastTransferButton] FastTransfer desabilitado nas configurações.');
        this.disable();
        return;
      }

      this.startDetection();
    }).catch(error => {
      console.error('[FastTransferButton] Erro ao carregar configurações:', error);
      this.startDetection();
    });
  }

  startDetection() {
    console.log('[FastTransferButton] Iniciando detecção de painéis...');
    this.isEnabled = true;
    
    // Verificação inicial imediata
    this.checkForPanels();

    // Configura observer
    this.setupObserver();
  }

  setupObserver() {
    // Usa observer do __opaUtils se disponível, senão cria um próprio
    if (window.__opaUtils && window.__opaUtils.observer) {
      this.observerCleanup = window.__opaUtils.observer.observe(
        document.body,
        { childList: true, subtree: true },
        () => this.checkForPanels()
      );
      console.log('[FastTransferButton] Observer ativo com módulo utilitário.');
    } else {
      // Fallback: cria observer próprio
      const observer = new MutationObserver(() => this.checkForPanels());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'data-id']
      });
      this.observerCleanup = () => observer.disconnect();
      console.log('[FastTransferButton] Observer próprio ativo.');
    }
  }

  checkForPanels() {
    if (!this.isEnabled) return;

    const foundPanels = window.FastTransferDOMUtils.queryMultipleSelectors(
      window.FastTransferConfig.SELECTORS.PANEL_SELECTORS
    );

    for (const panelDiv of foundPanels) {
      // Verifica se já existe botão FastTransfer neste painel
      if (panelDiv.querySelector('button[data-fastTransfer]')) {
        continue;
      }

      // Procura por div .botoes dentro do painel
      const botoesDivs = panelDiv.querySelectorAll('.botoes');

      for (const botoesDiv of botoesDivs) {
        // Verifica se esta div .botoes tem outros botões relevantes
        const existingButtons = botoesDiv.querySelectorAll('button');
        if (existingButtons.length > 0) {
          this.createButton(botoesDiv);
          break; // Para no primeiro válido encontrado
        }
      }
    }
  }

  createButton(container) {
    const button = document.createElement('button');
    button.setAttribute('data-fastTransfer', 'true');
    button.className = window.FastTransferConfig.CSS_CLASSES.BUTTON;
    button.textContent = 'Transferir 🚀';

    // Aplica estilos
    this.applyButtonStyles(button);

    // Adiciona eventos
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#5460d9';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#3a2fc1';
    });

    button.addEventListener('click', () => {
      this.eventBus.emit('transferButtonClicked');
    });

    container.appendChild(button);
    console.log('[FastTransferButton] Botão FastTransfer adicionado ao painel.');
  }

  applyButtonStyles(button) {
    const styles = `
      .${window.FastTransferConfig.CSS_CLASSES.BUTTON} {
        width: 90%;
        background-color: #3a2fc1;
        color: black;
        border: none;
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
        font-family: sans-serif;
        font-size: 14px;
        transition: background-color 0.2s ease;
        margin-top: 5px;
      }
      .${window.FastTransferConfig.CSS_CLASSES.BUTTON}:hover {
        background-color:rgb(24, 8, 202);
      }
    `;
    
    window.FastTransferDOMUtils.addStyles(styles);
  }

  removeButton() {
    const button = document.querySelector('button[data-fastTransfer]');
    if (button) {
      button.remove();
      console.log('[FastTransferButton] Botão FastTransfer removido do DOM.');
    }
  }

  disable() {
    this.isEnabled = false;
    this.removeButton();
    if (this.observerCleanup) {
      this.observerCleanup();
      this.observerCleanup = null;
    }
  }

  setupEventListeners() {
    // Escuta mudanças de configuração
    if (window.__opaUtils && window.__opaUtils.config) {
      window.__opaUtils.config.onChange((changes) => {
        if (changes.fastTransferEnabled !== undefined) {
          console.log('[FastTransferButton] Configurações alteradas:', changes);
          if (changes.fastTransferEnabled) {
            this.startDetection();
          } else {
            this.disable();
          }
        }
      });
    }
  }

  // Função de emergência para forçar criação do botão
  forceCreate() {
    console.log('[FastTransferButton] ========== FORÇANDO CRIAÇÃO ==========');
    this.checkForPanels();
    return true;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferButton = FastTransferButton;
}
