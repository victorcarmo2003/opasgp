// Serviço responsável pela transferência automática
class TransferService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('observationCreated', (data) => this.handleTransferAfterObservation(data.categoria));
  }

  async handleTransferAfterObservation(categoria) {
    // Adiciona um pequeno atraso para garantir que a observação foi salva
    await new Promise(resolve => setTimeout(resolve, window.FastTransferConfig.TIMING.OBSERVATION_DELAY));
    
    // Verifica se o botão de transferir ainda está na página
    const transferButton = document.querySelector(window.FastTransferConfig.SELECTORS.TRANSFER_BUTTON);
    if (!transferButton) {
      console.log('[TransferService] Botão Transferir não encontrado, pulando transferência automática');
      return false;
    }
    
    console.log('[TransferService] Iniciando processo de transferência para categoria:', categoria);

    // Armazena o texto original do botão
    const originalButtonText = transferButton.textContent;
    transferButton.textContent = 'Processando...';
    transferButton.disabled = true;

    try {
      // Clica no botão Transferir
      console.log('[TransferService] Clicando no botão Transferir...');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      transferButton.dispatchEvent(clickEvent);
      
      if (typeof transferButton.click === 'function') {
        transferButton.click();
      }
      
      console.log('[TransferService] Aguardando abertura do modal de transferência...');
      
      // Aguarda o modal de transferência abrir
      const modalAberto = await window.FastTransferDOMUtils.waitForElement(
        '.estrutura.minimo .cabecalho_title:contains("Transferir atendimento")', 
        window.FastTransferConfig.TIMING.TIMEOUT, 
        true
      );
      
      if (!modalAberto) {
        console.warn('[TransferService] Modal de transferência não foi aberto');
        return false;
      }
      
      console.log('[TransferService] Modal de transferência aberto');
      
      // Seleciona o departamento automaticamente
      const success = await this.selectDepartamento(categoria);
      
      if (success) {
        console.log('[TransferService] Departamento selecionado com sucesso:', categoria);
        
        // Foca no select de usuários para facilitar a seleção manual
        const selectUsuario = document.querySelector(window.FastTransferConfig.SELECTORS.USUARIO_SELECT);
        if (selectUsuario) {
          selectUsuario.focus();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[TransferService] Erro durante o processo de transferência:', error);
      return false;
    } finally {
      // Restaura o botão
      transferButton.textContent = originalButtonText;
      transferButton.disabled = false;
    }
  }

  async selectDepartamento(categoria) {
    // Obtém o ID do departamento com base na categoria
    const departamentoId = window.FastTransferData.CATEGORIA_PARA_DEPARTAMENTO[categoria];
    if (!departamentoId) {
      console.warn('[TransferService] Departamento não encontrado para a categoria:', categoria);
      return false;
    }
    
    // Aguarda um pouco para garantir que o Select2 foi inicializado
    await new Promise(resolve => setTimeout(resolve, window.FastTransferConfig.TIMING.SELECT2_DELAY));
    
    // Encontra o select de departamento
    const selectDepartamento = document.querySelector(window.FastTransferConfig.SELECTORS.DEPARTAMENTO_SELECT);
    if (!selectDepartamento) {
      console.warn('[TransferService] Select de departamento não encontrado');
      return false;
    }
    
    console.log('[TransferService] Selecionando departamento:', categoria);
    
    // Tenta encontrar a instância do Select2
    const select2Instance = $(selectDepartamento).data('select2');
    
    if (select2Instance) {
      // Usa a API do Select2 se disponível
      console.log('[TransferService] Usando API do Select2 para selecionar o departamento');
      $(selectDepartamento).val(departamentoId).trigger('change.select2');
    } else {
      // Se não encontrar o Select2, tenta a abordagem padrão
      console.log('[TransferService] Select2 não encontrado, usando método alternativo');
      selectDepartamento.value = departamentoId;
      
      // Dispara os eventos necessários
      const events = ['change', 'input', 'select'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        selectDepartamento.dispatchEvent(event);
      });
      
      // Tenta encontrar e clicar na opção correta do Select2
      const select2Option = document.querySelector(`.select2-results__option[data-select2-id$="-${departamentoId}"]`);
      if (select2Option) {
        select2Option.click();
      }
    }
    
    // Aguarda um pouco para o select2 atualizar
    await new Promise(resolve => setTimeout(resolve, window.FastTransferConfig.TIMING.SELECT2_DELAY));
    
    return true;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferTransferService = TransferService;
}
