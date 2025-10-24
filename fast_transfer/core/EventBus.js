// Sistema de eventos para comunicação entre componentes
class EventBus {
  constructor() {
    this.events = new Map();
  }

  // Registrar listener para um evento
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  // Remover listener de um evento
  off(event, callback) {
    if (!this.events.has(event)) return;
    
    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // Emitir evento para todos os listeners
  emit(event, data = null) {
    if (!this.events.has(event)) return;
    
    const callbacks = this.events.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Erro ao executar callback do evento ${event}:`, error);
      }
    });
  }

  // Limpar todos os listeners de um evento
  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Instância global do EventBus
const eventBus = new EventBus();

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FastTransferEventBus = eventBus;
}
