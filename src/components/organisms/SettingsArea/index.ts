import Block, { type BlockProps } from '../../../framework/Block.ts';
import {
  AvatarProfile,
  type AvatarProfileProps,
} from '../../atoms/AvatarProfile/index.ts';
import {
  PasswordForm,
  type PasswordFormProps,
} from '../../molecules/PasswordForm/index.ts';
import {
  ProfileForm,
  type ProfileFormProps,
} from '../../molecules/ProfileForm/index.ts';
import settingsAreaTemplate from './SettingsArea.hbs?raw';
import './SettingsArea.pcss';

interface SettingsAreaProps extends BlockProps {
  avatarSrc?: string;
  iconPhoto: string;
  userName: string;
  profile?: ProfileFormProps;
  password?: PasswordFormProps;
  onAvatarChange?: (event: Event) => void;
}

interface SettingsAreaState {
  showProfileForm: boolean;
  showPasswordForm: boolean;
}

type SettingsAreaInternalProps = SettingsAreaProps & SettingsAreaState;

export class SettingsArea extends Block<SettingsAreaInternalProps> {
  constructor(props: SettingsAreaProps) {
    const {
      avatarSrc,
      iconPhoto,
      userName,
      profile,
      password,
      onAvatarChange,
    } = props;

    const avatarProps: AvatarProfileProps = {
      icon: iconPhoto,
    };

    if (avatarSrc !== undefined) avatarProps.src = avatarSrc;
    if (onAvatarChange) avatarProps.onChange = onAvatarChange;

    let toggleToPasswordForm = () => {};
    let toggleToProfileForm = () => {};

    const profileForm = new ProfileForm({
      ...profile,
      onChangePassword: (event: Event) => {
        toggleToPasswordForm();
        if (profile?.onChangePassword) profile.onChangePassword(event);
      },
    });

    const passwordForm = new PasswordForm({
      ...password,
      onCancel: (event: Event) => {
        toggleToProfileForm();
        if (password?.onCancel) password.onCancel(event);
      },
    });

    super({
      userName,
      showProfileForm: true,
      showPasswordForm: false,
      Avatar: new AvatarProfile(avatarProps),
      ProfileForm: profileForm,
      PasswordForm: passwordForm,
    });

    toggleToPasswordForm = () => {
      this.setProps({
        showProfileForm: false,
        showPasswordForm: true,
      });
    };

    toggleToProfileForm = () => {
      this.setProps({
        showProfileForm: true,
        showPasswordForm: false,
      });
    };
  }

  override render() {
    return settingsAreaTemplate;
  }
}
