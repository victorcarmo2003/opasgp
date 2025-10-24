// Serviço responsável pela criação automática de observações
class ObservationService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.isProcessingObservation = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('transferRequested', (data) => this.createObservationWithMotivo(data.categoria, data.motivo));
  }

  async createObservationWithMotivo(categoria, motivoId) {
    // Se já estiver processando uma observação, não faz nada
    if (this.isProcessingObservation) {
      console.log('[ObservationService] Já existe uma observação sendo processada');
      return Promise.resolve(false);
    }

    // Marca que está processando uma observação
    this.isProcessingObservation = true;
    
    return new Promise((resolve) => {
      console.log('[ObservationService] Iniciando criação de observação com motivo:', motivoId);

      // Encontra o botão "Nova observação"
      const novaObsButton = this.findObservationButton();
      if (!novaObsButton) {
        console.warn('[ObservationService] Botão Nova observação não encontrado');
        this.handleRetry(resolve);
        return;
      }

      this.handleButtonClick(novaObsButton, resolve, categoria, motivoId);
    });
  }

  findObservationButton() {
    // Tenta encontrar por classe e atributo
    let button = document.querySelector('button.observacao-btn-nova[data-message-templates-listener="true"]');
    
    // Se não encontrou, tenta apenas pela classe
    if (!button) {
      button = document.querySelector('button.observacao-btn-nova');
    }
    
    // Se ainda não encontrou, tenta pelo texto do botão
    if (!button) {
      const buttons = Array.from(document.querySelectorAll('button'));
      button = buttons.find(btn => 
        btn.textContent.trim().toLowerCase().includes('nova observação') || 
        btn.textContent.trim().toLowerCase().includes('nova observacao')
      );
    }
    
    return button;
  }

  handleRetry(resolve) {
    // Tenta uma busca mais abrangente após um pequeno delay
    setTimeout(() => {
      const retryButton = this.findObservationButton();
      if (retryButton) {
        console.log('[ObservationService] Botão encontrado na segunda tentativa');
        this.handleButtonClick(retryButton, resolve);
      } else {
        console.warn('[ObservationService] Botão Nova observação não encontrado após tentativas');
        resolve(false);
      }
    }, 500);
  }

  handleButtonClick(button, resolve, categoria = null, motivoId = null) {
    // Armazena o estado original do botão
    const originalButtonText = button.textContent;
    button.textContent = 'Abrindo...';
    button.disabled = true;

    console.log('[ObservationService] Clicando no botão Nova observação:', button);
    
    // Tenta clicar no botão de forma mais confiável
    const clickSuccess = window.FastTransferDOMUtils.clickButton(button);
    
    if (!clickSuccess) {
      console.warn('[ObservationService] Falha ao clicar no botão');
      button.textContent = originalButtonText;
      button.disabled = false;
      resolve(false);
      return;
    }
    
    console.log('[ObservationService] Botão Nova observação clicado com sucesso');
    this.startObservingForModal(button, originalButtonText, resolve, categoria, motivoId);
  }

  startObservingForModal(button, originalButtonText, resolve, categoria, motivoId) {
    console.log('[ObservationService] Iniciando observação do modal...');
    
    const config = window.FastTransferConfig.TIMING;
    let attempts = 0;
    const startTime = Date.now();

    const checkModal = setInterval(() => {
      attempts++;
      
      // Verifica se excedeu o tempo máximo
      if (Date.now() - startTime > config.TIMEOUT) {
        console.warn('[ObservationService] Timeout ao aguardar abertura do modal de observação');
        clearInterval(checkModal);
        button.textContent = originalButtonText;
        button.disabled = false;
        resolve(false);
        return;
      }

      console.log(`[ObservationService] Tentativa ${attempts} de localizar o modal...`);
      
      // Tenta encontrar o textarea da mensagem
      const textarea = this.findObservationTextarea();

      if (!textarea) {
        if (attempts >= config.MAX_ATTEMPTS) {
          console.warn(`[ObservationService] Textarea de mensagem não encontrado após ${attempts} tentativas`);
          clearInterval(checkModal);
          button.textContent = originalButtonText;
          button.disabled = false;
          resolve(false);
        }
        return; // Tenta novamente no próximo intervalo
      }

      // Textarea encontrado, para de verificar
      clearInterval(checkModal);
      button.textContent = originalButtonText;
      button.disabled = false;
      
      this.handleTextareaFound(textarea, motivoId, categoria, resolve);
      
    }, config.CHECK_INTERVAL);
  }

  findObservationTextarea() {
    // Tenta encontrar o textarea da mensagem de várias maneiras
    let textarea = document.querySelector(window.FastTransferConfig.SELECTORS.OBSERVATION_TEXTAREA);
    
    // Se não encontrou, tenta encontrar o modal primeiro
    if (!textarea) {
      const modal = document.querySelector('.modal.in, .modal.show, [role="dialog"][aria-hidden="false"]');
      if (modal) {
        console.log('[ObservationService] Modal encontrado, procurando textarea...');
        textarea = modal.querySelector('textarea');
      }
    }
    
    // Se ainda não encontrou, tenta encontrar qualquer textarea em um modal
    if (!textarea) {
      const modals = document.querySelectorAll('.modal, [role="dialog"]');
      for (const modal of modals) {
        textarea = modal.querySelector('textarea');
        if (textarea) break;
      }
    }

    return textarea;
  }

  handleTextareaFound(textarea, motivoId, categoria, resolve) {
    // Encontra a descrição do motivo selecionado
    const motivo = this.findMotivoById(motivoId);
    if (!motivo || !motivo.description) {
      console.warn('[ObservationService] Descrição do motivo não encontrada');
      resolve(false);
      return;
    }

    console.log('[ObservationService] Inserindo descrição no textarea...');
    
    // Insere a descrição no textarea
    textarea.value = motivo.description;
    textarea.focus();

    // Dispara eventos para atualizar contador
    const inputEvent = new Event('input', { bubbles: true });
    textarea.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    textarea.dispatchEvent(changeEvent);

    console.log('[ObservationService] Descrição inserida no textarea:', motivo.description);

    // Tenta encontrar e clicar no botão Salvar
    this.findAndClickSaveButton(categoria, resolve);
  }

  findAndClickSaveButton(categoria, resolve) {
    console.log('[ObservationService] Procurando botão Salvar...');
    
    // Tenta encontrar o botão de várias maneiras
    let salvarButton = document.querySelector('form[name="new_atendimentoObservacao"] button#salvar');
    
    if (!salvarButton) {
      // Tenta encontrar por texto
      const buttons = Array.from(document.querySelectorAll('button'));
      salvarButton = buttons.find(btn => 
        btn.textContent.trim().toLowerCase().includes('salvar') && 
        !btn.disabled &&
        window.FastTransferDOMUtils.isVisible(btn)
      );
    }
    
    if (salvarButton) {
      console.log('[ObservationService] Botão Salvar encontrado:', salvarButton);
      
      // Verifica se o botão não está desabilitado
      if (!salvarButton.disabled) {
        console.log('[ObservationService] Clicando no botão Salvar...');
        
        // Tenta clicar de forma confiável
        const clickSuccess = window.FastTransferDOMUtils.clickButton(salvarButton);
        
        if (clickSuccess) {
          console.log('[ObservationService] Botão Salvar clicado automaticamente');
          // Aguarda um pouco para garantir que a observação foi salva
          setTimeout(async () => {
            // Após salvar a observação, inicia o processo de transferência
            if (categoria) {
              console.log('[ObservationService] Iniciando processo de transferência...');
              this.eventBus.emit('observationCreated', { categoria });
            }
            resolve(true);
          }, window.FastTransferConfig.TIMING.OBSERVATION_DELAY);
        } else {
          console.warn('[ObservationService] Falha ao clicar no botão Salvar');
          resolve(false);
        }
      } else {
        console.log('[ObservationService] Botão Salvar está desabilitado, aguardando...');
        // Se o botão estiver desabilitado, tenta novamente após um curto período
        setTimeout(() => this.findAndClickSaveButton(categoria, resolve), 200);
      }
    } else {
      console.warn('[ObservationService] Botão Salvar não encontrado');
      resolve(false);
    }
  }

  findMotivoById(motivoId) {
    for (const categoria in window.FastTransferData.MOTIVOS_POR_CATEGORIA) {
      const motivos = window.FastTransferData.MOTIVOS_POR_CATEGORIA[categoria];
      const motivo = motivos.find(m => m.id === motivoId);
      if (motivo) return motivo;
    }
    return null;
  }

  // Limpa a flag quando o modal for fechado
  setupModalCleanup() {
    const checkModalClosed = setInterval(() => {
      const modal = document.querySelector(window.FastTransferConfig.SELECTORS.OBSERVATION_FORM);
      if (!modal) {
        console.log('[ObservationService] Modal de observação fechado, resetando flag');
        this.isProcessingObservation = false;
        clearInterval(checkModalClosed);
      }
    }, 500);
    
    // Limpa o intervalo após 30 segundos para evitar vazamento de memória
    setTimeout(() => {
      clearInterval(checkModalClosed);
      this.isProcessingObservation = false;
    }, 30000);
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferObservationService = ObservationService;
}
