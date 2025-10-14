import Block, { type BlockProps } from '../../../framework/Block.ts';
import popupTemplate from './Popup.hbs?raw';
import './Popup.pcss';

export type PopupType = 'info' | 'success' | 'error';

export type PopupContent = Block | string;

type PopupContentInput = PopupContent | PopupContent[] | null | undefined;

export interface PopupProps extends BlockProps {
  title: string | null;
  message: string | null;
  type: PopupType;
  isVisible: boolean;
  hasContent: boolean;
}

export interface PopupShowOptions {
  title?: string | null;
  message?: string | null;
  type?: PopupType;
  content?: PopupContentInput;
}

const toContentArray = (content: PopupContentInput): PopupContent[] => {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content.filter((item): item is PopupContent => item !== null && item !== undefined);
  }

  return [content];
};

const callListener = (
  listener: EventListenerOrEventListenerObject | undefined,
  event: Event,
): void => {
  if (!listener) return;

  if (typeof listener === 'function') {
    listener(event);
    return;
  }

  if (typeof listener.handleEvent === 'function') {
    listener.handleEvent(event);
  }
};

export class Popup extends Block<PopupProps> {
  constructor(props: Partial<PopupProps> = {}) {
    const baseEvents: Record<string, EventListenerOrEventListenerObject> =
      props.events ?? {};
    const originalClick = baseEvents.click;
    const originalWindowKeydown = baseEvents['window:keydown'];

    super({
      ...props,
      title: props.title ?? null,
      message: props.message ?? null,
      type: props.type ?? 'info',
      isVisible: props.isVisible ?? false,
      hasContent: false,
      events: {
        ...baseEvents,
        click: (event: Event) => {
          callListener(originalClick, event);
          this.handleClick(event);
        },
        'window:keydown': (event: Event) => {
          callListener(originalWindowKeydown, event);
          if (event instanceof KeyboardEvent) {
            this.handleKeydown(event);
          }
        },
      },
    });

    this.setLists({ content: [] });
  }

  private handleClick(event: Event): void {
    if (!this.props.isVisible) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    const actionElement = target.closest('[data-popup-action]');

    if (!(actionElement instanceof HTMLElement)) return;

    const action = actionElement.dataset.popupAction;
    if (action === 'close' || action === 'overlay') {
      event.preventDefault();
      this.close();
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.props.isVisible) return;
    if (event.key === 'Escape') {
      this.close();
    }
  }

  public showPopup({
    title = null,
    message = null,
    type = 'info',
    content = null,
  }: PopupShowOptions): void {
    const normalizedContent = toContentArray(content);
    this.setLists({ content: normalizedContent });
    this.setProps({
      title,
      message,
      type,
      isVisible: true,
      hasContent: normalizedContent.length > 0,
    });
  }

  public close(): void {
    if (!this.props.isVisible) return;
    this.setProps({ isVisible: false });
  }

  override render(): string {
    return popupTemplate;
  }
}
