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
import './ChatPage.pcss';
import chatController from '../../controllers/ChatController.ts';
import authController from '../../controllers/AuthController.ts';
import { router, APP_ROUTES } from '../../App.ts';
import store from '../../framework/Store.ts';

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
        mainArea: [new ChatList(), new MessageArea()],
      }),
    });
  }

  override componentDidMount(): void {
    super.componentDidMount();
    void this.ensureAuthorizedAndLoad();
  }

  override show(): void {
    super.show();
    void this.ensureAuthorizedAndLoad();
  }

  private async ensureAuthorizedAndLoad(): Promise<void> {
    let user = store.getState().user;
    if (!user) {
      user = await authController.fetchCurrentUser();
      if (!user) {
        router.go(APP_ROUTES.login);
        return;
      }
    }

    try {
      await chatController.fetchChats();
    } catch (error) {
      console.error('Failed to load chats', error);
    }
  }

  override render() {
    return chatPageTemplate;
  }
}
