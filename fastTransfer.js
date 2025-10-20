(() => {
  console.log('[FastTransfer] Script iniciado.');

  if (window.__opaFastTransferInjected) return;
  window.__opaFastTransferInjected = true;

  // Estado interno
  let observerCleanup = null;
  let isEnabled = true;

  // Mapa de motivos organizados por categoria
  const MOTIVOS_POR_CATEGORIA = {
    'suporte': [
      { id: '672d1577911f877625a59248', text: 'Sem conexão', description: 'Cliente sem acesso à internet' },
      { id: '672d15bfa72e6a3e1fed9358', text: 'Lentidão', description: 'Cliente com conexão lenta' },
      { id: '672d15b1911f877625a5925d', text: 'Renegociação', description: 'Cliente solicita renegociação de plano' },
      { id: '68500fa18659ac8e64dc1c36', text: 'Equipamento danificado', description: 'Equipamento do cliente com defeito' },
      { id: '68271c5a534a14b50fdc8d74', text: 'Troca de Senha', description: 'Cliente precisa alterar senha do WiFi' },
      { id: '68279cd47a748ac1670c20a0', text: 'Liberação 48h', description: 'Cliente solicita liberação temporária' },
      { id: '688dec3acfd5c371592a29b1', text: 'Manutenção programada', description: 'Manutenção programada na região' },
      { id: '687ed3cecfd5c3715916945a', text: 'Manutenção Programada', description: 'Manutenção programada na região' },
      { id: '68e66b632a298ec657a2bd66', text: 'Teste', description: 'Teste de conexão ou equipamento' }
    ],
    'comercial': [
      { id: '672d1584a72e6a3e1fed933f', text: 'Contratar planos', description: 'Cliente interessado em novos planos' },
      { id: '681b7503a9942129afebf5e5', text: 'Troca de plano', description: 'Cliente quer alterar plano atual' },
      { id: '681b72324997a1715379eddb', text: 'Troca de titularidade', description: 'Transferência de titularidade do serviço' },
      { id: '681b724ec5ff55a9687c8f5d', text: 'Troca de vencimento', description: 'Cliente solicita mudança de data de vencimento' },
      { id: '681b7214c5ff55a9687c8f46', text: 'Mudança de endereço', description: 'Cliente mudando de endereço' },
      { id: '6830b5adf95e6720a21084cc', text: 'Venda', description: 'Oportunidade de venda de serviços' },
      { id: '68431c177a748ac16730391d', text: 'Anúncio Instagram', description: 'Cliente veio por anúncio no Instagram' },
      { id: '68f6781bab639fd3ac17eb84', text: 'Campanha Upgrade', description: 'Cliente interessado em upgrade de plano' },
      { id: '68f64579ab639fd3ac17107a', text: 'Promoção Santo Antônio', description: 'Cliente interessado na promoção' }
    ],
    'financeiro': [
      { id: '672d159fa72e6a3e1fed9348', text: 'Boletos em atraso', description: 'Cliente com boletos em aberto' },
      { id: '6827267ef95e6720a2cf0b2a', text: 'Segunda via de boleto', description: 'Cliente solicita segunda via do boleto' },
      { id: '68279cc27a748ac1670c2083', text: 'Envio de Comprovante', description: 'Cliente solicita comprovante de pagamento' },
      { id: '672d1544a72e6a3e1fed931e', text: 'Nota fiscal', description: 'Cliente solicita nota fiscal' },
      { id: '682727ae7a748ac1670ad861', text: 'Desconto na Mensalidade', description: 'Cliente solicita desconto na mensalidade' },
      { id: '684b1f14d2065d75abdd9cbb', text: 'Negociação CTO Cheia', description: 'Cliente negocia CTO cheia' }
    ],
    'agendamento': [
      { id: '6827317cd2065d75abafaff6', text: 'Verificação de Agendamento', description: 'Verificar agendamento existente' },
      { id: '682731a98659ac8e64a7e175', text: 'Inviabilidade', description: 'Cliente informa inviabilidade técnica' }
    ],
    'cancelamento': [
      { id: '682738618659ac8e64a7f7d8', text: 'Cancelamento', description: 'Cliente solicita cancelamento do serviço' },
      { id: '6720d586a72e6a3e1fed86e4', text: 'Cancelar Planos e serviços', description: 'Cliente quer cancelar planos e serviços' }
    ]
  };

  // Cria botão de transferência rápida
  function createFastTransferButton() {
    console.log('[FastTransfer] Iniciando criação do botão...');

    window.__opaUtils.config.get({ fastTransferEnabled: true }).then(settings => {
      console.log('[FastTransfer] Configurações carregadas:', settings);

      if (!settings.fastTransferEnabled) {
        console.log('[FastTransfer] FastTransfer desabilitado nas configurações.');
        removeFastTransferButton();
        if (observerCleanup) observerCleanup();
        isEnabled = false;
        return;
      }

      isEnabled = true;

      // Verificação inicial imediata
      console.log('[FastTransfer] Fazendo verificação inicial...');
      checkForPanels();

      observerCleanup = window.__opaUtils.observer.observe(
        document.body,
        { childList: true, subtree: true },
        () => {
          checkForPanels();
        }
      );

      console.log('[FastTransfer] Observer ativo com módulo utilitário.');
    }).catch(error => {
      console.error('[FastTransfer] Erro ao carregar configurações:', error);
    });
  }

  // Função dedicada para verificar e encontrar painéis
  function checkForPanels() {

    // Tenta diferentes seletores para encontrar painéis de atendimento
    const panelSelectors = [
      'div.dialog_panel[data-id]',
      'div.dialog_panel',
      'div.panel[data-id]',
      'div[class*="panel"][data-id]',
      'div[class*="dialog"][data-id]'
    ];

    const foundPanels = [];
    for (const selector of panelSelectors) {
      const panels = document.querySelectorAll(selector);
      panels.forEach(panel => foundPanels.push(panel));
    }

    for (const panelDiv of foundPanels) {

      // Verifica se já existe botão FastTransfer neste painel
      if (panelDiv.querySelector('button[data-fastTransfer]')) {
        continue;
      }

      // Procura por div .botoes dentro do painel
      const botoesDivs = panelDiv.querySelectorAll('.botoes');

      for (const botoesDiv of botoesDivs) {
        // Verifica se esta div .botoes tem outros botões relevantes (não apenas o nosso)
        const existingButtons = botoesDiv.querySelectorAll('button');
        if (existingButtons.length > 0) {
          createButton(botoesDiv);
          break; // Para no primeiro válido encontrado
        }
      }
    }
  }

  // Cria o botão de transferência
  function createButton(container) {
    const button = document.createElement('button');
    button.setAttribute('data-fastTransfer', 'true');
    button.className = 'fast-transfer-button';
    button.textContent = 'Transferir 🚀';

    // Usa estilos do módulo utilitário
    Object.assign(button.style, {
      width: '90%',
      backgroundColor: '#ffffff',
      color: 'black',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      transition: 'background-color 0.2s ease'
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#f0f0f0';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#ffffff';
    });

    button.addEventListener('click', createTransferWindow);
    container.appendChild(button);
    console.log('[FastTransfer] Botão FastTransfer adicionado ao painel.');
  }

  // Remove botão de transferência
  function removeFastTransferButton() {
    const button = document.querySelector('button[data-fastTransfer]');
    if (button) {
      button.remove();
      console.log('[FastTransfer] Botão FastTransfer removido do DOM.');
    }
  }

  // Cria janela de transferência (modal)
  function createTransferWindow() {
    console.log('[FastTransfer] Criando janela de transferência rápida.');

    // Remove janela existente se houver
    const existingWindow = document.querySelector('.fast-transfer-modal');
    if (existingWindow) {
      existingWindow.remove();
      console.log('[FastTransfer] Janela existente removida antes de criar nova.');
    }

    const modal = document.createElement('div');
    modal.className = 'fast-transfer-modal';

    // Usa estilos do módulo utilitário
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '1000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });

    const windowContent = document.createElement('div');
    windowContent.className = 'estrutura medio ui-draggable';
    Object.assign(windowContent.style, {
      backgroundColor: 'var(--gray-100, #ffffff)',
      borderRadius: '8px',
      width: '500px', // Aumentado para acomodar grid
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    });

    // Cria cabeçalho arrastável
    const header = createDraggableHeader(windowContent);

    // Cria corpo do formulário
    const body = createFormBody();

    windowContent.appendChild(header);
    windowContent.appendChild(body);
    modal.appendChild(windowContent);
    document.body.appendChild(modal);

    // Eventos de teclado e botões
    setupModalEvents(modal, windowContent);

    console.log('[FastTransfer] Janela de transferência criada com sucesso.');
  }

  // Cria cabeçalho arrastável
  function createDraggableHeader(container) {
    const header = document.createElement('div');
    header.className = 'cabecalho ui-draggable-handle';
    Object.assign(header.style, {
      backgroundColor: 'var(--gray-200, #f0f0f0)',
      padding: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'move'
    });

    const headerTitle = document.createElement('div');
    headerTitle.className = 'cabecalho_title';
    headerTitle.textContent = 'Transferência Rápida';
    headerTitle.style.fontWeight = 'bold';
    headerTitle.style.color = 'var(--gray-1000, #333)';

    const headerClose = document.createElement('div');
    headerClose.className = 'cabecalho_fecha';
    headerClose.innerHTML = '<i title="Fechar (Esc)" class="fal fa-times" style="cursor: pointer; font-size: 22px;"></i>';
    headerClose.style.color = 'var(--gray-700, #666)';

    header.appendChild(headerTitle);
    header.appendChild(headerClose);

    // Implementa funcionalidade de arrastar
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      currentX = e.clientX - xOffset;
      currentY = e.clientY - yOffset;
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    });

    function onDrag(e) {
      if (isDragging) {
        xOffset = e.clientX - currentX;
        yOffset = e.clientY - currentY;
        container.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      }
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    }

    return header;
  }

  // Cria corpo do formulário
  function createFormBody() {
    const body = document.createElement('div');
    body.style.padding = '15px';
    body.style.maxHeight = 'calc(90vh - 60px)';
    body.style.overflowY = 'auto';

    const form = document.createElement('form');
    form.method = 'POST';
    form.autocomplete = 'off';
    form.role = 'presentation';
    form.name = 'fast_transfer_form';

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    const label = document.createElement('label');
    label.id = 'label-destino';
    label.textContent = 'Destino da Transferência';
    const select = createSelectElement();

    formGroup.appendChild(label);
    formGroup.appendChild(select);

    const buttonsDiv = createButtons();

    form.appendChild(formGroup);
    form.appendChild(buttonsDiv);
    body.appendChild(form);

    return body;
  }

  // Cria elemento de seleção com categorias e motivos
  function createSelectElement() {
    const container = document.createElement('div');
    container.className = 'fast-transfer-categories';

    // Estado da seleção atual
    let selectedCategory = null;
    let selectedMotivo = null;

    // Cria dropdown de categorias
    const categorySelect = document.createElement('select');
    categorySelect.name = 'categoria';
    categorySelect.id = 'categoria';
    categorySelect.style.width = '100%';
    categorySelect.style.padding = '7px';
    categorySelect.style.border = '1px solid var(--gray-500, #ccc)';
    categorySelect.style.borderRadius = '4px';
    categorySelect.style.marginBottom = '10px';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione uma categoria';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);

    // Adiciona opções de categoria
    const categories = [
      { value: 'suporte', text: 'Suporte Técnico' },
      { value: 'comercial', text: 'Comercial' },
      { value: 'financeiro', text: 'Financeiro' },
      { value: 'agendamento', text: 'Agendamento' },
      { value: 'cancelamento', text: 'Cancelamento' }
    ];

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.value;
      option.textContent = cat.text;
      categorySelect.appendChild(option);
    });

    // Cria container para motivos
    const motivosContainer = document.createElement('div');
    motivosContainer.className = 'motivos-container';
    motivosContainer.style.display = 'none';

    // Adiciona event listener para mudança de categoria
    categorySelect.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      selectedMotivo = null;

      if (selectedCategory) {
        showMotivosForCategory(selectedCategory, motivosContainer);
      } else {
        motivosContainer.style.display = 'none';
      }
    });

    // Inputs ocultos para armazenar seleção final
    const hiddenCategoria = document.createElement('input');
    hiddenCategoria.type = 'hidden';
    hiddenCategoria.name = 'categoria_selecionada';
    hiddenCategoria.id = 'categoria_selecionada';

    const hiddenMotivo = document.createElement('input');
    hiddenMotivo.type = 'hidden';
    hiddenMotivo.name = 'motivo_selecionado';
    hiddenMotivo.id = 'motivo_selecionado';

    container.appendChild(categorySelect);
    container.appendChild(motivosContainer);
    container.appendChild(hiddenCategoria);
    container.appendChild(hiddenMotivo);

    return container;
  }

  // Obtém nome da categoria para exibição
  function getCategoryName(category) {
    const names = {
      'suporte': 'Suporte Técnico',
      'comercial': 'Comercial',
      'financeiro': 'Financeiro',
      'agendamento': 'Agendamento',
      'cancelamento': 'Cancelamento'
    };
    return names[category] || category;
  }

  // Mostra motivos para categoria selecionada
  function showMotivosForCategory(category, container) {
    container.innerHTML = '';
    container.style.display = 'block';

    const motivos = MOTIVOS_POR_CATEGORIA[category] || [];

    if (motivos.length === 0) {
      const noMotivos = document.createElement('p');
      noMotivos.textContent = 'Nenhum motivo disponível para esta categoria.';
      noMotivos.style.color = 'var(--gray-700, #666)';
      noMotivos.style.fontStyle = 'italic';
      container.appendChild(noMotivos);
      return;
    }

    // Cria título da categoria
    const categoryTitle = document.createElement('h4');
    categoryTitle.textContent = `Motivos - ${getCategoryName(category)}`;
    categoryTitle.style.margin = '0 0 10px 0';
    categoryTitle.style.color = 'var(--gray-1000, #333)';
    categoryTitle.style.fontSize = '14px';
    container.appendChild(categoryTitle);

    // Cria grid de botões de motivos
    const motivosGrid = document.createElement('div');
    motivosGrid.className = 'motivos-grid';
    motivosGrid.style.display = 'grid';
    motivosGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    motivosGrid.style.gap = '8px';
    motivosGrid.style.maxHeight = '200px';
    motivosGrid.style.overflowY = 'auto';

    motivos.forEach(motivo => {
      const motivoButton = document.createElement('button');
      motivoButton.type = 'button';
      motivoButton.className = 'motivo-button';
      motivoButton.textContent = motivo.text;
      motivoButton.dataset.motivoId = motivo.id;
      motivoButton.dataset.categoria = category;

      Object.assign(motivoButton.style, {
        backgroundColor: '#3a2fc1',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
        fontFamily: 'sans-serif',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        width: '100%'
      });

      motivoButton.addEventListener('mouseenter', () => {
        motivoButton.style.backgroundColor = '#4a3fd1';
      });

      motivoButton.addEventListener('mouseleave', () => {
        motivoButton.style.backgroundColor = '#3a2fc1';
      });

      motivoButton.addEventListener('click', () => {
        // Remove seleção anterior
        motivosGrid.querySelectorAll('.motivo-button.selected').forEach(btn => {
          btn.classList.remove('selected');
          btn.style.backgroundColor = '#3a2fc1';
        });

        // Seleciona este motivo
        motivoButton.classList.add('selected');
        motivoButton.style.backgroundColor = '#2a1fb1';

        selectedMotivo = motivo.id;

        // Atualiza campos ocultos
        const hiddenCategoria = document.getElementById('categoria_selecionada');
        const hiddenMotivo = document.getElementById('motivo_selecionado');
        if (hiddenCategoria && hiddenMotivo) {
          hiddenCategoria.value = category;
          hiddenMotivo.value = motivo.id;
        }
      });

      motivosGrid.appendChild(motivoButton);
    });

    container.appendChild(motivosGrid);
  }

  // Seleciona motivo automaticamente no painel principal
  function selectMotivoInMainPanel(categoria, motivoId) {
    console.log('[FastTransfer] Selecionando motivo no painel principal:', motivoId);

    // Procura pelo select de motivos no painel
    const selectMotivos = document.querySelector('select[name="select_motivos"]');
    if (!selectMotivos) {
      console.log('[FastTransfer] Select de motivos não encontrado no painel');
      return false;
    }

    // Procura pela opção com o ID do motivo
    const optionToSelect = selectMotivos.querySelector(`option[value="${motivoId}"]`);
    if (!optionToSelect) {
      console.log('[FastTransfer] Motivo não encontrado no select:', motivoId);
      return false;
    }

    // Seleciona a opção
    selectMotivos.value = motivoId;

    // Dispara evento de change para atualizar a interface
    const changeEvent = new Event('change', { bubbles: true });
    selectMotivos.dispatchEvent(changeEvent);

    console.log('[FastTransfer] Motivo selecionado automaticamente no painel');
    return true;
  }

  // Flag para controlar se já existe uma observação sendo processada
  let isProcessingObservation = false;

  // Cria observação automaticamente com descrição do motivo
  function createObservacaoWithMotivo(categoria, motivoId) {
    // Se já estiver processando uma observação, não faz nada
    if (isProcessingObservation) {
      console.log('[FastTransfer] Já existe uma observação sendo processada');
      return Promise.resolve(false);
    }

    // Marca que está processando uma observação
    isProcessingObservation = true;
    return new Promise((resolve) => {
      console.log('[FastTransfer] Iniciando criação de observação com motivo:', motivoId);

      // Função auxiliar para clicar no botão de forma mais confiável
      const clickButton = (button) => {
        try {
          // Tenta disparar o evento de clique nativo
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          button.dispatchEvent(clickEvent);
          
          // Tenta chamar o click() diretamente também
          if (typeof button.click === 'function') {
            button.click();
          }
          
          return true;
        } catch (error) {
          console.error('[FastTransfer] Erro ao clicar no botão:', error);
          return false;
        }
      };

      // Tenta encontrar o botão "Nova observação" de várias maneiras
      const findObsButton = () => {
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
      };

      // Encontra o botão "Nova observação"
      const novaObsButton = findObsButton();
      if (!novaObsButton) {
        console.warn('[FastTransfer] Botão Nova observação não encontrado');
        // Tenta uma busca mais abrangente após um pequeno delay
        setTimeout(() => {
          const retryButton = findObsButton();
          if (retryButton) {
            console.log('[FastTransfer] Botão encontrado na segunda tentativa');
            handleButtonClick(retryButton);
          } else {
            console.warn('[FastTransfer] Botão Nova observação não encontrado após tentativas');
            resolve(false);
          }
        }, 500);
        return;
      }

      // Função para lidar com o clique no botão
      const handleButtonClick = (button) => {
        // Armazena o estado original do botão
        const originalButtonText = button.textContent;
        button.textContent = 'Abrindo...';
        button.disabled = true;

        console.log('[FastTransfer] Clicando no botão Nova observação:', button);
        
        // Tenta clicar no botão de forma mais confiável
        const clickSuccess = clickButton(button);
        
        if (!clickSuccess) {
          console.warn('[FastTransfer] Falha ao clicar no botão');
          button.textContent = originalButtonText;
          button.disabled = false;
          resolve(false);
          return;
        }
        
        console.log('[FastTransfer] Botão Nova observação clicado com sucesso');
        startObservingForModal(button, originalButtonText);
      };

      // Função para observar a abertura do modal
      const startObservingForModal = (button, originalButtonText) => {
        console.log('[FastTransfer] Iniciando observação do modal...');
        
        // Variáveis para controle de tentativas e timeout
        let attempts = 0;
        const maxAttempts = 10; // Aumentado para mais tentativas
        const checkInterval = 500; // 500ms entre tentativas
        const timeout = 10000; // Timeout total de 10 segundos

        const startTime = Date.now();
        const checkModal = setInterval(() => {
          attempts++;
          
          // Verifica se excedeu o tempo máximo
          if (Date.now() - startTime > timeout) {
            console.warn('[FastTransfer] Timeout ao aguardar abertura do modal de observação');
            clearInterval(checkModal);
            button.textContent = originalButtonText;
            button.disabled = false;
            resolve(false);
            return;
          }

          console.log(`[FastTransfer] Tentativa ${attempts} de localizar o modal...`);
          
          // Tenta encontrar o textarea da mensagem de várias maneiras
          let textarea = document.querySelector('form[name="new_atendimentoObservacao"] textarea[name="mensagem"]');
          
          // Se não encontrou, tenta encontrar o modal primeiro
          if (!textarea) {
            const modal = document.querySelector('.modal.in, .modal.show, [role="dialog"][aria-hidden="false"]');
            if (modal) {
              console.log('[FastTransfer] Modal encontrado, procurando textarea...');
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

          if (!textarea) {
            if (attempts >= maxAttempts) {
              console.warn(`[FastTransfer] Textarea de mensagem não encontrado após ${attempts} tentativas`);
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
          
          // Encontra a descrição do motivo selecionado
          const motivo = findMotivoById(motivoId);
          if (!motivo || !motivo.description) {
            console.warn('[FastTransfer] Descrição do motivo não encontrada');
            resolve(false);
            return;
          }

          console.log('[FastTransfer] Inserindo descrição no textarea...');
          
          // Insere a descrição no textarea
          textarea.value = motivo.description;
          textarea.focus();

          // Dispara evento de input para atualizar contador
          const inputEvent = new Event('input', { bubbles: true });
          textarea.dispatchEvent(inputEvent);
          
          // Dispara evento de change também, para garantir
          const changeEvent = new Event('change', { bubbles: true });
          textarea.dispatchEvent(changeEvent);

          console.log('[FastTransfer] Descrição inserida no textarea:', motivo.description);

          // Tenta encontrar o botão Salvar
          const findSaveButton = () => {
            console.log('[FastTransfer] Procurando botão Salvar...');
            
            // Tenta encontrar o botão de várias maneiras
            let salvarButton = document.querySelector('form[name="new_atendimentoObservacao"] button#salvar');
            
            if (!salvarButton) {
              // Tenta encontrar por texto
              const buttons = Array.from(document.querySelectorAll('button'));
              salvarButton = buttons.find(btn => 
                btn.textContent.trim().toLowerCase().includes('salvar') && 
                !btn.disabled &&
                btn.offsetParent !== null // Verifica se o botão está visível
              );
            }
            
            if (salvarButton) {
              console.log('[FastTransfer] Botão Salvar encontrado:', salvarButton);
              
              // Verifica se o botão não está desabilitado
              if (!salvarButton.disabled) {
                console.log('[FastTransfer] Clicando no botão Salvar...');
                
                // Tenta clicar de forma confiável
                const clickSuccess = clickButton(salvarButton);
                
                if (clickSuccess) {
                  console.log('[FastTransfer] Botão Salvar clicado automaticamente');
                  // Aguarda um pouco para garantir que a observação foi salva
                  setTimeout(async () => {
                    // Após salvar a observação, inicia o processo de transferência
                    if (categoria) {
                      console.log('[FastTransfer] Iniciando processo de transferência...');
                      await handleTransferAfterObservation(categoria);
                    }
                    resolve(true);
                  }, 1000);
                } else {
                  console.warn('[FastTransfer] Falha ao clicar no botão Salvar');
                  resolve(false);
                }
              } else {
                console.log('[FastTransfer] Botão Salvar está desabilitado, aguardando...');
                // Se o botão estiver desabilitado, tenta novamente após um curto período
                if (attempts < maxAttempts * 2) {
                  attempts++;
                  setTimeout(findSaveButton, 200);
                } else {
                  console.warn('[FastTransfer] Botão Salvar permanece desabilitado após várias tentativas');
                  resolve(false);
                }
              }
            } else if (attempts < maxAttempts * 2) {
              // Se não encontrou o botão, tenta novamente
              console.log('[FastTransfer] Botão Salvar não encontrado, tentando novamente...');
              attempts++;
              setTimeout(findSaveButton, 200);
            } else {
              console.warn('[FastTransfer] Botão Salvar não encontrado após várias tentativas');
              resolve(false);
            }
          };

          // Inicia a tentativa de encontrar e clicar no botão Salvar
          console.log('[FastTransfer] Iniciando busca pelo botão Salvar...');
          setTimeout(findSaveButton, 300);
          
        }, checkInterval);
      };

      // Inicia o processo clicando no botão
      handleButtonClick(novaObsButton);
    });
    
    // Adiciona um manipulador para limpar a flag quando o modal for fechado
    const checkModalClosed = setInterval(() => {
      const modal = document.querySelector('form[name="new_atendimentoObservacao"]');
      if (!modal) {
        console.log('[FastTransfer] Modal de observação fechado, resetando flag');
        isProcessingObservation = false;
        clearInterval(checkModalClosed);
      }
    }, 500);
    
    // Limpa o intervalo após 30 segundos para evitar vazamento de memória
    setTimeout(() => {
      clearInterval(checkModalClosed);
      isProcessingObservation = false;
    }, 30000);
  }

  // Mapeamento de categorias para departamentos
  const CATEGORIA_PARA_DEPARTAMENTO = {
    'suporte': '5bf73d1d186f7d2b0d647a61', // Suporte Técnico
    'comercial': '5bf73d1d186f7d2b0d647a60', // Comercial
    'financeiro': '5d1624085e74a002308aa25e', // Financeiro
    'agendamento': '5d1623f35e74a002308aa25d', // Agendamentos
    'cancelamento': '5d1629315e74a002308aa262' // Cancelamento
  };

  // Função para lidar com a transferência após a observação ser criada
  async function handleTransferAfterObservation(categoria) {
    // Adiciona um pequeno atraso para garantir que a observação foi salva
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verifica se o botão de transferir ainda está na página
    const transferButton = document.querySelector('button[data-id="68f659a76bf611ed15c68d0e"]');
    if (!transferButton) {
      console.log('[FastTransfer] Botão Transferir não encontrado, pulando transferência automática');
      return false;
    }
    console.log('[FastTransfer] Iniciando processo de transferência para categoria:', categoria);


    // Armazena o texto original do botão
    const originalButtonText = transferButton.textContent;
    transferButton.textContent = 'Processando...';
    transferButton.disabled = true;

    try {
      // Clica no botão Transferir
      console.log('[FastTransfer] Clicando no botão Transferir...');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      transferButton.dispatchEvent(clickEvent);
      
      if (typeof transferButton.click === 'function') {
        transferButton.click();
      }
      
      console.log('[FastTransfer] Aguardando abertura do modal de transferência...');
      
      // Aguarda o modal de transferência abrir - usando uma abordagem mais abrangente
      const modalAberto = await waitForElement('.estrutura.minimo .cabecalho_title:contains("Transferir atendimento")', 10000, true);
      
      if (!modalAberto) {
        console.warn('[FastTransfer] Modal de transferência não foi aberto');
        return false;
      }
      
      console.log('[FastTransfer] Modal de transferência aberto');
      
      // Obtém o ID do departamento com base na categoria
      const departamentoId = CATEGORIA_PARA_DEPARTAMENTO[categoria];
      if (!departamentoId) {
        console.warn('[FastTransfer] Departamento não encontrado para a categoria:', categoria);
        return false;
      }
      
      // Aguarda um pouco para garantir que o Select2 foi inicializado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Encontra o select de departamento
      const selectDepartamento = document.querySelector('select[name="departamento"]');
      if (!selectDepartamento) {
        console.warn('[FastTransfer] Select de departamento não encontrado');
        return false;
      }
      
      console.log('[FastTransfer] Selecionando departamento:', categoria);
      
      // Tenta encontrar a instância do Select2
      const select2Instance = $(selectDepartamento).data('select2');
      
      if (select2Instance) {
        // Usa a API do Select2 se disponível
        console.log('[FastTransfer] Usando API do Select2 para selecionar o departamento');
        $(selectDepartamento).val(departamentoId).trigger('change.select2');
      } else {
        // Se não encontrar o Select2, tenta a abordagem padrão
        console.log('[FastTransfer] Select2 não encontrado, usando método alternativo');
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
      
      console.log('[FastTransfer] Departamento selecionado com sucesso:', categoria);
      
      // Aguarda um pouco para o select2 atualizar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Foca no select de usuários para facilitar a seleção manual
      const selectUsuario = document.querySelector('select[name="usuario"]');
      if (selectUsuario) {
        selectUsuario.focus();
      }
      
      return true;
    } catch (error) {
      console.error('[FastTransfer] Erro durante o processo de transferência:', error);
      return false;
    } finally {
      // Restaura o botão
      transferButton.textContent = originalButtonText;
      transferButton.disabled = false;
    }
  }
  
  // Função auxiliar para aguardar um elemento aparecer no DOM
  function waitForElement(selector, timeout = 5000, byText = false) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkForElement = () => {
        let element;
        
        if (byText) {
          // Busca por texto usando jQuery se disponível
          if (typeof $ !== 'undefined') {
            element = $(`${selector}:visible`)[0];
          } else {
            // Fallback para busca nativa se jQuery não estiver disponível
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
              if (el.textContent && el.textContent.includes(selector.replace(':contains("', '').replace('")', ''))) {
                element = el;
                break;
              }
            }
          }
        } else {
          // Busca por seletor CSS padrão
          element = document.querySelector(selector);
        }
        
        if (element && getComputedStyle(element).display !== 'none') {
          resolve(element);
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          console.warn(`[FastTransfer] Timeout ao aguardar elemento: ${selector}`);
          resolve(null);
          return;
        }
        
        setTimeout(checkForElement, 100);
      };
      
      checkForElement();
    });
  }

  // Encontra motivo pelo ID
  function findMotivoById(motivoId) {
    for (const categoria in MOTIVOS_POR_CATEGORIA) {
      const motivos = MOTIVOS_POR_CATEGORIA[categoria];
      const motivo = motivos.find(m => m.id === motivoId);
      if (motivo) return motivo;
    }
    return null;
  }

  // Cria botões de ação
  function createButtons() {
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'botoes';
    buttonsDiv.style.display = 'flex';
    buttonsDiv.style.gap = '10px';
    buttonsDiv.style.marginTop = '15px';

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.id = 'salvar';
    saveButton.textContent = 'Transferir';
    Object.assign(saveButton.style, {
      backgroundColor: '#3a2fc1',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    });

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancelar';
    Object.assign(cancelButton.style, {
      backgroundColor: 'var(--gray-400, #ccc)',
      color: 'var(--gray-1000, #333)',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer'
    });

    buttonsDiv.appendChild(saveButton);
    buttonsDiv.appendChild(cancelButton);

    return buttonsDiv;
  }

  // Configura eventos do modal
  function setupModalEvents(modal, windowContent) {
    // Botão de fechar
    const headerClose = modal.querySelector('.cabecalho_fecha');
    if (headerClose) {
      headerClose.addEventListener('click', () => {
        modal.remove();
        console.log('[FastTransfer] Janela de transferência fechada.');
      });
    }

    // Tecla Esc - apenas fecha o modal
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
      }
    };
    
    // Adiciona o listener de teclado
    document.addEventListener('keydown', escapeHandler);
    
    // Configura o botão de salvar
    const saveButton = modal.querySelector('button[type="submit"]');
    if (saveButton) {
      // Remove event listeners antigos para evitar duplicação
      const newSaveButton = saveButton.cloneNode(true);
      saveButton.parentNode.replaceChild(newSaveButton, saveButton);
      
      newSaveButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Verifica se já está processando
        if (newSaveButton.getAttribute('data-processing') === 'true') {
          console.log('[FastTransfer] Transferência já em andamento, ignorando clique duplo');
          return;
        }
        
        // Marca como processando
        newSaveButton.setAttribute('data-processing', 'true');
        newSaveButton.disabled = true;
        newSaveButton.textContent = 'Processando...';
        
        try {
          // Get the selected category and reason from the hidden inputs
          const hiddenCategoria = document.getElementById('categoria_selecionada');
          const hiddenMotivo = document.getElementById('motivo_selecionado');
          
          if (!hiddenCategoria?.value || !hiddenMotivo?.value) {
            // If no hidden inputs, try to get from selected buttons
            const selectedMotivo = modal.querySelector('.motivo-button.selected');
            if (!selectedMotivo) {
              alert('Por favor, selecione uma categoria e um motivo para a transferência.');
              return;
            }
            
            const categoria = selectedMotivo.dataset.categoria;
            const motivo = selectedMotivo.dataset.motivoId;
            
            // Update hidden inputs if they exist
            if (hiddenCategoria) hiddenCategoria.value = categoria;
            if (hiddenMotivo) hiddenMotivo.value = motivo;
          } else {
            const categoria = hiddenCategoria.value;
            const motivo = hiddenMotivo.value;
          }
          
          console.log('[FastTransfer] Categoria selecionada:', categoria);
          console.log('[FastTransfer] Motivo selecionado:', motivo);
          
          console.log('[FastTransfer] Iniciando processo de transferência...');
          
          // Cria observação automaticamente com a descrição do motivo
          const observacaoCriada = await createObservacaoWithMotivo(categoria, motivo);
          
          if (observacaoCriada) {
            console.log('[FastTransfer] Observação criada com sucesso, iniciando transferência...');
            
            // Envia a solicitação de transferência
            console.log('[FastTransfer] Enviando solicitação de transferência...');
            await window.__opaUtils.messageBus.broadcastToTabs(
              'https://atendimento.fibranetbrasil.com.br/*',
              {
                type: 'transferRequest',
                categoria: categoria,
                motivo: motivo
              }
            );
            
            console.log('[FastTransfer] Transferência solicitada com sucesso.');
            modal.remove();
          } else {
            throw new Error('Falha ao criar observação');
          }
          
        } catch (error) {
          console.error('[FastTransfer] Erro durante o processo de transferência:', error);
          alert('Ocorreu um erro ao processar a transferência. Por favor, tente novamente.');
        } finally {
          // Restaura o botão
          newSaveButton.disabled = false;
          newSaveButton.textContent = 'Transferir';
          newSaveButton.setAttribute('data-processing', 'false');
        }
      });
    }

    // Remove listener de teclado quando modal for fechado
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
      document.removeEventListener('keydown', escapeHandler);
      return originalRemove();
    };
  }

  // Configura listener para mudanças de configuração
  window.__opaUtils.config.onChange((changes) => {
    if (changes.fastTransferEnabled !== undefined) {
      console.log('[FastTransfer] Configurações alteradas:', changes);
      if (changes.fastTransferEnabled) {
        createFastTransferButton();
      } else {
        removeFastTransferButton();
        if (observerCleanup) observerCleanup();
        isEnabled = false;
      }
    }
  });

  // Função de emergência para forçar criação do botão
  window.__forceCreateFastTransferButton = () => {
    console.log('[FastTransfer] ========== FORÇANDO CRIAÇÃO ==========');
    checkForPanels();
    return true;
  };

  // Adiciona estilos CSS para o sistema de categorias e motivos
  window.__opaUtils.dom.addStyles(`
    .fast-transfer-categories {
      margin-bottom: 15px;
    }

    .fast-transfer-categories select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--gray-500, #ccc);
      border-radius: 4px;
      font-family: sans-serif;
      font-size: 14px;
    }

    .motivos-container {
      margin-top: 10px;
    }

    .motivos-container h4 {
      margin: 0 0 10px 0;
      color: var(--gray-1000, #333);
      font-size: 14px;
      font-weight: bold;
    }

    .motivos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 5px;
      border: 1px solid var(--gray-300, #ddd);
      border-radius: 4px;
      background-color: #2a2f3c;
    }

    .motivo-button {
      background-color: #3a2fc1;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-family: sans-serif;
      text-align: left;
      transition: all 0.2s ease;
      width: 100%;
    }

    .motivo-button:hover {
      background-color: #4a3fd1;
    }

    .motivo-button.selected {
      background-color: #2a1fb1;
    }
  `);

  // Inicializa
  createFastTransferButton();
})();