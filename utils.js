// Módulo utilitário compartilhado para a extensão Opa&SGP
(() => {
  if (window.__opaUtils) return;
  window.__opaUtils = {};

  /**
   * Utilitário para trabalhar com configurações do Chrome Storage
   */
  class ConfigManager {
    constructor() {
      this.cache = new Map();
      this.listeners = new Set();
    }

    // Carrega configurações com cache e valores padrão
    async get(keys, defaults = {}) {
      const keysToFetch = [];
      const result = {};

      // Verifica cache primeiro
      for (const key of Object.keys(keys)) {
        if (this.cache.has(key)) {
          result[key] = this.cache.get(key);
        } else {
          keysToFetch.push(key);
        }
      }

      // Busca apenas o que não está em cache
      if (keysToFetch.length > 0) {
        const fetched = await chrome.storage.sync.get(keysToFetch.reduce((acc, key) => {
          acc[key] = defaults[key] !== undefined ? defaults[key] : keys[key];
          return acc;
        }, {}));

        // Atualiza cache e resultado
        Object.assign(result, fetched);
        Object.keys(fetched).forEach(key => this.cache.set(key, fetched[key]));
      }

      return result;
    }

    // Salva configuração e atualiza cache
    async set(key, value) {
      await chrome.storage.sync.set({ [key]: value });
      this.cache.set(key, value);
      this.notifyListeners({ [key]: value });
    }

    // Adiciona listener para mudanças de configuração
    onChange(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    // Notifica listeners sobre mudanças
    notifyListeners(changes) {
      this.listeners.forEach(callback => {
        try {
          callback(changes);
        } catch (error) {
          console.error('[Utils] Erro no listener de configuração:', error);
        }
      });
    }
  }

  /**
   * Utilitário para trabalhar com MutationObserver otimizado
   */
  class DOMObserver {
    constructor(options = {}) {
      this.observer = null;
      this.debounceMs = options.debounceMs || 100;
      this.debounceTimer = null;
      this.callbacks = new Set();
    }

    // Inicia observação com callback
    observe(target, config, callback) {
      if (this.observer) this.disconnect();

      this.callbacks.add(callback);

      const debouncedCallback = () => {
        this.debounceTimer = null;
        this.callbacks.forEach(cb => {
          try {
            cb();
          } catch (error) {
            console.error('[Utils] Erro no callback do observer:', error);
          }
        });
      };

      const observerCallback = (mutations) => {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(debouncedCallback, this.debounceMs);
      };

      this.observer = new MutationObserver(observerCallback);
      this.observer.observe(target, config);

      return () => this.callbacks.delete(callback);
    }

    // Para observação
    disconnect() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.callbacks.clear();
    }
  }

  /**
   * Utilitário para manipulação de elementos DOM
   */
  class DOMUtils {
    // Verifica se elemento existe e está visível
    static isVisible(element) {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== 'none' &&
             style.visibility !== 'hidden' &&
             style.opacity !== '0' &&
             element.offsetParent !== null;
    }

    // Extrai texto limpo de um elemento
    static getTextContent(element, trim = true) {
      if (!element) return '';
      const text = element.textContent || element.innerText || '';
      return trim ? text.trim() : text;
    }

    // Busca elemento por seletor com timeout
    static waitForElement(selector, timeout = 5000) {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
        }, timeout);
      });
    }

    // Adiciona estilos CSS
    static addStyles(css) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    }
  }

  /**
   * Sistema centralizado de tratamento de erros e logging
   */
  class ErrorHandler {
    constructor() {
      this.logs = [];
      this.maxLogs = 100;
      this.errorListeners = new Set();
    }

    // Registra erro com contexto
    log(level, message, error = null, context = {}) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : null,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Adiciona ao array de logs
      this.logs.unshift(logEntry);

      // Mantém apenas os últimos logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }

      // Log no console
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${message}`, error || '', context);

      // Notifica listeners
      this.errorListeners.forEach(listener => {
        try {
          listener(logEntry);
        } catch (e) {
          console.error('Erro no listener de erro:', e);
        }
      });

      return logEntry;
    }

    // Métodos de conveniência
    error(message, error = null, context = {}) {
      return this.log('error', message, error, context);
    }

    warn(message, context = {}) {
      return this.log('warn', message, null, context);
    }

    info(message, context = {}) {
      return this.log('info', message, null, context);
    }

    debug(message, context = {}) {
      return this.log('debug', message, null, context);
    }

    // Adiciona listener para erros
    onError(callback) {
      this.errorListeners.add(callback);
      return () => this.errorListeners.delete(callback);
    }

    // Obtém logs recentes
    getLogs(level = null, limit = 50) {
      let filteredLogs = level ? this.logs.filter(log => log.level === level.toUpperCase()) : this.logs;
      return filteredLogs.slice(0, limit);
    }

    // Limpa logs
    clearLogs() {
      this.logs = [];
    }

    // Exporta logs para análise
    exportLogs() {
      return {
        logs: this.logs,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
    }
  }

  /**
   * Wrapper seguro para funções assíncronas
   */
  class SafeExecutor {
    static async execute(fn, fallback = null, context = {}) {
      try {
        const result = await fn();
        return { success: true, result };
      } catch (error) {
        window.__opaUtils.errorHandler.error('Erro na execução segura', error, context);
        return {
          success: false,
          error,
          fallback: fallback ? await fallback(error) : null
        };
      }
    }

    // Para funções síncronas
    static executeSync(fn, fallback = null, context = {}) {
      try {
        const result = fn();
        return { success: true, result };
      } catch (error) {
        window.__opaUtils.errorHandler.error('Erro na execução segura (sync)', error, context);
        return {
          success: false,
          error,
          fallback: fallback ? fallback(error) : null
        };
      }
    }
  }

  /**
   * Sistema de cache inteligente para dados do cliente
   */
  class ClientCache {
    constructor(ttl = 300000) { // 5 minutos TTL padrão
      this.cache = new Map();
      this.ttl = ttl;
      this.cleanupInterval = null;
    }

    // Obtém dados do cache se ainda válidos
    get(key) {
      const item = this.cache.get(key);
      if (!item) return null;

      if (Date.now() - item.timestamp > this.ttl) {
        this.cache.delete(key);
        return null;
      }

      return item.data;
    }

    // Salva dados no cache
    set(key, data) {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }

    // Remove item específico
    delete(key) {
      this.cache.delete(key);
    }

    // Limpa todo o cache
    clear() {
      this.cache.clear();
    }

    // Remove itens expirados
    cleanup() {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > this.ttl) {
          this.cache.delete(key);
        }
      }
    }

    // Inicia limpeza automática periódica
    startAutoCleanup(interval = 60000) { // 1 minuto
      if (this.cleanupInterval) return;

      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, interval);
    }

    // Para limpeza automática
    stopAutoCleanup() {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
    }

    // Obtém estatísticas do cache
    getStats() {
      const now = Date.now();
      let total = 0;
      let expired = 0;
      let valid = 0;

      for (const item of this.cache.values()) {
        total++;
        if (now - item.timestamp > this.ttl) {
          expired++;
        } else {
          valid++;
        }
      }

      return {
        total,
        expired,
        valid,
        ttl: this.ttl,
        autoCleanup: !!this.cleanupInterval
      };
    }
  }

  /**
   * Utilitário para comunicação entre scripts
   */
  class MessageBus {
    constructor() {
      this.listeners = new Map();
      this.setupListener();
    }

    // Configura listener global
    setupListener() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const listeners = this.listeners.get(message.type) || [];
        listeners.forEach(callback => {
          try {
            callback(message, sender, sendResponse);
          } catch (error) {
            console.error('[Utils] Erro no listener de mensagem:', error);
          }
        });

        // Retorna true se algum listener foi chamado para manter o canal aberto
        return listeners.length > 0;
      });
    }

    // Adiciona listener para tipo de mensagem
    on(type, callback) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, []);
      }
      this.listeners.get(type).push(callback);

      return () => {
        const listeners = this.listeners.get(type);
        if (listeners) {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      };
    }

    // Envia mensagem para aba específica
    sendToTab(tabId, message) {
      return chrome.tabs.sendMessage(tabId, message);
    }

    // Envia mensagem para todas as abas que correspondem ao padrão
    broadcastToTabs(urlPattern, message) {
      return new Promise((resolve) => {
        chrome.tabs.query({ url: urlPattern }, (tabs) => {
          const promises = tabs.map(tab =>
            this.sendToTab(tab.id, message).catch(() => null)
          );
          resolve(Promise.all(promises));
        });
      });
    }
  }

  // Instâncias globais
  window.__opaUtils.config = new ConfigManager();
  window.__opaUtils.observer = new DOMObserver();
  window.__opaUtils.dom = DOMUtils;
  window.__opaUtils.errorHandler = new ErrorHandler();
  window.__opaUtils.safeExecutor = SafeExecutor;
  window.__opaUtils.cache = new ClientCache();
  window.__opaUtils.messageBus = new MessageBus();

  // Inicia limpeza automática do cache
  window.__opaUtils.cache.startAutoCleanup();

  console.log('[Utils] Módulo utilitário carregado com sucesso.');

})();
