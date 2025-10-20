document.addEventListener('DOMContentLoaded', () => {
  console.log('[Settings] Popup de configurações carregado.');

  // Elementos do DOM
  const betterNotificationToggle = document.querySelector('#betterNotificationEnabled').parentElement;
  const sgpButtonToggle = document.querySelector('#sgpButtonEnabled').parentElement;
  const fastTransferToggle = document.querySelector('#fastTransferEnabled').parentElement;
  const themeToggle = document.getElementById('themeToggle');

  // Função para carregar configurações com valores padrão
  const loadSettings = () => {
    chrome.storage.sync.get({
      betterNotificationEnabled: true,
      sgpButtonEnabled: true,
      fastTransferEnabled: true,
      darkMode: false
    }, (settings) => {
      document.getElementById('betterNotificationEnabled').checked = settings.betterNotificationEnabled;
      document.getElementById('sgpButtonEnabled').checked = settings.sgpButtonEnabled;
      document.getElementById('fastTransferEnabled').checked = settings.fastTransferEnabled;
      document.body.classList.toggle('dark', settings.darkMode);
      themeToggle.textContent = settings.darkMode ? 'Modo Claro' : 'Modo Escuro';
      console.log('[Settings] Configurações carregadas:', settings);
      // Enviar configurações iniciais para as abas
      sendSettingsMessage(settings);
    });
  };

  // Função para enviar mensagem para abas relevantes
  const sendSettingsMessage = (settings) => {
    chrome.tabs.query({ url: 'https://atendimento.fibranetbrasil.com.br/*' }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('[Settings] Erro ao consultar abas:', chrome.runtime.lastError.message);
        return;
      }
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'settingsChanged',
          ...settings
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('[Settings] Erro ao enviar mensagem para aba', tab.id, ':', chrome.runtime.lastError.message);
          } else {
            console.log('[Settings] Mensagem enviada para aba', tab.id, ':', settings);
          }
        });
      });
    });
  };

  // Carrega configurações ao inicializar
  loadSettings();

  // Função para alternar o estado do toggle e disparar evento de change
  const toggleCheckbox = (checkbox) => {
    checkbox.checked = !checkbox.checked;
    const event = new Event('change', { bubbles: true });
    checkbox.dispatchEvent(event);
  };

  // Adiciona eventos de clique aos toggles
  betterNotificationToggle.addEventListener('click', () => {
    toggleCheckbox(document.getElementById('betterNotificationEnabled'));
  });

  sgpButtonToggle.addEventListener('click', () => {
    toggleCheckbox(document.getElementById('sgpButtonEnabled'));
  });

  fastTransferToggle.addEventListener('click', () => {
    toggleCheckbox(document.getElementById('fastTransferEnabled'));
  });

  // Salva configurações e notifica scripts de conteúdo
  document.getElementById('betterNotificationEnabled').addEventListener('change', () => {
    const settings = { betterNotificationEnabled: document.getElementById('betterNotificationEnabled').checked };
    chrome.storage.sync.set(settings);
    console.log('[Settings] BetterNotification definido como:', settings.betterNotificationEnabled);
    sendSettingsMessage(settings);
  });

  document.getElementById('sgpButtonEnabled').addEventListener('change', () => {
    const settings = { sgpButtonEnabled: document.getElementById('sgpButtonEnabled').checked };
    chrome.storage.sync.set(settings);
    console.log('[Settings] Botão SGP definido como:', settings.sgpButtonEnabled);
    sendSettingsMessage(settings);
  });

  document.getElementById('fastTransferEnabled').addEventListener('change', () => {
    const settings = { fastTransferEnabled: document.getElementById('fastTransferEnabled').checked };
    chrome.storage.sync.set(settings);
    console.log('[Settings] FastTransfer definido como:', settings.fastTransferEnabled);
    sendSettingsMessage(settings);
  });

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    const settings = { darkMode: isDark };
    chrome.storage.sync.set(settings);
    themeToggle.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
    console.log('[Settings] Tema alterado para:', isDark ? 'escuro' : 'claro');
    sendSettingsMessage(settings);
  });
});