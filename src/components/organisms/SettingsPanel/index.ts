import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Button } from '../../atoms/Button/index.ts';
import settingsPanelTemplate from './SettingsPanel.hbs?raw';
import { app } from '../../../App.ts';
import './SettingsPanel.pcss';

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
      }),

      BackButton: new Button({
        id: 'settings-panel__button-back',
        class: 'settings-panel__button',
        type: 'button',
        icon: props.icons.arrowBack,
        onClick: () => {
          window.history.back();
        },
      }),

      LogoutButton: new Button({
        id: 'settings-panel__button-logout',
        class: 'settings-panel__button',
        type: 'button',
        icon: props.icons.logout,
        onClick: () => {
          app.navigateTo('login');
        },
      }),

      SettingsButton: new Button({
        id: 'settings-panel__button-settings',
        class: 'settings-panel__button',
        type: 'button',
        icon: props.icons.settings,
        onClick: () => {
          app.navigateTo('settings');
        },
      }),
    });
  }

  override render() {
    return settingsPanelTemplate;
  }
}
