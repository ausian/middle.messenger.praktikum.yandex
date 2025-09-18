import Block from '../../framework/Block.ts';
import { MainLayout } from '../../components/layouts/MainLayout/index.ts';
import { SettingsPanel } from '../../components/organisms/SettingsPanel/index.ts';
import { SettingsArea } from '../../components/organisms/SettingsArea/index.ts';
import { ArrowBack, ChatAdd, Logout, Settings, Photo } from '../../assets/icons/index.ts';
import settingsPageTemplate from './SettingsPage.hbs?raw';

export class SettingsPage extends Block {
  constructor() {
    super({
      MainLayout: new MainLayout({
        pageClass: 'settings-page',
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
          new SettingsArea({
            avatarSrc:
              'https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=2070&auto=format&fit=crop',
            iconPhoto: Photo,
            userName: 'Иван Иванов',
            profile: {
              onChangePassword(event) {
                event.preventDefault();
                console.log('Change Password clicked');
              },
              firstName: 'Иван',
              secondName: 'Иванов',
              displayName: 'user777',
              email: 'user777@yandex.ru',
              phone: '8 800 555 3 555',
              login: 'user777',
            },
            onAvatarChange(event) {
              event.preventDefault();
              const input = event.target as HTMLInputElement;
              if (input.files && input.files[0]) {
                const file = input.files[0];
                console.log('Selected file:', file);
              }
            }
          }),
        ],
      }),
    });
  }

  override render() {
    return settingsPageTemplate;
  }
}
