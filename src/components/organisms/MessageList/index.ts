import Block, { type BlockProps } from '../../../framework/Block.ts';
import listTemplate from './MessageList.hbs?raw';
import './MessageList.pcss';
import { Message } from '../../atoms/Message/index.ts';

export type MessageListItem = Message | string;

export interface MessageListProps extends BlockProps {
  items?: MessageListItem[];
  isLoading?: boolean;
}

export class MessageList extends Block<MessageListProps> {
  constructor(props: MessageListProps = {}) {
    const { items = [], isLoading = false } = props;

    super({
      ...props,
      isLoading,
      hasItems: items.length > 0,
    });

    this.setLists({ items });
  }

  override componentDidUpdate(oldProps: MessageListProps, newProps: MessageListProps): boolean {
    if (oldProps.items !== newProps.items) {
      this.setLists({ items: newProps.items ?? [] });
      this.setProps({ hasItems: Boolean(newProps.items && newProps.items.length > 0) });
    }

    return true;
  }

  override render() {
    return listTemplate;
  }
}

export default MessageList;
