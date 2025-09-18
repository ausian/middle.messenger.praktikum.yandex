import Block from '../../../framework/Block.ts';
import messageTemplate from './Message.hbs?raw';
import './Message.pcss';

export interface MessageProps {
  text: string;
  time?: string;
  author?: string;
  avatar?: string;
  outgoing?: boolean;
  events?: Record<string, EventListener>;
  attr?: Record<string, string>;
}

export class Message extends Block<MessageProps> {
  override render() {
    return messageTemplate;
  }
}
