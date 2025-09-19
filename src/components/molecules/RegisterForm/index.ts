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
    const firstNameInput = new Input({
      class: 'input__control--gray',
      name: 'first_name',
      id: 'first_name',
      type: 'text',
      placeholder: 'Ваше имя*',
      label: 'Имя*',
    });

    const secondNameInput = new Input({
      class: 'input__control--gray',
      name: 'second_name',
      id: 'second_name',
      type: 'text',
      placeholder: 'Ваша фамилия',
      label: 'Фамилия',
    });

    const loginInput = new Input({
      class: 'input__control--gray',
      name: 'login',
      id: 'login',
      type: 'text',
      placeholder: 'Ваш логин',
      label: 'Логин*',
    });

    const emailInput = new Input({
      class: 'input__control--gray',
      name: 'email',
      id: 'email',
      type: 'email',
      placeholder: 'Ваш Email*',
      label: 'Email*',
    });

    const passwordInput = new Input({
      class: 'input__control--gray',
      name: 'password',
      id: 'password',
      type: 'password',
      placeholder: 'Ваш пароль*',
      label: 'Пароль*',
    });

    const phoneInput = new Input({
      class: 'input__control--gray',
      name: 'phone',
      id: 'phone',
      type: 'tel',
      placeholder: 'Ваш телефон',
      label: 'Телефон',
    });

    const validator = new FormValidator({
      first_name: firstNameInput,
      second_name: secondNameInput,
      login: loginInput,
      email: emailInput,
      password: passwordInput,
      phone: phoneInput,
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
      FirstNameInput: firstNameInput,
      SecondNameInput: secondNameInput,
      LoginInput: loginInput,
      EmailInput: emailInput,
      PasswordInput: passwordInput,
      PhoneInput: phoneInput,
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
        onClick: () => {
          app.navigateTo('login');
        },
      }),
    });
  }

  override render() {
    return registerFormTemplate;
  }
}
