import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import passwordFormTemplate from './PasswordForm.hbs?raw';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import './PasswordForm.pcss';
import FormValidator from '../../../utils/FormValidator.ts';

export interface PasswordFormProps extends BlockProps {
  onSave?: (event: Event) => void;
  onCancel?: (event: Event) => void;
}

export class PasswordForm extends Block<PasswordFormProps> {
  constructor(props: PasswordFormProps = {}) {
    const { onSave, onCancel } = props;

    const oldPasswordInput = new Input({
      class: 'input__control--gray',
      name: 'oldPassword',
      id: 'oldPassword',
      type: 'password',
      placeholder: 'Введите старый пароль',
      label: 'Старый пароль',
    });

    const newPasswordInput = new Input({
      class: 'input__control--gray',
      name: 'newPassword',
      id: 'newPassword',
      type: 'password',
      placeholder: 'Введите новый пароль',
      label: 'Новый пароль',
    });

    const validator = new FormValidator({
      oldPassword: oldPasswordInput,
      newPassword: newPasswordInput,
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
      OldPasswordInput: oldPasswordInput,
      NewPasswordInput: newPasswordInput,
      SaveButton: new Button({
        class: 'button--primary profile__action-button',
        id: 'save-password-button',
        type: 'submit',
        text: 'Сохранить',
      }),
      CancelButton: new Button({
        class: 'button--link profile__action-button',
        id: 'cancel-password-button',
        type: 'button',
        text: 'Отмена',
        onClick: (event: Event) => {
          event.preventDefault();
          if (onCancel) onCancel(event);
        },
      }),
    });
  }

  override render() {
    return passwordFormTemplate;
  }
}
