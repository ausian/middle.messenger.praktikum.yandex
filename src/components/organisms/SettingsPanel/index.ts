import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Button } from '../../atoms/Button/index.ts';
import settingsPanelTemplate from './SettingsPanel.hbs?raw';
import { router, APP_ROUTES } from '../../../App.ts';
import './SettingsPanel.pcss';
import authController from '../../../controllers/AuthController.ts';
import chatController from '../../../controllers/ChatController.ts';
import { hidePopup, showPopup } from '../../../utils/popupService.ts';
import { CreateChatPopupContent } from '../../molecules/Popup/content/index.ts';

interface SettingsPanelProps extends BlockProps {
  state: 'chat' | 'settings';
  icons: {
    chatAdd: string;
    arrowBack: string;
    logout: string;
    settings: string;
  };
}

export class SettingsPanel extends Block<SettingsPanelProps> {
  constructor(props: SettingsPanelProps) {
    super({
      ...props,

      NewChatButton: new Button({
        id: 'new-chat-button',
        class: 'settings-panel__button',
        type: 'button',
        icon: props.icons.chatAdd,
        text: '',
        onClick: () => {
          const popupContent = new CreateChatPopupContent({
            onSubmit: async (title) => {
              try {
                await chatController.createChat(title);
                hidePopup();
                showPopup({
                  title: 'Готово',
                  message: `Чат "${title}" создан`,
                  type: 'success',
                  duration: 3000,
                });
              } catch (error) {
                console.error('Failed to create chat', error);
                throw error;
              }
            },
            onCancel: () => {
              hidePopup();
            },
          });

          showPopup({
            title: 'Новый чат',
            content: popupContent,
          });
        },
      }),

      BackButton: new Button({
        id: 'settings-panel__button-back',
        class: 'settings-panel__button',
        type: 'button',
        icon: props.icons.arrowBack,
        onClick: () => {
          router.back();
        },
      }),

      LogoutButton: new Button({
        id: 'settings-panel__button-logout',
        class: 'settings-panel__button',
        type: 'button',
        icon: props.icons.logout,
        onClick: () => {
          void (async () => {
            try {
              await authController.logout();
            } catch (error) {
              console.error('Logout failed', error);
            }
            router.go(APP_ROUTES.login);
          })();
        },
      }),

      SettingsButton: new Button({
        id: 'settings-panel__button-settings',
        class: 'settings-panel__button',
        type: 'button',
        icon: props.icons.settings,
        onClick: () => {
          router.go(APP_ROUTES.settings);
        },
      }),
    });
  }

  override render() {
    return settingsPanelTemplate;
  }
}
