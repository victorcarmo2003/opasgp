// Configurações centralizadas do FastTransfer
const FastTransferConfig = {
  // Configurações de UI
  UI: {
    MODAL_WIDTH: '500px',
    MODAL_MAX_HEIGHT: '90vh',
    GRID_MIN_WIDTH: '200px',
    GRID_MAX_HEIGHT: '200px',
    BUTTON_PADDING: '8px 12px',
    TRANSITION_DURATION: '0.2s'
  },

  // Configurações de timing
  TIMING: {
    CHECK_INTERVAL: 500,
    MAX_ATTEMPTS: 10,
    TIMEOUT: 10000,
    OBSERVATION_DELAY: 1000,
    SELECT2_DELAY: 1000
  },

  // Seletores CSS
  SELECTORS: {
    PANEL_SELECTORS: [
      'div.dialog_panel[data-id]',
      'div.dialog_panel',
      'div.panel[data-id]',
      'div[class*="panel"][data-id]',
      'div[class*="dialog"][data-id]'
    ],
    TRANSFER_BUTTON: 'button[data-id="68f659a76bf611ed15c68d0e"]',
    OBSERVATION_FORM: 'form[name="new_atendimentoObservacao"]',
    OBSERVATION_TEXTAREA: 'textarea[name="mensagem"]',
    DEPARTAMENTO_SELECT: 'select[name="departamento"]',
    USUARIO_SELECT: 'select[name="usuario"]'
  },

  // Cores do tema
  COLORS: {
    PRIMARY: '#3a2fc1',
    PRIMARY_HOVER: '#4a3fd1',
    PRIMARY_SELECTED: '#2a1fb1',
    BACKGROUND: '#2a2f3c',
    TEXT_PRIMARY: '#333',
    TEXT_SECONDARY: '#666',
    BORDER: '#ccc',
    GRAY_100: '#ffffff',
    GRAY_200: '#f0f0f0',
    GRAY_400: '#ccc',
    GRAY_500: '#ccc',
    GRAY_700: '#666',
    GRAY_1000: '#333'
  },

  // Classes CSS
  CSS_CLASSES: {
    BUTTON: 'fast-transfer-button',
    MODAL: 'fast-transfer-modal',
    CATEGORIES: 'fast-transfer-categories',
    MOTIVOS_CONTAINER: 'motivos-container',
    MOTIVOS_GRID: 'motivos-grid',
    MOTIVO_BUTTON: 'motivo-button',
    SELECTED: 'selected'
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferConfig = FastTransferConfig;
}
