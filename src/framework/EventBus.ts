export type EventArgs = string | number | object | boolean;
export type EventCallback = (...args: EventArgs[]) => void;

export default class EventBus {
  private listeners: Record<string, EventCallback[]>;

  constructor() {
    this.listeners = {};
  }

  public on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);
  }

  public off(event: string, callback: EventCallback): void {
    const listeners = this.listeners[event];
    if (!listeners || listeners.length === 0) return;

    this.listeners[event] = listeners.filter(
      (listener) => listener !== callback,
    );

    if (this.listeners[event]?.length === 0) {
      delete this.listeners[event];
    }
  }

  public emit(event: string, ...args: EventArgs[]): void {
    const listeners = this.listeners[event];
    if (!listeners || listeners.length === 0) return;

    listeners.forEach((listener) => {
      listener(...args);
    });
  }
}
