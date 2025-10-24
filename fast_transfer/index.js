// FastTransfer - Sistema Principal Refatorado
// Arquivo principal que orquestra todos os componentes seguindo princípios de Clean Code

(() => {
  console.log('[FastTransfer] Sistema iniciado - Versão Refatorada');

// Verifica se o script já foi injetado
  if (window.__opaFastTransferInjected) {
    console.log('[FastTransfer] Sistema já foi injetado, ignorando.');
    return;
  }
  
  window.__opaFastTransferInjected = true;
  
  // Classe principal que coordena todos os componentes
  class FastTransferSystem {
    constructor() {
      this.eventBus = null;
      this.components = new Map();
      this.services = new Map();
      this.isInitialized = false;
      
      this.init();
    }

    /**
     * Inicializa o sistema FastTransfer
     */
    async init() {
      try {
        console.log('[FastTransferSystem] Inicializando sistema...');
        
        // 1. Carrega dependências
        await this.loadDependencies();
        
        // 2. Inicializa componentes principais
        this.initializeComponents();
        
        // 3. Inicializa serviços
        this.initializeServices();
        
        // 4. Configura sistema de estilos
        this.setupStyles();
        
        // 5. Configura listeners globais
        this.setupGlobalListeners();
        
        this.isInitialized = true;
        console.log('[FastTransferSystem] Sistema inicializado com sucesso');
        
      } catch (error) {
        console.error('[FastTransferSystem] Erro durante inicialização:', error);
        this.handleInitializationError(error);
      }
    }

    /**
     * Carrega todas as dependências necessárias
     */
    async loadDependencies() {
      console.log('[FastTransferSystem] Carregando dependências...');
      
      // Verifica se todas as dependências estão disponíveis
      const requiredDependencies = [
        'FastTransferConfig',
        'FastTransferData', 
        'FastTransferEventBus',
        'FastTransferDOMUtils',
        'FastTransferButton',
        'FastTransferModal',
        'FastTransferObservationService',
        'FastTransferTransferService',
        'FastTransferStyleManager'
      ];

      const missingDependencies = requiredDependencies.filter(dep => !window[dep]);
      
      if (missingDependencies.length > 0) {
        throw new Error(`Dependências não encontradas: ${missingDependencies.join(', ')}`);
      }

      console.log('[FastTransferSystem] Todas as dependências carregadas');
    }

    /**
     * Inicializa todos os componentes
     */
    initializeComponents() {
      console.log('[FastTransferSystem] Inicializando componentes...');
      
      // Inicializa EventBus
      this.eventBus = window.FastTransferEventBus;
      
      // Inicializa componentes principais
      this.components.set('button', new window.FastTransferButton(this.eventBus));
      this.components.set('modal', new window.FastTransferModal(this.eventBus));
      
      console.log('[FastTransferSystem] Componentes inicializados');
    }

    /**
     * Inicializa todos os serviços
     */
    initializeServices() {
      console.log('[FastTransferSystem] Inicializando serviços...');
      
      // Inicializa serviços
      this.services.set('observation', new window.FastTransferObservationService(this.eventBus));
      this.services.set('transfer', new window.FastTransferTransferService(this.eventBus));
      
      console.log('[FastTransferSystem] Serviços inicializados');
    }

    /**
     * Configura sistema de estilos
     */
    setupStyles() {
      console.log('[FastTransferSystem] Configurando estilos...');
      
      const styleManager = new window.FastTransferStyleManager();
      styleManager.addStyles();
      
      console.log('[FastTransferSystem] Estilos configurados');
    }

    /**
     * Configura listeners globais
     */
    setupGlobalListeners() {
      console.log('[FastTransferSystem] Configurando listeners globais...');
      
      // Função de emergência para forçar criação do botão
      window.__forceCreateFastTransferButton = () => {
        console.log('[FastTransferSystem] ========== FORÇANDO CRIAÇÃO ==========');
        const buttonComponent = this.components.get('button');
        if (buttonComponent) {
          buttonComponent.forceCreate();
        }
        return true;
      };

      // Listener para mudanças de configuração
      if (window.__opaUtils && window.__opaUtils.config) {
        window.__opaUtils.config.onChange((changes) => {
          if (changes.fastTransferEnabled !== undefined) {
            console.log('[FastTransferSystem] Configurações alteradas:', changes);
            this.handleConfigurationChange(changes.fastTransferEnabled);
          }
        });
      }

      console.log('[FastTransferSystem] Listeners globais configurados');
    }

    /**
     * Manipula mudanças de configuração
     */
    handleConfigurationChange(isEnabled) {
      if (isEnabled) {
        console.log('[FastTransferSystem] Reativando sistema...');
        this.reactivate();
      } else {
        console.log('[FastTransferSystem] Desativando sistema...');
        this.deactivate();
      }
    }

    /**
     * Reativa o sistema
     */
    reactivate() {
      if (!this.isInitialized) {
        this.init();
        return;
      }

      const buttonComponent = this.components.get('button');
      if (buttonComponent) {
        buttonComponent.startDetection();
      }
    }

    /**
     * Desativa o sistema
     */
    deactivate() {
      const buttonComponent = this.components.get('button');
      if (buttonComponent) {
        buttonComponent.disable();
      }

      const modalComponent = this.components.get('modal');
      if (modalComponent) {
        modalComponent.hide();
      }
    }

    /**
     * Manipula erros de inicialização
     */
    handleInitializationError(error) {
      console.error('[FastTransferSystem] Erro crítico durante inicialização:', error);
      
      // Tenta inicialização básica como fallback
      console.log('[FastTransferSystem] Tentando inicialização básica...');
      this.initializeBasicMode();
    }

    /**
     * Modo básico de inicialização (fallback)
     */
    initializeBasicMode() {
      console.log('[FastTransferSystem] Iniciando modo básico...');
      
      // Cria apenas o botão básico sem funcionalidades avançadas
      const basicButton = document.createElement('button');
      basicButton.textContent = 'Transferir 🚀 (Modo Básico)';
      basicButton.style.cssText = `
        width: 90%;
        background-color: #ffffff;
        color: black;
        border: none;
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
        font-family: sans-serif;
        font-size: 14px;
        margin-top: 5px;
      `;
      
      basicButton.addEventListener('click', () => {
        alert('Modo básico ativo. Funcionalidades avançadas não disponíveis.');
      });

      // Tenta encontrar um container para o botão
      const container = document.querySelector('.dialog_panel .botoes');
      if (container) {
        container.appendChild(basicButton);
        console.log('[FastTransferSystem] Modo básico ativado');
      }
    }

    /**
     * Obtém informações de debug do sistema
     */
    getDebugInfo() {
      return {
        isInitialized: this.isInitialized,
        components: Array.from(this.components.keys()),
        services: Array.from(this.services.keys()),
        eventBus: !!this.eventBus,
        dependencies: {
          config: !!window.FastTransferConfig,
          data: !!window.FastTransferData,
          domUtils: !!window.FastTransferDOMUtils,
          styleManager: !!window.FastTransferStyleManager
        }
      };
    }

    /**
     * Destrói o sistema e limpa recursos
     */
    destroy() {
      console.log('[FastTransferSystem] Destruindo sistema...');
      
      // Desativa todos os componentes
      this.components.forEach(component => {
        if (component.disable) component.disable();
        if (component.destroy) component.destroy();
      });

      // Limpa serviços
      this.services.forEach(service => {
        if (service.destroy) service.destroy();
      });

      // Limpa event bus
      if (this.eventBus) {
        this.eventBus.clear();
      }

      // Remove listeners globais
      delete window.__forceCreateFastTransferButton;

      this.isInitialized = false;
      window.__opaFastTransferInjected = false;
      
      console.log('[FastTransferSystem] Sistema destruído');
    }
  }

  // Inicializa o sistema
  const fastTransferSystem = new FastTransferSystem();

  // Expõe sistema globalmente para debug
  window.FastTransferSystem = fastTransferSystem;

  console.log('[FastTransfer] Sistema FastTransfer carregado com sucesso');
})(); 