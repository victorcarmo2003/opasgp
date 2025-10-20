(() => {
  console.log('[BetterNotifications] Script iniciado.');

  if (window.__opaBetterNotificationsInjected) return;
  window.__opaBetterNotificationsInjected = true;

  const viewedChats = new Set();

  // Adiciona estilos CSS
  const style = document.createElement('style');
  style.textContent = `
    .chat.notification-enhanced {
      border: 2px solid transparent;
      position: relative;
      transition: border-color 0.3s ease;
    }
    .chat.notification-enhanced.active {
      animation: pulse-border 1s infinite;
    }
    @keyframes pulse-border {
      0% { border-color: #ffeb3b; }
      50% { border-color: transparent; }
      100% { border-color: #ffeb3b; }
    }
    .chat.notification-enhanced .notif i.notifica {
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Função para verificar se o ícone de notificação está visível
  function isNotifVisible(notifIcon) {
    if (!notifIcon) return false;
    const style = window.getComputedStyle(notifIcon);
    return style.display !== 'none' && style.opacity !== '0';
  }

  // Função para melhorar um chat
  function enhanceChat(chat) {
    if (chat.classList.contains('notification-enhanced')) return;
    chat.classList.add('notification-enhanced');
    const chatId = chat.getAttribute('data-id');
    const notifIcon = chat.querySelector('.notif i.notifica');
    const timestampElem = chat.querySelector('.data_hora_ultima_msg');

    // Verifica estado inicial
    if (notifIcon && isNotifVisible(notifIcon) && !viewedChats.has(chatId)) {
      chat.classList.add('active');
      notifIcon.style.display = 'none';
    }

    // Observa mudanças no timestamp
    const timestampObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' && !viewedChats.has(chatId)) {
          chat.classList.add('active');
          if (notifIcon) notifIcon.style.display = 'none';
        }
      });
    });
    if (timestampElem) {
      timestampObserver.observe(timestampElem, { characterData: true, subtree: true });
    }

    // Para a animação ao clicar
    chat.addEventListener('click', () => {
      chat.classList.remove('active');
      viewedChats.add(chatId);
      if (notifIcon) notifIcon.style.display = '';
    });
  }

  // Função principal para melhorar notificações
  function enhanceNotifications() {
    chrome.storage.sync.get({ betterNotificationEnabled: true }, (settings) => {
      if (!settings.betterNotificationEnabled) {
        console.log('[BetterNotifications] Notificações aprimoradas desabilitadas.');
        document.querySelectorAll('.chat.notification-enhanced').forEach((chat) => {
          chat.classList.remove('notification-enhanced', 'active');
          const notifIcon = chat.querySelector('.notif i.notifica');
          if (notifIcon) notifIcon.style.display = '';
        });
        viewedChats.clear();
        return;
      }

      // Melhora chats existentes
      document.querySelectorAll('.chat').forEach(enhanceChat);

      // Observa novos chats
      const listContainer = document.querySelector('.list');
      if (listContainer) {
        const containerObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('chat')) {
                  enhanceChat(node);
                }
              });
            }
          });
        });
        containerObserver.observe(listContainer, { childList: true, subtree: true });
      }
    });
  }

  // Chamada inicial
  enhanceNotifications();

  // Escuta mudanças nas configurações
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsChanged' && message.betterNotificationEnabled !== undefined) {
      console.log('[BetterNotifications] Configurações alteradas:', message);
      enhanceNotifications();
    }
  });
})();