import Block from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import LoginFormTemplate from './LoginForm.hbs?raw';
import { app } from '../../../App.ts';
import './LoginForm.pcss';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import FormValidator from '../../../utils/FormValidator.ts';

export class LoginForm extends Block {
  constructor() {
    const loginInput = new Input({
      class: 'input__control--gray',
      name: 'login',
      id: 'login',
      type: 'text',
      placeholder: 'Ваш логин',
      label: 'Логин',
    });

    const passwordInput = new Input({
      class: 'input__control--gray',
      name: 'password',
      id: 'password',
      type: 'password',
      placeholder: 'Ваш пароль',
      label: 'Пароль',
    });

    const validator = new FormValidator({
      login: loginInput,
      password: passwordInput,
    });

    super({
      events: {
        focusout: validator.handleBlur,
        click: validator.handleClick,
        submit: (event: Event) => {
          if (event.defaultPrevented) return;
          validator.handleSubmit(event);
          if (event.defaultPrevented) return;
          getFormDataFromButton(event);
        },
      },
      LoginInput: loginInput,
      PasswordInput: passwordInput,
      LoginButton: new Button({
        class: 'button--primary',
        id: 'login-button',
        type: 'submit',
        text: 'Войти',
      }),
      RegisterButton: new Button({
        class: 'button--link',
        id: 'register-button',
        type: 'button',
        text: 'Нет профиля?',
        onClick: () => {
          app.navigateTo('register');
        },
      }),
    });
  }

  override render() {
    return LoginFormTemplate;
  }
}
