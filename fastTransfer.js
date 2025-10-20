(() => {
  console.log('[FastTransfer] Script carregado.');

  if (window.__opaFastTransferInjected) return;
  window.__opaFastTransferInjected = true;

  let observer;

  function createFastTransferButton() {
    chrome.storage.sync.get({ fastTransferEnabled: true }, (settings) => {
      if (!settings.fastTransferEnabled) {
        console.log('[FastTransfer] FastTransfer desabilitado nas configurações.');
        removeFastTransferButton();
        if (observer) observer.disconnect();
        return;
      }

      observer = new MutationObserver(() => {
        const div = document.querySelector('div.dialog_panel[data-id]');
        if (!div || div.querySelector('button[data-fastTransfer]')) return;

        const botoesDiv = div.querySelector('.botoes');
        if (!botoesDiv) {
          console.log('[FastTransfer] Div .botoes não encontrada no painel.');
          return;
        }

        const button = document.createElement('button');
        button.setAttribute('data-fastTransfer', 'true');
        Object.assign(button.style, {
          width: '90%',
          backgroundColor: '#ffffff',
          color: 'black',
          border: 'none',
          padding: '10px',
          cursor: 'pointer',
          borderRadius: '4px',
          fontFamily: 'sans-serif',
          fontSize: '14px'
        });
        button.textContent = 'Transferir 🚀';

        button.addEventListener('click', createTransferWindow);
        botoesDiv.appendChild(button);
        console.log('[FastTransfer] Botão FastTransfer adicionado ao painel.');
      });

      observer.observe(document.body, { childList: true, subtree: true });
      console.log('[FastTransfer] Observer ativo para detectar painel.');
    });
  }

  function removeFastTransferButton() {
    const button = document.querySelector('button[data-fastTransfer]');
    if (button) {
      button.remove();
      console.log('[FastTransfer] Botão FastTransfer removido do DOM.');
    }
  }
  
  function createTransferWindow() {
    console.log('[FastTransfer] Criando janela de transferência rápida.');

    const existingWindow = document.querySelector('.fast-transfer-modal');
    if (existingWindow) {
      existingWindow.remove();
      console.log('[FastTransfer] Janela existente removida antes de criar nova.');
    }

    const modal = document.createElement('div');
    modal.className = 'fast-transfer-modal';
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
      width: '400px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    });

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
    headerTitle.style.color = 'white';

    const headerClose = document.createElement('div');
    headerClose.className = 'cabecalho_fecha';
    headerClose.innerHTML = '<i title="Fechar (Esc)" class="fal fa-times" style="cursor: pointer; font-size: 22px;"></i>';
    headerClose.style.color = 'white';

    header.appendChild(headerTitle);
    header.appendChild(headerClose);

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
    const select = document.createElement('select');
    select.name = 'destino';
    select.id = 'destino';
    select.style.width = '100%';
    select.style.padding = '7px';
    select.style.border = '1px solid var(--gray-500, #ccc)';
    select.style.borderRadius = '4px';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um destino';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    const options = [
      { value: 'suporte', text: 'Suporte Técnico' },
      { value: 'financeiro', text: 'Financeiro' },
      { value: 'comercial', text: 'Comercial' }
    ];
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      select.appendChild(option);
    });

    formGroup.appendChild(label);
    formGroup.appendChild(select);

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
      backgroundColor: '#3499eb',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer'
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
    form.appendChild(formGroup);
    form.appendChild(buttonsDiv);
    body.appendChild(form);
    windowContent.appendChild(header);
    windowContent.appendChild(body);
    modal.appendChild(windowContent);
    document.body.appendChild(modal);

    let isDragging = false;
    let currentX;
    let currentY;
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
        windowContent.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      }
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    }

    headerClose.addEventListener('click', () => {
      modal.remove();
      console.log('[FastTransfer] Janela de transferência fechada.');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        console.log('[FastTransfer] Janela fechada com tecla Esc.');
      }
    });

    cancelButton.addEventListener('click', () => {
      modal.remove();
      console.log('[FastTransfer] Transferência cancelada.');
    });

    saveButton.addEventListener('click', () => {
      const destino = select.value;
      if (!destino) {
        alert('Por favor, selecione um destino para a transferência.');
        return;
      }
      console.log('[FastTransfer] Transferindo para:', destino);
      chrome.runtime.sendMessage({
        type: 'transferRequest',
        destino: destino
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[FastTransfer] Erro ao enviar transferência:', chrome.runtime.lastError.message);
        } else {
          console.log('[FastTransfer] Transferência solicitada:', response);
          modal.remove();
        }
      });
    });

    console.log('[FastTransfer] Janela de transferência criada com sucesso.');
  }

  createFastTransferButton();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsChanged' && message.fastTransferEnabled !== undefined) {
      console.log('[FastTransfer] Configurações alteradas:', message);
      if (message.fastTransferEnabled) {
        createFastTransferButton();
      } else {
        removeFastTransferButton();
        if (observer) observer.disconnect();
      }
    }
  });
})();