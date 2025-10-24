// Sistema de estilos centralizado
class StyleManager {
  constructor() {
    this.stylesAdded = false;
  }

  addStyles() {
    if (this.stylesAdded) return;

    const styles = `
      /* Estilos do FastTransfer */
      .${window.FastTransferConfig.CSS_CLASSES.CATEGORIES} {
        margin-bottom: 15px;
      }

      .${window.FastTransferConfig.CSS_CLASSES.CATEGORIES} select {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--gray-500, ${window.FastTransferConfig.COLORS.BORDER});
        border-radius: 4px;
        font-family: sans-serif;
        font-size: 14px;
      }

      .${window.FastTransferConfig.CSS_CLASSES.MOTIVOS_CONTAINER} {
        margin-top: 10px;
      }

      .${window.FastTransferConfig.CSS_CLASSES.MOTIVOS_CONTAINER} h4 {
        margin: 0 0 10px 0;
        color: var(--gray-1000, ${window.FastTransferConfig.COLORS.TEXT_PRIMARY});
        font-size: 14px;
        font-weight: bold;
      }

      .${window.FastTransferConfig.CSS_CLASSES.MOTIVOS_GRID} {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(${window.FastTransferConfig.UI.GRID_MIN_WIDTH}, 1fr));
        gap: 8px;
        max-height: ${window.FastTransferConfig.UI.GRID_MAX_HEIGHT};
        overflow-y: auto;
        padding: 5px;
        border: 1px solid var(--gray-300, #ddd);
        border-radius: 4px;
        background-color: ${window.FastTransferConfig.COLORS.BACKGROUND};
      }

      .${window.FastTransferConfig.CSS_CLASSES.MOTIVO_BUTTON} {
        background-color: ${window.FastTransferConfig.COLORS.PRIMARY};
        color: white;
        border: none;
        padding: ${window.FastTransferConfig.UI.BUTTON_PADDING};
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-family: sans-serif;
        text-align: left;
        transition: all ${window.FastTransferConfig.UI.TRANSITION_DURATION} ease;
        width: 100%;
      }

      .${window.FastTransferConfig.CSS_CLASSES.MOTIVO_BUTTON}:hover {
        background-color: ${window.FastTransferConfig.COLORS.PRIMARY_HOVER};
      }

      .${window.FastTransferConfig.CSS_CLASSES.MOTIVO_BUTTON}.${window.FastTransferConfig.CSS_CLASSES.SELECTED} {
        background-color: ${window.FastTransferConfig.COLORS.PRIMARY_SELECTED};
      }

      /* Estilos do botão principal */
      .${window.FastTransferConfig.CSS_CLASSES.BUTTON} {
        width: 90%;
        background-color: ${window.FastTransferConfig.COLORS.GRAY_100};
        color: black;
        border: none;
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
        font-family: sans-serif;
        font-size: 14px;
        transition: background-color ${window.FastTransferConfig.UI.TRANSITION_DURATION} ease;
        margin-top: 5px;
      }

      .${window.FastTransferConfig.CSS_CLASSES.BUTTON}:hover {
        background-color: ${window.FastTransferConfig.COLORS.GRAY_200};
      }
    `;

    window.FastTransferDOMUtils.addStyles(styles);
    this.stylesAdded = true;
    console.log('[StyleManager] Estilos do FastTransfer adicionados');
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferStyleManager = StyleManager;
}
