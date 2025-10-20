(() => {
  console.log('[SGP Integration] Script iniciado.');

  if (window.__opaSgpInjected) return;
  window.__opaSgpInjected = true;

  let observer;
  let debounceTimeout;

  // Função para debounce do observer
  function debounce(func, wait) {
    return function (...args) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function createSgpButton() {
    chrome.storage.sync.get({ sgpButtonEnabled: true }, (settings) => {
      if (!settings.sgpButtonEnabled) {
        console.log('[SGP Integration] Botão SGP desabilitado nas configurações.');
        removeSgpButton();
        if (observer) observer.disconnect();
        return;
      }

      observer = new MutationObserver(debounce(() => {
        const div = document.querySelector('div.dialog_panel[data-id]');
        if (!div) {
          console.log('[SGP Integration] Painel dialog_panel não encontrado.');
          return;
        }
        if (div.querySelector('button[data-sgp-button]')) return;

        const botoesDiv = div.querySelector('.botoes');
        if (!botoesDiv) {
          console.log('[SGP Integration] Div .botoes não encontrada no painel.');
          return;
        }

        const button = document.createElement('button');
        button.setAttribute('data-sgp-button', 'true');
        button.className = 'sgp-button'; // Usar CSS externo ou <style> para estilização
        button.textContent = 'Visualizar no SGP';

        const clientIdElement = div.querySelector('.empresa');
        let clientId;
        if (clientIdElement) {
          const text = clientIdElement.textContent.trim();
          const match = text.match(/(\d+) - .*/);
          clientId = match ? match[1] : null;
          if (clientId) {
            button.addEventListener('click', () => {
              const url = `https://intranet.fibranetbrasil.com.br/admin/cliente/${clientId}/edit/`;
              console.log('[SGP Integration] Abrindo URL:', url);
              try {
                window.open(url, '_blank');
              } catch (error) {
                console.error('[SGP Integration] Erro ao abrir URL:', error);
              }
            });
            botoesDiv.appendChild(button);
            console.log('[SGP Integration] Botão SGP adicionado com clientId:', clientId);
          } else {
            console.log('[SGP Integration] clientId não encontrado no texto:', text);
          }
        } else {
          console.log('[SGP Integration] Elemento .empresa não encontrado.');
        }
      }, 100)); // Debounce de 100ms

      observer.observe(document.body, { childList: true, subtree: true });
      console.log('[SGP Integration] Observer ativo com debounce.');
    });
  }

  function removeSgpButton() {
    const button = document.querySelector('button[data-sgp-button]');
    if (button) {
      button.remove();
      console.log('[SGP Integration] Botão SGP removido do DOM.');
    }
  }

  // Estilos para o botão (adicionar em um arquivo CSS ou <style> no HTML)
  const style = document.createElement('style');
  style.textContent = `
    .sgp-button {
      width: 90%;
      background-color: #3499eb;
      color: white;
      border: none;
      padding: 10px;
      cursor: pointer;
      border-radius: 4px;
      font-family: sans-serif;
      font-size: 14px;
    }
    .sgp-button:hover {
      background-color: #287acc;
    }
  `;
  document.head.appendChild(style);

  // Inicializa com base na configuração atual
  createSgpButton();

  // Escuta mudanças nas configurações
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsChanged' && message.sgpButtonEnabled !== undefined) {
      console.log('[SGP Integration] Configurações alteradas:', message);
      if (message.sgpButtonEnabled) {
        createSgpButton();
      } else {
        removeSgpButton();
        if (observer) observer.disconnect();
      }
    }
  });
})();