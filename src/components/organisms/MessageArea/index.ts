import Block from '../../../framework/Block.ts';
import { Button } from '../../atoms/Button/index.ts';
import messageAreaTemplate from './MessageArea.hbs?raw';
import { More } from '../../../assets/icons/index.ts';
import { MessageList } from '../MessageList/index.ts';
import { MessageForm } from '../../molecules/MessageForm/index.ts';
import { Avatar } from '../../atoms/Avatar/index.ts';
import './MessageArea.pcss';

export class MessageArea extends Block {
  constructor() {
    super({
      MessageForm: new MessageForm(),
      chatOptionsButton: new Button({
        id: 'chat-options',
        type: 'button',
        icon: More,
      }),
      MessageList: new MessageList(),
      chatName: 'Иван Петров',
      chatAvatar: new Avatar({
        src: 'https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=2070&auto=format&fit=crop',
        author: 'Иван Петров',
      }),
    });
  }

  override render() {
    return messageAreaTemplate;
  }
}
