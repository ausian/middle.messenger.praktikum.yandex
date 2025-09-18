import Block, { type BlockProps } from '../../../framework/Block.ts';
import messageTemplate from './Message.hbs?raw';
import './Message.pcss';

export interface MessageProps extends BlockProps {
  text: string;
  time?: string;
  author?: string;
  avatar?: string;
  outgoing?: boolean;
}

export class Message extends Block<MessageProps> {
  override render() {
    return messageTemplate;
  }
}
