// Componente de Templates de Mensagens para Observações
// Gerencia mensagens pré-definidas para o campo de observação

(() => {
  console.log('[MessageTemplates] Componente iniciado.');

  if (window.__opaMessageTemplatesInjected) return;
  window.__opaMessageTemplatesInjected = true;

  // Estado interno
  let observerCleanup = null;
  let checkInterval = null;

  // Mapa de cores por categoria
  const CATEGORY_COLORS = {
    'agendamento': 'rgb(9, 118, 207)',   // Azul
    'financeiro': 'rgb(13, 123, 43)',    // Verde
    'comercial': 'rgb(0, 144, 120)',      // Laranja/Vermelho
    'cancelamento': 'rgb(0, 0, 0)',       // Preto
    'status': 'rgb(197, 8, 199)'          // Roxo
  };

  // Função para ajustar brilho da cor (para hover effect)
  function adjustColorBrightness(color, amount) {
    // Converte rgb(r, g, b) para array [r, g, b]
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return color;

    const r = Math.max(0, Math.min(255, parseInt(rgbMatch[1]) + amount));
    const g = Math.max(0, Math.min(255, parseInt(rgbMatch[2]) + amount));
    const b = Math.max(0, Math.min(255, parseInt(rgbMatch[3]) + amount));

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Mensagens padrão pré-definidas
  const DEFAULT_MESSAGES = [
    {
      id: 'inativo',
      title: 'Inativo',
      text: 'Cliente não deu mais retorno nas mensagens',
      category: 'status',
    },
    {
      id: 'pagamento',
      title: 'Pagar Boleto',
      text: 'Cliente deseja realizar o pagamento do boleto.',
      category: 'financeiro',
    },
        {
      id: 'financeiro',
      title: 'Financeiro',
      text: 'Dúvidas sobre boleto ou contrato',
      category: 'financeiro',
    },
        {
      id: 'suspender',
      title: 'Suspender',
      text: 'Cliente deseja realizar a suspensão do serviço',
      category: 'financeiro',
    },
    {
      id: 'visita',
      title: 'Visita',
      text: 'Cliente deseja verificar quando será realizada a visita',
      category: 'agendamento',
    },
    {
      id: 'agendamento',
      title: 'Agendamento',
      text: 'Cliente tem dúvidas referente ao agendamento',
      category: 'agendamento',
    },
    {
      id: 'endereço',
      title: 'Mudar Endereço',
      text: 'Cliente deseja realizar uma mudança de endereço',
      category: 'comercial',
    },
    {
      id: 'realocar',
      title: 'Realocar',
      text: 'Cliente deseja realocar o equipamento.',
      category: 'comercial',
    },
    {
      id: 'contrato',
      title: 'Contrato',
      text: 'Cliente deseja verificar o contrato',
      category: 'comercial',
    },
    {
      id: 'cancelamento',
      title: 'Cancelar',
      text: 'Cliente deseja realizar o cancelamento da internet',
      category: 'cancelamento',
    },
  ];

  // Carrega mensagens salvas ou usa padrão
  function getMessages() {
    try {
      // Verifica se __opaUtils está disponível
      if (!window.__opaUtils || !window.__opaUtils.cache) {
        console.warn('[MessageTemplates] __opaUtils não disponível, usando mensagens padrão');
        return DEFAULT_MESSAGES;
      }
      
      const saved = window.__opaUtils.cache.get('messageTemplates');
      return saved || DEFAULT_MESSAGES;
    } catch (error) {
      console.error('[MessageTemplates] Erro ao carregar mensagens:', error);
      return DEFAULT_MESSAGES;
    }
  }

  // Salva mensagens personalizadas
  function saveMessages(messages) {
    try {
      // Verifica se __opaUtils está disponível
      if (!window.__opaUtils || !window.__opaUtils.cache) {
        console.warn('[MessageTemplates] __opaUtils não disponível, não é possível salvar mensagens');
        return false;
      }
      
      window.__opaUtils.cache.set('messageTemplates', messages);
      console.log('[MessageTemplates] Mensagens salvas:', messages.length);
      return true;
    } catch (error) {
      console.error('[MessageTemplates] Erro ao salvar mensagens:', error);
      return false;
    }
  }

  // Adiciona texto ao textarea
  function addTextToTextarea(text) {
    const textarea = document.querySelector('textarea[name="mensagem"]');
    if (!textarea) {
      console.error('[MessageTemplates] Textarea de mensagem não encontrada');
      return false;
    }

    const currentText = textarea.value;
    const newText = currentText ? currentText + '\n\n' + text : text;

    textarea.value = newText;
    textarea.focus();

    // Dispara evento de input para atualizar contador
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);

    console.log('[MessageTemplates] Texto adicionado:', text.substring(0, 50) + '...');
    return true;
  }

  // Cria botão de mensagem com cor baseada na categoria
  function createMessageButton(message) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'message-template-btn';
    button.title = message.text;
    button.textContent = message.title;

    // Obtém a cor baseada na categoria
    const buttonColor = CATEGORY_COLORS[message.category] || '#3499eb';

    button.addEventListener('click', () => {
      addTextToTextarea(message.text);
    });

    // Estilos inline com cor dinâmica
    Object.assign(button.style, {
      backgroundColor: buttonColor,
      color: 'white',
      border: 'none',
      padding: '6px 10px',
      margin: '0',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '11px',
      fontFamily: 'sans-serif',
      transition: 'background-color 0.2s ease',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      minWidth: 'fit-content',
      height: '28px'
    });

    // Hover effect com cor mais escura
    const darkerColor = adjustColorBrightness(buttonColor, -20);
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = darkerColor;
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = buttonColor;
    });

    return button;
  }

  // Cria container para botões de mensagens
  function createMessageButtonsContainer() {
    const container = document.createElement('div');
    container.className = 'message-templates-container';

    Object.assign(container.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      margin: '0',
      padding: '0',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0',
      width: 'auto',
      alignItems: 'center'
    });

    return container;
  }
  function setupObservationButtonDetection() {
    // Procura por botões que podem abrir o modal de nova observação
    const allButtons = document.querySelectorAll('button, a, [role="button"]');
    const targetTexts = [
      'Nova observação',
      'Nova Observação',
      'observação',
      'Observação',
      'nova observação',
      'nova Observação'
    ];

    allButtons.forEach(button => {
      if (button.hasAttribute('data-message-templates-listener')) return;

      const text = (button.textContent || button.innerText || '').toLowerCase();
      const title = (button.title || button.getAttribute('title') || '').toLowerCase();

      const matches = targetTexts.some(targetText =>
        text.includes(targetText.toLowerCase()) ||
        title.includes(targetText.toLowerCase())
      );

      if (matches) {
        button.addEventListener('click', () => {
          console.log('[MessageTemplates] Botão de nova observação clicado, aguardando modal...');
          // Verifica mais rapidamente após o clique
          setTimeout(setupObservationModal, 200);
          setTimeout(setupObservationModal, 500);
          setTimeout(setupObservationModal, 800);
          setTimeout(setupObservationModal, 1200);
          setTimeout(setupObservationModal, 1500);
        });
        button.setAttribute('data-message-templates-listener', 'true');
      }
    });
  }

  // Detecta e modifica modal de nova observação
  function setupObservationModal() {
    // Procura por qualquer elemento que contenha o form de nova observação
    const observationForm = document.querySelector('form[name="new_atendimentoObservacao"]');
    if (!observationForm) {
      return false;
    }

    // Verifica se o form está dentro de um modal/painel visível
    const modal = observationForm.closest('div.modal, div.estrutura, div.ui-draggable, div.dialog, div.panel');
    if (!modal) {
      return false;
    }

    // Verifica se o modal está visível usando getComputedStyle
    const modalStyle = window.getComputedStyle(modal);
    if (modalStyle.display === 'none' || modalStyle.visibility === 'hidden' || modalStyle.opacity === '0') {
      return false;
    }

    // Verificação adicional: modal deve ter altura e largura
    if (modal.offsetWidth === 0 || modal.offsetHeight === 0) {
      return false;
    }
    return addMessageTemplatesToModal(modal);
  }

  // Adiciona templates ao modal
  function addMessageTemplatesToModal(modal) {
    const form = modal.querySelector('form[name="new_atendimentoObservacao"]');
    if (!form) {
      console.log('[MessageTemplates] Form de observação não encontrado no modal');
      return false;
    }

    // Verifica se já foi adicionado para evitar duplicação
    const existingContainer = form.querySelector('.message-templates-container');
    if (existingContainer) {
      return true;
    }

    // Verificação adicional: form deve estar visível e ter conteúdo
    if (form.offsetWidth === 0 || form.offsetHeight === 0) {
      console.log('[MessageTemplates] Form não está visível ou não tem dimensões');
      return false;
    }

    const messages = getMessages();
    if (messages.length === 0) {
      console.log('[MessageTemplates] Nenhuma mensagem definida');
      return false;
    }

    const container = createMessageButtonsContainer();

    // Adiciona cada botão de mensagem
    messages.forEach(message => {
      const button = createMessageButton(message);
      container.appendChild(button);
    });

    // Insere o container dentro da div .botoes
    const botoesDiv = form.querySelector('.botoes');
    if (botoesDiv) {
      // Verifica se já existe um container dentro da div botoes
      const existingContainer = botoesDiv.querySelector('.message-templates-container');
      if (!existingContainer) {
        // Insere o container dentro da div botoes
        botoesDiv.appendChild(container);
        console.log('[MessageTemplates] Templates adicionados dentro da div .botoes -', messages.length, 'mensagens');
        return true;
      } else {
        console.log('[MessageTemplates] Container já existe na div .botoes');
        return true;
      }
    }

    // Fallback: insere antes do textarea se não encontrar div .botoes
    const textarea = form.querySelector('textarea[name="mensagem"]');
    if (textarea) {
      const parentDiv = textarea.closest('.form-group');
      if (parentDiv) {
        const existingContainer = parentDiv.querySelector('.message-templates-container');
        if (!existingContainer) {
          parentDiv.insertBefore(container, textarea);
          console.log('[MessageTemplates] Templates adicionados (fallback) -', messages.length, 'mensagens');
          return true;
        }
      }
    }

    console.log('[MessageTemplates] Não foi possível inserir templates');
    return false;
  }

  // Inicializa componente
  function initializeComponent() {
    console.log('[MessageTemplates] Inicializando componente...');

    // Verifica se __opaUtils está disponível
    if (!window.__opaUtils) {
      console.warn('[MessageTemplates] __opaUtils não disponível, aguardando...');
      // Aguarda um pouco mais e tenta novamente
      setTimeout(() => {
        if (window.__opaUtils) {
          initializeComponent();
        } else {
          console.error('[MessageTemplates] __opaUtils não disponível após timeout');
        }
      }, 1000);
      return;
    }

    // Configurações iniciais
    setupObservationModal();
    setupObservationButtonDetection();

    // Verificação periódica para modais abertos dinamicamente (mais rápida)
    checkInterval = setInterval(() => {
      setupObservationModal();
      setupObservationButtonDetection(); // Também verifica novos botões
    }, 1000); // Verifica a cada 3 segundos (era 10)

    // Monitora mudanças no DOM para detectar novos modais
    observerCleanup = window.__opaUtils.observer.observe(
      document.body,
      { childList: true, subtree: true },
      () => {
        setupObservationModal();
        setupObservationButtonDetection();
      }
    );

    console.log('[MessageTemplates] Componente inicializado');
  }

  // API pública para gerenciar mensagens
  window.MessageTemplatesAPI = {
    getMessages,
    saveMessages,
    addTextToTextarea,
    refreshModal: setupObservationModal,
    destroy: () => {
      if (observerCleanup) {
        observerCleanup();
        observerCleanup = null;
      }
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      console.log('[MessageTemplates] Componente destruído');
    }
  };

  // Inicializa quando utils estiver disponível
  if (window.__opaUtils) {
    initializeComponent();
  } else {
    // Aguarda carregamento dos utils
    const checkUtils = () => {
      if (window.__opaUtils) {
        initializeComponent();
      } else {
        setTimeout(checkUtils, 100);
      }
    };
    checkUtils();
  }

  console.log('[MessageTemplates] Componente carregado com sucesso');
})();
