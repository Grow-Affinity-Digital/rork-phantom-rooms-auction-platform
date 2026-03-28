type Listener<T> = (payload: T) => void;

class SimpleEventBus {
  private listeners: Record<string, Array<Listener<any>>> = {};

  on<T = any>(event: string, listener: Listener<T>) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener as Listener<any>);
    return () => this.off(event, listener);
  }

  off<T = any>(event: string, listener: Listener<T>) {
    const arr = this.listeners[event];
    if (!arr) return;
    this.listeners[event] = arr.filter(l => l !== (listener as Listener<any>));
  }

  emit<T = any>(event: string, payload: T) {
    const arr = this.listeners[event];
    if (!arr || arr.length === 0) return;
    arr.forEach(l => {
      try {
        l(payload);
      } catch (e) {
        console.log('[EventBus] listener error', e);
      }
    });
  }
}

export const eventBus = new SimpleEventBus();

export type BidPlacedEvent = {
  listingId: string;
  amount: number;
};
