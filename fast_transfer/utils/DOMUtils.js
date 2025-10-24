// Utilitários para manipulação do DOM
class DOMUtils {
  /**
   * Aguarda um elemento aparecer no DOM
   * @param {string} selector - Seletor CSS do elemento
   * @param {number} timeout - Timeout em ms
   * @param {boolean} byText - Se deve buscar por texto
   * @returns {Promise<Element|null>}
   */
  static async waitForElement(selector, timeout = 5000, byText = false) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkForElement = () => {
        let element;
        
        if (byText) {
          // Busca por texto usando jQuery se disponível
          if (typeof $ !== 'undefined') {
            element = $(`${selector}:visible`)[0];
          } else {
            // Fallback para busca nativa
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
              if (el.textContent && el.textContent.includes(selector.replace(':contains("', '').replace('")', ''))) {
                element = el;
                break;
              }
            }
          }
        } else {
          element = document.querySelector(selector);
        }
        
        if (element && getComputedStyle(element).display !== 'none') {
          resolve(element);
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          console.warn(`[DOMUtils] Timeout ao aguardar elemento: ${selector}`);
          resolve(null);
          return;
        }
        
        setTimeout(checkForElement, 100);
      };
      
      checkForElement();
    });
  }

  /**
   * Clica em um botão de forma confiável
   * @param {HTMLElement} button - Elemento do botão
   * @returns {boolean} - Sucesso da operação
   */
  static clickButton(button) {
    try {
      // Dispara evento de clique nativo
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
      console.error('[DOMUtils] Erro ao clicar no botão:', error);
      return false;
    }
  }

  /**
   * Adiciona estilos CSS ao documento
   * @param {string} styles - CSS a ser adicionado
   */
  static addStyles(styles) {
    if (window.__opaUtils && window.__opaUtils.dom) {
      window.__opaUtils.dom.addStyles(styles);
    } else {
      // Fallback: adiciona estilos diretamente
      const style = document.createElement('style');
      style.textContent = styles;
      document.head.appendChild(style);
    }
  }

  /**
   * Encontra elemento por múltiplos seletores
   * @param {string[]} selectors - Array de seletores CSS
   * @returns {HTMLElement[]} - Array de elementos encontrados
   */
  static queryMultipleSelectors(selectors) {
    const foundElements = [];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => foundElements.push(element));
    }
    return foundElements;
  }

  /**
   * Verifica se elemento está visível
   * @param {HTMLElement} element - Elemento a verificar
   * @returns {boolean} - Se está visível
   */
  static isVisible(element) {
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferDOMUtils = DOMUtils;
}
