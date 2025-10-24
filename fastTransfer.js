// FastTransfer - Módulo Principal
// Este arquivo é o ponto de entrada da extensão FastTransfer
// A lógica principal foi movida para a pasta fast_transfer/

(() => {
  console.log('[FastTransfer] Script iniciado.');

  // Lista de dependências em ordem de carregamento
  const DEPENDENCIES = [
    'fast_transfer/config/constants.js',
    'fast_transfer/data/motivos.js',
    'fast_transfer/core/EventBus.js',
    'fast_transfer/utils/DOMUtils.js',
    'fast_transfer/core/StyleManager.js',
    'fast_transfer/components/FastTransferButton.js',
    'fast_transfer/components/TransferModal.js',
    'fast_transfer/services/ObservationService.js',
    'fast_transfer/services/TransferService.js',
    'fast_transfer/index.js'
  ];

  /**
   * Carrega todas as dependências em sequência
   * @param {Function} onComplete - Callback chamado quando todas as dependências são carregadas
   * @param {Function} onError - Callback chamado em caso de erro
   */
  function loadDependencies(onComplete, onError) {
    let loadedCount = 0;
    const totalDependencies = DEPENDENCIES.length;

    const loadNextDependency = (index) => {
      if (index >= DEPENDENCIES.length) {
        console.log('[FastTransfer] Todas as dependências carregadas com sucesso');
        if (onComplete) onComplete();
        return;
      }

      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(DEPENDENCIES[index]);
      
      script.onload = () => {
        loadedCount++;
        console.log(`[FastTransfer] Dependência ${index + 1}/${totalDependencies} carregada: ${DEPENDENCIES[index]}`);
        loadNextDependency(index + 1);
      };
      
      script.onerror = () => {
        console.error(`[FastTransfer] Erro ao carregar dependência: ${DEPENDENCIES[index]}`);
        if (onError) onError(new Error(`Falha ao carregar: ${DEPENDENCIES[index]}`));
        loadNextDependency(index + 1); // Continua mesmo com erro
      };
      
      document.head.appendChild(script);
    };

    loadNextDependency(0);
  }

  // Verifica se o script já foi injetado
  if (window.__opaFastTransferInjected) {
    console.log('[FastTransfer] Script já foi injetado, ignorando.');
    return;
  }

  // Verifica se a funcionalidade está habilitada
  chrome.storage.sync.get({ fastTransferEnabled: true }, (settings) => {
    if (!settings.fastTransferEnabled) {
      console.log('[FastTransfer] Funcionalidade desabilitada nas configurações.');
      return;
    }

    // Carrega todas as dependências
    loadDependencies(
      () => {
        console.log('[FastTransfer] Sistema FastTransfer inicializado com sucesso');
        // Marca como injetado
        window.__opaFastTransferInjected = true;
      },
      (error) => {
        console.error('[FastTransfer] Erro ao carregar dependências:', error);
        // Marca como injetado mesmo com erro para evitar tentativas repetidas
        window.__opaFastTransferInjected = true;
      }
    );
  });

  // Escuta mudanças nas configurações
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsChanged' && message.fastTransferEnabled !== undefined) {
      console.log('[FastTransfer] Configurações alteradas:', message);
      
      if (message.fastTransferEnabled) {
        // Reativar funcionalidade se necessário
        if (!window.__opaFastTransferInjected) {
          loadDependencies(
            () => {
              console.log('[FastTransfer] Módulo reativado com todas as dependências');
              window.__opaFastTransferInjected = true;
            },
            (error) => {
              console.error('[FastTransfer] Erro ao reativar:', error);
              window.__opaFastTransferInjected = true;
            }
          );
        }
      } else {
        // Desativar funcionalidade
        if (window.__cleanupFastTransfer) {
          window.__cleanupFastTransfer();
        }
        window.__opaFastTransferInjected = false;
        console.log('[FastTransfer] Funcionalidade desativada');
      }
    }
  });
})();