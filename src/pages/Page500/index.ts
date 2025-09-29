import Block from '../../framework/Block.ts';
import { MainLayout } from '../../components/layouts/MainLayout/index.ts';
import { SettingsPanel } from '../../components/organisms/SettingsPanel/index.ts';
import { ErrorBanner } from '../../components/molecules/ErrorBanner/index.ts';
import { ArrowBack, Logout, Settings, ChatAdd } from '../../assets/icons/index.ts';
import page500Template from './Page500.hbs?raw';

export class Page500 extends Block {
  constructor() {
    super({
      MainLayout: new MainLayout({
        pageClass: 'page-500',
        leftPanel: new SettingsPanel({
          state: 'settings',
          icons: {
            chatAdd: ChatAdd,
            arrowBack: ArrowBack,
            logout: Logout,
            settings: Settings,
          },
        }),
        mainArea: [
          new ErrorBanner({
            code: '500',
            text: 'Уже чиним',
          }),
        ],
      }),
    });
  }

  override render() {
    return page500Template;
  }
}
