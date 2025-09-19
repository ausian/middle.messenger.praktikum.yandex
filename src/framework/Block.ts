import EventBus from './EventBus.ts';
import type { EventCallback } from './EventBus.ts';
import Handlebars from 'handlebars';

export interface BlockProps extends Record<string, unknown> {
  attr?: Record<string, unknown>;
  events?: Record<string, EventListenerOrEventListenerObject>;
}

export default class Block<TProps extends BlockProps = BlockProps> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  };

  protected _element: HTMLElement | null = null;

  protected _id: number = Math.floor(100000 + Math.random() * 900000);

  protected props: TProps;

  protected children: BlockRecord;

  protected lists: BlockLists;

  protected eventBus: () => EventBus;

  private _registeredEvents: Array<{
    target: EventTarget;
    eventName: string;
    handler: EventListenerOrEventListenerObject;
  }> = [];

  constructor(propsWithChildren: Partial<TProps> = {}) {
    const eventBus = new EventBus();
    const { props, children, lists } =
      this._getChildrenPropsAndProps(propsWithChildren);
    this.props = this._makePropsProxy({ ...props }) as TProps;
    this.children = children;
    this.lists = this._makePropsProxy({ ...lists }) as BlockLists;

    this.eventBus = () => eventBus;
    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  private _registerEvents(eventBus: EventBus): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this) as EventCallback);
    eventBus.on(
      Block.EVENTS.FLOW_CDM,
      this._componentDidMount.bind(this) as EventCallback,
    );
    eventBus.on(
      Block.EVENTS.FLOW_CDU,
      this._componentDidUpdate.bind(this) as EventCallback,
    );
    eventBus.on(
      Block.EVENTS.FLOW_RENDER,
      this._render.bind(this) as EventCallback,
    );
  }

  protected init(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private _componentDidMount(): void {
    this.componentDidMount();
    Object.values(this.children).forEach((child) =>
      child.dispatchComponentDidMount(),
    );
    Object.values(this.lists).forEach((items) => {
      items.forEach((item) => {
        if (item instanceof Block) {
          item.dispatchComponentDidMount();
        }
      });
    });
  }

  protected componentDidMount(): void {}

  public dispatchComponentDidMount(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate(oldProps: TProps, newProps: TProps): void {
    const needRender = this.componentDidUpdate(oldProps, newProps);
    if (needRender) this._render();
  }

  protected componentDidUpdate(_oldProps: TProps, _newProps: TProps): boolean {
    void _oldProps;
    void _newProps;
    return true;
  }

  private _getChildrenPropsAndProps(input: Partial<TProps>) {
    const children: BlockRecord = {};
    const props: Record<string, unknown> = {};
    const lists: BlockLists = {};

    Object.entries(input).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else if (Array.isArray(value)) {
        lists[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, props, lists };
  }

  public setProps(nextProps: Partial<TProps>): void {
    if (!nextProps) return;
    Object.assign(this.props, nextProps);
  }

  public setLists(nextLists: Partial<BlockLists>): void {
    if (!nextLists) return;
    Object.assign(this.lists, nextLists);
  }

  private _render(): void {
    this._removeEvents();
    const propsAndStubs: Record<string, unknown> = { ...this.props };

    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
    });

    Object.entries(this.lists).forEach(([key]) => {
      propsAndStubs[key] = this.lists[key];
    });

    const templateString = Handlebars.compile(this.render())(propsAndStubs);
    const fragment = this._createFragmentFromTemplate(templateString);

    Object.values(this.children).forEach((child) => {
      const stub = fragment.querySelector(`[data-id="${child._id}"]`);
      if (stub) stub.replaceWith(child.getContent());
    });

    Object.entries(this.lists).forEach(([, arr]) => {
      arr.forEach((item) => {
        if (item instanceof Block) {
          const stub = fragment.querySelector(`[data-id="${item._id}"]`);
          if (stub) stub.replaceWith(item.getContent());
        }
      });
    });

    const newElement = fragment.firstElementChild as HTMLElement;
    if (this._element && newElement) this._element.replaceWith(newElement);
    this._element = newElement;
    this._addEvents();
    this.addAttributes();
  }

  protected render(): string {
    return '';
  }

  public getContent(): HTMLElement {
    if (!this._element) throw new Error('Element is not created');
    return this._element;
  }

  private _addEvents(): void {
    const { events = {} } = this.props;

    Object.entries(events).forEach(([eventKey, handler]) => {
      const { target, eventName } = this._resolveEventTarget(eventKey);

      if (!target) return;

      target.addEventListener(eventName, handler);
      this._registeredEvents.push({ target, eventName, handler });
    });
  }

  private _removeEvents(): void {
    this._registeredEvents.forEach(({ target, eventName, handler }) => {
      target.removeEventListener(eventName, handler);
    });

    this._registeredEvents = [];
  }

  protected addAttributes(): void {
    Object.entries(this.props.attr ?? {}).forEach(([key, value]) => {
      if (value !== undefined) {
        this._element?.setAttribute(key, String(value));
      }
    });
  }

  public getId(): number {
    return this._id;
  }

  public setAttributes(attr: Record<string, string>): void {
    Object.entries(attr).forEach(([key, value]) => {
      this._element?.setAttribute(key, value);
    });
  }

  private _makePropsProxy<T extends Record<string, unknown>>(props: T): T {
    return new Proxy(props, {
      get: (target, prop: string) => {
        const value = target[prop as keyof T];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set: (target, prop: string, value: unknown) => {
        const oldTarget = { ...target };
        target[prop as keyof T] = value as T[keyof T];
        this.eventBus().emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty: () => {
        throw new Error('No access');
      },
    });
  }

  private _createFragmentFromTemplate(
    templateString: string,
  ): DocumentFragment {
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    const fragment = document.createDocumentFragment();

    while (doc.body.firstChild) {
      fragment.appendChild(doc.body.firstChild);
    }

    return fragment;
  }

  public show(): void {
    this.getContent().style.display = 'block';
  }

  public hide(): void {
    this.getContent().style.display = 'none';
  }

  get element(): HTMLElement | null {
    return this._element;
  }

  public getProps(): Readonly<TProps> {
    return this.props;
  }

  private _resolveEventTarget(eventKey: string): {
    target: EventTarget | null;
    eventName: string;
  } {
    if (eventKey.startsWith('window:')) {
      return { target: window, eventName: eventKey.slice('window:'.length) };
    }

    if (eventKey.startsWith('document:')) {
      return {
        target: document,
        eventName: eventKey.slice('document:'.length),
      };
    }

    return { target: this._element, eventName: eventKey };
  }
}

export type BlockRecord = Record<string, Block>;
export type BlockLists = Record<string, unknown[]>;
