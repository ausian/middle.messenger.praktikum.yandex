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
    super({
      events: {
        submit: (e: Event) => {
          if (e.defaultPrevented) return;
          getFormDataFromButton(e);
        },
      },
      LoginInput: new Input({
        class: 'input__control--gray',
        name: 'login',
        id: 'login',
        type: 'text',
        placeholder: 'Ваш логин',
        label: 'Логин',
      }),
      PasswordInput: new Input({
        class: 'input__control--gray',
        name: 'password',
        id: 'password',
        type: 'password',
        placeholder: 'Ваш пароль',
        label: 'Пароль',
      }),
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

  override componentDidMount(): void {
    new FormValidator(this, {
      login: this.children.LoginInput as Input,
      password: this.children.PasswordInput as Input,
    });
  }

  override render() {
    return LoginFormTemplate;
  }
}
