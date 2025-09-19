import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import profileFormTemplate from './ProfileForm.hbs?raw';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import './ProfileForm.pcss';
import FormValidator from '../../../utils/FormValidator.ts';

export interface ProfileFormProps extends BlockProps {
  firstName?: string;
  secondName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  login?: string;
  onSave?: (event: Event) => void;
  onChangePassword?: (event: Event) => void;
}

export class ProfileForm extends Block<ProfileFormProps> {
  constructor(props: ProfileFormProps = {}) {
    const {
      firstName,
      secondName,
      displayName,
      email,
      phone,
      login,
      onSave,
      onChangePassword,
    } = props;

    const firstNameInput = new Input({
      class: 'input__control--gray',
      name: 'first_name',
      id: 'first_name',
      type: 'text',
      placeholder: 'Введите имя',
      label: 'Имя',
      value: firstName,
    });

    const secondNameInput = new Input({
      class: 'input__control--gray',
      name: 'second_name',
      id: 'second_name',
      type: 'text',
      placeholder: 'Введите фамилию',
      label: 'Фамилия',
      value: secondName,
    });

    const displayNameInput = new Input({
      class: 'input__control--gray',
      name: 'display_name',
      id: 'display_name',
      type: 'text',
      placeholder: 'Введите ник',
      label: 'Ник',
      value: displayName,
    });

    const emailInput = new Input({
      class: 'input__control--gray',
      name: 'email',
      id: 'email',
      type: 'email',
      placeholder: 'Введите email',
      label: 'Email',
      value: email,
    });

    const phoneInput = new Input({
      class: 'input__control--gray',
      name: 'phone',
      id: 'phone',
      type: 'tel',
      placeholder: 'Введите телефон',
      label: 'Телефон',
      value: phone,
    });

    const loginInput = new Input({
      class: 'input__control--gray',
      name: 'login',
      id: 'login',
      type: 'text',
      placeholder: 'Введите логин',
      label: 'Логин',
      value: login,
    });

    const validator = new FormValidator({
      first_name: firstNameInput,
      second_name: secondNameInput,
      email: emailInput,
      phone: phoneInput,
      login: loginInput,
    });

    super({
      ...props,
      events: {
        ...(props.events ?? {}),
        focusout: validator.handleBlur,
        click: validator.handleClick,
        submit: (event: Event) => {
          if (event.defaultPrevented) return;
          validator.handleSubmit(event);
          if (event.defaultPrevented) return;
          getFormDataFromButton(event);
          if (onSave) onSave(event);
        },
      },
      FirstNameInput: firstNameInput,
      SecondNameInput: secondNameInput,
      DisplayNameInput: displayNameInput,
      EmailInput: emailInput,
      PhoneInput: phoneInput,
      LoginInput: loginInput,
      SaveButton: new Button({
        class: 'button--primary profile__action-button',
        id: 'save-profile-button',
        type: 'submit',
        text: 'Сохранить',
      }),
      ChangePasswordButton: new Button({
        class: 'button--link profile__action-button',
        id: 'change-password-button',
        type: 'button',
        text: 'Сменить пароль',
        onClick: (event: Event) => {
          event.preventDefault();
          if (onChangePassword) onChangePassword(event);
        },
      }),
    });
  }

  override render() {
    return profileFormTemplate;
  }
}
