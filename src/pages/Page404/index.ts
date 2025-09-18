import Block from '../../framework/Block.ts';
import { MainLayout } from '../../components/layouts/MainLayout/index.ts';
import { SettingsPanel } from '../../components/organisms/SettingsPanel/index.ts';
import { ErrorBanner } from '../../components/molecules/ErrorBanner/index.ts';
import { ArrowBack, Logout, Settings, ChatAdd } from '../../assets/icons/index.ts';
import page404Template from './Page404.hbs?raw';

export class Page404 extends Block {
  constructor() {
    super({
      MainLayout: new MainLayout({
        pageClass: 'page-404',
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
            code: '404',
            text: 'Не туда попали',
          }),
        ],
      }),
    });
  }

  override render() {
    return page404Template;
  }
}
