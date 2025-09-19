import Block from '../../../framework/Block.ts';
import chatListTemplate from './ChatList.hbs?raw';
import {
  ChatItem,
  type ChatItemProps,
} from '../../molecules/ChatItem/index.ts';
import { Input } from '../../atoms/Input/index.ts';
import './ChatList.pcss';

export class ChatList extends Block {
  constructor(chats: ChatItemProps[]) {
    const items = chats.map((chat) => new ChatItem(chat));

    super({
      searchInput: new Input({
        class: 'input__square input__square--white',
        name: 'search',
        id: 'search',
        type: 'text',
        placeholder: 'Поиск',
      }),
    });
    this.setLists({ chats: items });
  }

  override render() {
    return chatListTemplate;
  }
}
