import Block, { type BlockProps } from '../../framework/Block.ts';
import { withStore } from '../../framework/withStore.ts';
import { MainLayout } from '../../components/layouts/MainLayout/index.ts';
import { SettingsPanel } from '../../components/organisms/SettingsPanel/index.ts';
import { SettingsArea, type SettingsAreaProps } from '../../components/organisms/SettingsArea/index.ts';
import type { ProfileFormProps } from '../../components/molecules/ProfileForm/index.ts';
import type { PasswordFormProps } from '../../components/molecules/PasswordForm/index.ts';
import { ArrowBack, ChatAdd, Logout, Settings, Photo } from '../../assets/icons/index.ts';
import settingsPageTemplate from './SettingsPage.hbs?raw';
import type { AppState, AppUser } from '../../framework/Store.ts';
import getFormDataFromButton from '../../utils/getFormDataFromButton.ts';
import userController from '../../controllers/UserController.ts';
import type { ChangePasswordRequest, UpdateProfileRequest } from '../../api/types.ts';
import { buildResourceUrl } from '../../utils/resource.ts';
import authController from '../../controllers/AuthController.ts';
import { router, APP_ROUTES } from '../../App.ts';
import store from '../../framework/Store.ts';
import { showPopup } from '../../utils/popupService.ts';

interface SettingsPageProps extends BlockProps {
  user: AppUser | null;
}

const buildSettingsArea = (user: AppUser | null): SettingsArea => {
  const fullNameParts = [user?.first_name ?? '', user?.second_name ?? '']
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const fallbackName = user?.login ?? 'Гость';
  const userName = fullNameParts.length > 0 ? fullNameParts.join(' ') : fallbackName;

  const handleAvatarChange = (event: Event) => {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    if (!file) return;

    void (async () => {
      try {
        await userController.updateAvatar(file);
        showPopup({
          title: 'Готово',
          message: 'Аватар обновлен',
          type: 'success',
          duration: 3000,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось обновить аватар';
        showPopup({
          title: 'Ошибка',
          message,
          type: 'error',
        });
        console.error('Failed to update avatar', error);
      } finally {
        if (input) input.value = '';
      }
    })();
  };

  const settingsAreaProps: SettingsAreaProps = {
    iconPhoto: Photo,
    userName,
    onAvatarChange: handleAvatarChange,
  };

  const avatarSrc = buildResourceUrl(user?.avatar ?? null);
  if (avatarSrc) {
    settingsAreaProps.avatarSrc = avatarSrc;
  }

  if (user) {
    const handleProfileSave = (event: Event) => {
      const formData = getFormDataFromButton(event);
      if (!formData) return;

      const payload: UpdateProfileRequest = {
        first_name: formData.first_name ?? '',
        second_name: formData.second_name ?? '',
        display_name: (formData.display_name ?? '').trim() || null,
        login: formData.login ?? '',
        email: formData.email ?? '',
        phone: formData.phone ?? '',
      };

      void (async () => {
        try {
          await userController.updateProfile(payload);
          showPopup({
            title: 'Готово',
            message: 'Профиль обновлен',
            type: 'success',
            duration: 3000,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Не удалось обновить профиль';
          showPopup({
            title: 'Ошибка',
            message,
            type: 'error',
          });
          console.error('Failed to update profile', error);
        }
      })();
    };

    const handlePasswordSave = (event: Event) => {
      const formData = getFormDataFromButton(event);
      if (!formData) return;

      const payload: ChangePasswordRequest = {
        oldPassword: formData.oldPassword ?? '',
        newPassword: formData.newPassword ?? '',
      };

      void (async () => {
        try {
          await userController.changePassword(payload);
          showPopup({
            title: 'Готово',
            message: 'Пароль изменен',
            type: 'success',
            duration: 3000,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Не удалось изменить пароль';
          showPopup({
            title: 'Ошибка',
            message,
            type: 'error',
          });
          console.error('Failed to change password', error);
        }
      })();
    };

    const profileProps: ProfileFormProps = {
      firstName: user.first_name,
      secondName: user.second_name,
      email: user.email,
      phone: user.phone,
      login: user.login,
      onSave: handleProfileSave,
    };

    if (user.display_name !== null) {
      profileProps.displayName = user.display_name;
    }

    settingsAreaProps.profile = profileProps;

    const passwordProps: PasswordFormProps = {
      onSave: handlePasswordSave,
    };

    settingsAreaProps.password = passwordProps;
  }

  return new SettingsArea(settingsAreaProps);
};

class SettingsPageBase extends Block<SettingsPageProps> {
  private mainLayout: MainLayout;

  private settingsArea: SettingsArea;

  constructor(props: SettingsPageProps = { user: null }) {
    const settingsArea = buildSettingsArea(props.user ?? null);
    const mainLayout = new MainLayout({
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
      mainArea: [settingsArea],
    });

    super({
      MainLayout: mainLayout,
    });

    this.mainLayout = mainLayout;
    this.settingsArea = settingsArea;
  }

  override componentDidMount(): void {
    super.componentDidMount();
    void this.ensureAuthorized();
  }

  override componentDidUpdate(oldProps: SettingsPageProps, newProps: SettingsPageProps): boolean {
    if (oldProps.user === newProps.user) {
      return false;
    }

    this.settingsArea = buildSettingsArea(newProps.user ?? null);
    this.mainLayout.setLists({ mainArea: [this.settingsArea] });

    return true;
  }

  private async ensureAuthorized(): Promise<void> {
    let user = store.getState().user;
    if (!user) {
      user = await authController.fetchCurrentUser();
      if (!user) {
        router.go(APP_ROUTES.login);
        return;
      }
    }
  }

  override render() {
    return settingsPageTemplate;
  }
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
});

export const SettingsPage = withStore(mapStateToProps)(SettingsPageBase);
