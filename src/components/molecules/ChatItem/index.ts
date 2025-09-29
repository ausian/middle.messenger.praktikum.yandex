import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Avatar } from '../../atoms/Avatar/index.ts';
import chatItemTemplate from './ChatItem.hbs?raw';
import './ChatItem.pcss';

export interface ChatItemProps extends BlockProps {
  author: string;
  text: string;
  time?: string;
  unread?: number;
  avatar?: string;
  active?: boolean;
  initial?: string;
}

export class ChatItem extends Block<ChatItemProps> {
  constructor(props: ChatItemProps) {
    super({
      ...props,
      Avatar: new Avatar({
        src: props.avatar,
        author: props.author,
      }),
    });
  }

  override render() {
    return chatItemTemplate;
  }
}
