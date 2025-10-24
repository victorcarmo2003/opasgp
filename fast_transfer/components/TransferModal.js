// Componente responsável pelo modal de transferência
class TransferModal {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.modal = null;
    this.selectedCategory = null;
    this.selectedMotivo = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('transferButtonClicked', () => this.show());
  }

  show() {
    console.log('[TransferModal] Criando janela de transferência rápida.');

    // Remove modal existente se houver
    this.removeExistingModal();

    this.createModal();
    this.setupModalEvents();
    
    console.log('[TransferModal] Janela de transferência criada com sucesso.');
  }

  removeExistingModal() {
    const existingWindow = document.querySelector('.fast-transfer-modal');
    if (existingWindow) {
      existingWindow.remove();
      console.log('[TransferModal] Janela existente removida antes de criar nova.');
    }
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = window.FastTransferConfig.CSS_CLASSES.MODAL;

    this.applyModalStyles();

    const windowContent = this.createWindowContent();
    this.modal.appendChild(windowContent);
    document.body.appendChild(this.modal);
  }

  applyModalStyles() {
    const styles = `
      .${window.FastTransferConfig.CSS_CLASSES.MODAL} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .${window.FastTransferConfig.CSS_CLASSES.MODAL} .estrutura {
        background-color: var(--gray-100, #ffffff);
        border-radius: 8px;
        width: ${window.FastTransferConfig.UI.MODAL_WIDTH};
        max-height: ${window.FastTransferConfig.UI.MODAL_MAX_HEIGHT};
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      .${window.FastTransferConfig.CSS_CLASSES.MODAL} .cabecalho {
        background-color: var(--gray-200, #f0f0f0);
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
      .${window.FastTransferConfig.CSS_CLASSES.MODAL} .cabecalho_title {
        font-weight: bold;
        color: var(--gray-1000, #333);
      }
      .${window.FastTransferConfig.CSS_CLASSES.MODAL} .cabecalho_fecha {
        color: var(--gray-700, #666);
        cursor: pointer;
      }
      .${window.FastTransferConfig.CSS_CLASSES.MODAL} .cabecalho_fecha i {
        font-size: 22px;
      }
    `;
    
    window.FastTransferDOMUtils.addStyles(styles);
  }

  createWindowContent() {
    const windowContent = document.createElement('div');
    windowContent.className = 'estrutura medio ui-draggable';

    const header = this.createHeader(windowContent);
    const body = this.createBody();

    windowContent.appendChild(header);
    windowContent.appendChild(body);

    return windowContent;
  }

  createHeader(container) {
    const header = document.createElement('div');
    header.className = 'cabecalho ui-draggable-handle';

    const headerTitle = document.createElement('div');
    headerTitle.className = 'cabecalho_title';
    headerTitle.textContent = 'Transferência Rápida';

    const headerClose = document.createElement('div');
    headerClose.className = 'cabecalho_fecha';
    headerClose.innerHTML = '<i title="Fechar (Esc)" class="fal fa-times" style="cursor: pointer; font-size: 22px;"></i>';

    header.appendChild(headerTitle);
    header.appendChild(headerClose);

    // Implementa funcionalidade de arrastar
    this.setupDragging(header, container);

    return header;
  }

  setupDragging(header, container) {
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

    const onDrag = (e) => {
      if (isDragging) {
        xOffset = e.clientX - currentX;
        yOffset = e.clientY - currentY;
        container.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      }
    };

    const stopDrag = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
  }

  createBody() {
    const body = document.createElement('div');
    body.style.padding = '15px';
    body.style.maxHeight = 'calc(90vh - 60px)';
    body.style.overflowY = 'auto';

    const form = document.createElement('form');
    form.method = 'POST';
    form.autocomplete = 'off';
    form.role = 'presentation';
    form.name = 'fast_transfer_form';

    const formGroup = this.createFormGroup();
    const buttonsDiv = this.createButtons();

    form.appendChild(formGroup);
    form.appendChild(buttonsDiv);
    body.appendChild(form);

    return body;
  }

  createFormGroup() {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const label = document.createElement('label');
    label.id = 'label-destino';
    label.textContent = 'Destino da Transferência';
    
    const select = this.createSelectElement();

    formGroup.appendChild(label);
    formGroup.appendChild(select);

    return formGroup;
  }

  createSelectElement() {
    const container = document.createElement('div');
    container.className = window.FastTransferConfig.CSS_CLASSES.CATEGORIES;

    // Cria dropdown de categorias
    const categorySelect = this.createCategorySelect();
    const motivosContainer = this.createMotivosContainer();

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

  createCategorySelect() {
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
    window.FastTransferData.CATEGORIAS_CONFIG.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.value;
      option.textContent = cat.text;
      categorySelect.appendChild(option);
    });

    // Adiciona event listener para mudança de categoria
    categorySelect.addEventListener('change', (e) => {
      this.selectedCategory = e.target.value;
      this.selectedMotivo = null;

      if (this.selectedCategory) {
        this.showMotivosForCategory(this.selectedCategory, categorySelect.parentElement.querySelector('.motivos-container'));
      } else {
        categorySelect.parentElement.querySelector('.motivos-container').style.display = 'none';
      }
    });

    return categorySelect;
  }

  createMotivosContainer() {
    const motivosContainer = document.createElement('div');
    motivosContainer.className = window.FastTransferConfig.CSS_CLASSES.MOTIVOS_CONTAINER;
    motivosContainer.style.display = 'none';
    return motivosContainer;
  }

  showMotivosForCategory(category, container) {
    container.innerHTML = '';
    container.style.display = 'block';

    const motivos = window.FastTransferData.MOTIVOS_POR_CATEGORIA[category] || [];

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
    categoryTitle.textContent = `Motivos - ${this.getCategoryName(category)}`;
    categoryTitle.style.margin = '0 0 10px 0';
    categoryTitle.style.color = 'var(--gray-1000, #333)';
    categoryTitle.style.fontSize = '14px';
    container.appendChild(categoryTitle);

    // Cria grid de botões de motivos
    const motivosGrid = this.createMotivosGrid(motivos, category);
    container.appendChild(motivosGrid);
  }

  createMotivosGrid(motivos, category) {
    const motivosGrid = document.createElement('div');
    motivosGrid.className = window.FastTransferConfig.CSS_CLASSES.MOTIVOS_GRID;
    motivosGrid.style.display = 'grid';
    motivosGrid.style.gridTemplateColumns = `repeat(auto-fit, minmax(${window.FastTransferConfig.UI.GRID_MIN_WIDTH}, 1fr))`;
    motivosGrid.style.gap = '8px';
    motivosGrid.style.maxHeight = window.FastTransferConfig.UI.GRID_MAX_HEIGHT;
    motivosGrid.style.overflowY = 'auto';

    motivos.forEach(motivo => {
      const motivoButton = this.createMotivoButton(motivo, category, motivosGrid);
      motivosGrid.appendChild(motivoButton);
    });

    return motivosGrid;
  }

  createMotivoButton(motivo, category, motivosGrid) {
    const motivoButton = document.createElement('button');
    motivoButton.type = 'button';
    motivoButton.className = window.FastTransferConfig.CSS_CLASSES.MOTIVO_BUTTON;
    motivoButton.textContent = motivo.text;
    motivoButton.dataset.motivoId = motivo.id;
    motivoButton.dataset.categoria = category;

    this.applyMotivoButtonStyles(motivoButton);

    motivoButton.addEventListener('mouseenter', () => {
      motivoButton.style.backgroundColor = window.FastTransferConfig.COLORS.PRIMARY_HOVER;
    });

    motivoButton.addEventListener('mouseleave', () => {
      motivoButton.style.backgroundColor = window.FastTransferConfig.COLORS.PRIMARY;
    });

    motivoButton.addEventListener('click', () => {
      this.selectMotivo(motivoButton, motivosGrid, category, motivo.id);
    });

    return motivoButton;
  }

  applyMotivoButtonStyles(button) {
    Object.assign(button.style, {
      backgroundColor: window.FastTransferConfig.COLORS.PRIMARY,
      color: 'white',
      border: 'none',
      padding: window.FastTransferConfig.UI.BUTTON_PADDING,
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: 'sans-serif',
      textAlign: 'left',
      transition: `all ${window.FastTransferConfig.UI.TRANSITION_DURATION} ease`,
      width: '100%'
    });
  }

  selectMotivo(button, motivosGrid, category, motivoId) {
    // Remove seleção anterior
    motivosGrid.querySelectorAll('.motivo-button.selected').forEach(btn => {
      btn.classList.remove(window.FastTransferConfig.CSS_CLASSES.SELECTED);
      btn.style.backgroundColor = window.FastTransferConfig.COLORS.PRIMARY;
    });

    // Seleciona este motivo
    button.classList.add(window.FastTransferConfig.CSS_CLASSES.SELECTED);
    button.style.backgroundColor = window.FastTransferConfig.COLORS.PRIMARY_SELECTED;

    this.selectedMotivo = motivoId;

    // Atualiza campos ocultos
    const hiddenCategoria = document.getElementById('categoria_selecionada');
    const hiddenMotivo = document.getElementById('motivo_selecionado');
    if (hiddenCategoria && hiddenMotivo) {
      hiddenCategoria.value = category;
      hiddenMotivo.value = motivoId;
    }
  }

  getCategoryName(category) {
    const categoryConfig = window.FastTransferData.CATEGORIAS_CONFIG.find(cat => cat.value === category);
    return categoryConfig ? categoryConfig.text : category;
  }

  createButtons() {
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'botoes';
    buttonsDiv.style.display = 'flex';
    buttonsDiv.style.gap = '10px';
    buttonsDiv.style.marginTop = '15px';

    const saveButton = this.createSaveButton();
    const cancelButton = this.createCancelButton();

    buttonsDiv.appendChild(saveButton);
    buttonsDiv.appendChild(cancelButton);

    return buttonsDiv;
  }

  createSaveButton() {
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.id = 'salvar';
    saveButton.textContent = 'Transferir';
    
    Object.assign(saveButton.style, {
      backgroundColor: window.FastTransferConfig.COLORS.PRIMARY,
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: `background-color ${window.FastTransferConfig.UI.TRANSITION_DURATION} ease`
    });

    saveButton.addEventListener('click', () => this.handleTransfer());

    return saveButton;
  }

  createCancelButton() {
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

    cancelButton.addEventListener('click', () => this.hide());

    return cancelButton;
  }

  async handleTransfer() {
    if (!this.selectedCategory || !this.selectedMotivo) {
      alert('Por favor, selecione uma categoria e um motivo para a transferência.');
      return;
    }

    console.log('[TransferModal] Iniciando processo de transferência...');
    console.log('[TransferModal] Categoria:', this.selectedCategory);
    console.log('[TransferModal] Motivo:', this.selectedMotivo);

    // Emite evento para o sistema de transferência
    this.eventBus.emit('transferRequested', {
      categoria: this.selectedCategory,
      motivo: this.selectedMotivo
    });

    this.hide();
  }

  setupModalEvents() {
    // Botão de fechar
    const headerClose = this.modal.querySelector('.cabecalho_fecha');
    if (headerClose) {
      headerClose.addEventListener('click', () => this.hide());
    }

    // Tecla Esc
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    
    document.addEventListener('keydown', escapeHandler);
    
    // Remove listener quando modal for fechado
    const originalRemove = this.modal.remove.bind(this.modal);
    this.modal.remove = function() {
      document.removeEventListener('keydown', escapeHandler);
      return originalRemove();
    };
  }

  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      console.log('[TransferModal] Janela de transferência fechada.');
    }
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferModal = TransferModal;
}
