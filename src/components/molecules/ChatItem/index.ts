import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Avatar } from '../../atoms/Avatar/index.ts';
import chatItemTemplate from './ChatItem.hbs?raw';
import './ChatItem.pcss';

export interface ChatItemProps extends BlockProps {
  chatId: number;
  author: string;
  text?: string;
  time?: string;
  unread?: number;
  avatar?: string;
  active?: boolean;
  onSelect?: (chatId: number) => void;
}

export class ChatItem extends Block<ChatItemProps> {
  constructor(props: ChatItemProps) {
    const {
      chatId,
      author,
      avatar,
      onSelect,
      events,
      text,
      ...rest
    } = props;

    const combinedEvents: Record<string, EventListenerOrEventListenerObject> = {
      ...(events ?? {}),
    };

    const originalClick = combinedEvents.click;

    combinedEvents.click = (event: Event) => {
      if (typeof originalClick === 'function') {
        originalClick(event);
      } else if (
        originalClick
        && typeof originalClick === 'object'
        && 'handleEvent' in originalClick
        && typeof originalClick.handleEvent === 'function'
      ) {
        originalClick.handleEvent(event);
      }

      if (!event.defaultPrevented) {
        onSelect?.(chatId);
      }
    };

    super({
      ...rest,
      chatId,
      author,
      text: text ?? '',
      events: combinedEvents,
      Avatar: new Avatar({
        src: avatar,
        author,
      }),
    });
  }

  override render() {
    return chatItemTemplate;
  }
}

export default ChatItem;
