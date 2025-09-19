import Block from '../../framework/Block.ts';
import { MainLayout } from '../../components/layouts/MainLayout/index.ts';
import { SettingsPanel } from '../../components/organisms/SettingsPanel/index.ts';
import {
  ArrowBack,
  ChatAdd,
  Logout,
  Settings,
} from '../../assets/icons/index.ts';
import { ChatList } from '../../components/organisms/ChatList/index.ts';
import { MessageArea } from '../../components/organisms/MessageArea/index.ts';
import chatPageTemplate from './ChatPage.hbs?raw';
import messagesItemsData from '../../assets/data/messagesItemsData.ts';
import './ChatPage.pcss';

export class ChatPage extends Block {
  constructor() {
    super({
      MainLayout: new MainLayout({
        pageClass: 'chat-page',
        leftPanel: new SettingsPanel({
          state: 'chat',
          icons: {
            chatAdd: ChatAdd,
            arrowBack: ArrowBack,
            logout: Logout,
            settings: Settings,
          },
        }),
        mainArea: [new ChatList(messagesItemsData), new MessageArea()],
      }),
    });
  }

  override render() {
    return chatPageTemplate;
  }
}
