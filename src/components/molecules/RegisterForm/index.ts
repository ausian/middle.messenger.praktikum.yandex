import Block from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import registerFormTemplate from './RegisterForm.hbs?raw';
import { app } from '../../../App.ts';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import './RegisterForm.pcss';
import FormValidator from '../../../utils/FormValidator.ts';

export class RegisterForm extends Block {
  constructor() {
    super({
      events: {
        submit: (event: Event) => {
          if (event.defaultPrevented) return;
          getFormDataFromButton(event);
        },
      },
      FirstNameInput: new Input({
        class: 'input__control--gray',
        name: 'first_name',
        id: 'first_name',
        type: 'text',
        placeholder: 'Ваше имя*',
        label: 'Имя*',
      }),
      SecondNameInput: new Input({
        class: 'input__control--gray',
        name: 'second_name',
        id: 'second_name',
        type: 'text',
        placeholder: 'Ваша фамилия',
        label: 'Фамилия',
      }),
      LoginInput: new Input({
        class: 'input__control--gray',
        name: 'login',
        id: 'login',
        type: 'text',
        placeholder: 'Ваш логин',
        label: 'Логин*',
      }),
      EmailInput: new Input({
        class: 'input__control--gray',
        name: 'email',
        id: 'email',
        type: 'email',
        placeholder: 'Ваш Email*',
        label: 'Email*',
      }),
      PasswordInput: new Input({
        class: 'input__control--gray',
        name: 'password',
        id: 'password',
        type: 'password',
        placeholder: 'Ваш пароль*',
        label: 'Пароль*',
      }),
      PhoneInput: new Input({
        class: 'input__control--gray',
        name: 'phone',
        id: 'phone',
        type: 'tel',
        placeholder: 'Ваш телефон',
        label: 'Телефон',
      }),
      RegisterButton: new Button({
        class: 'button--primary',
        id: 'register-button',
        type: 'submit',
        text: 'Создать профиль',
      }),
      LoginButton: new Button({
        class: 'button--link',
        id: 'login-button',
        type: 'button',
        text: 'Войти',
        onClick: () => { app.navigateTo('login'); },
      }),
    });
  }

  override componentDidMount(): void {
    new FormValidator(this, {
      first_name: this.children.FirstNameInput as Input,
      second_name: this.children.SecondNameInput as Input,
      login: this.children.LoginInput as Input,
      email: this.children.EmailInput as Input,
      password: this.children.PasswordInput as Input,
      phone: this.children.PhoneInput as Input,
    });
  }

  override render() {
    return registerFormTemplate;
  }
}
