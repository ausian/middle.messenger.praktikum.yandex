import EventBus from './EventBus.ts';
import type { EventCallback } from './EventBus.ts';
import Handlebars from 'handlebars';

export type BlockRecord = Record<string, Block<any, any, any>>;
export type BlockLists = Record<string, Array<Block<any, any, any> | string>>;

export default class Block<
  TProps extends Record<string, any> = Record<string, any>,
  TChildren extends Record<string, Block<any, any, any>> = Record<string, any>,
  TLists extends BlockLists = Record<string, any[]>,
> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  };

  protected _element: HTMLElement | null = null;

  protected _id: number = Math.floor(100000 + Math.random() * 900000);

  protected props: TProps;

  protected children: TChildren;

  protected lists: TLists;

  protected eventBus: () => EventBus;

  constructor(propsWithChildren: Partial<TProps & TChildren & TLists> = {}) {
    const eventBus = new EventBus();
    const { props, children, lists } =
      this._getChildrenPropsAndProps(propsWithChildren);
    this.props = this._makePropsProxy({ ...props }) as TProps;
    this.children = children as TChildren;
    this.lists = this._makePropsProxy({ ...lists }) as TLists;

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

  private _getChildrenPropsAndProps(
    input: Partial<TProps & TChildren & TLists>,
  ) {
    const children: BlockRecord = {};
    const props: Record<string, any> = {};
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

  public setLists(nextLists: Partial<TLists>): void {
    if (!nextLists) return;
    Object.assign(this.lists, nextLists);
  }

  private _render(): void {
    const propsAndStubs: Record<string, any> = { ...this.props };

    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
    });

    Object.entries(this.lists).forEach(([key]) => {
      propsAndStubs[key] = this.lists[key];
    });

    const fragment = this._createDocumentElement('template');
    fragment.innerHTML = Handlebars.compile(this.render())(propsAndStubs);

    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
      if (stub) stub.replaceWith(child.getContent());
    });

    Object.entries(this.lists).forEach(([, arr]) => {
      arr.forEach((item) => {
        if (item instanceof Block) {
          const stub = fragment.content.querySelector(
            `[data-id="${item._id}"]`,
          );
          if (stub) stub.replaceWith(item.getContent());
        }
      });
    });

    const newElement = fragment.content.firstElementChild as HTMLElement;
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
    const { events = {} } = this.props as any;
    Object.keys(events).forEach((eventName) => {
      this._element?.addEventListener(eventName, events[eventName]);
    });
  }

  protected addAttributes(): void {
    const { attr = {} } = this.props as any;
    Object.entries(attr).forEach(([key, value]) => {
      this._element?.setAttribute(key, String(value));
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

  private _makePropsProxy(props: any): any {
    return new Proxy(props, {
      get: (target, prop: string) => {
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set: (target, prop: string, value) => {
        const oldTarget = { ...target };
        target[prop] = value;
        this.eventBus().emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty: () => {
        throw new Error('No access');
      },
    });
  }

  private _createDocumentElement(tagName: string): HTMLTemplateElement {
    return document.createElement(tagName) as HTMLTemplateElement;
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
}
