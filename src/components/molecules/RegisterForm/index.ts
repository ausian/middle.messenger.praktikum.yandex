import Block, { type BlockProps } from '../../../framework/Block.ts';
import { withStore } from '../../../framework/withStore.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import registerFormTemplate from './RegisterForm.hbs?raw';
import { router, APP_ROUTES } from '../../../App.ts';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import './RegisterForm.pcss';
import FormValidator from '../../../utils/FormValidator.ts';
import authController from '../../../controllers/AuthController.ts';
import store from '../../../framework/Store.ts';
import type { SignUpRequest } from '../../../api/AuthAPI.ts';
import type { AppState } from '../../../framework/Store.ts';

interface RegisterFormProps extends BlockProps {
  authError: string | null;
  isLoading: boolean;
}

class RegisterFormBase extends Block<RegisterFormProps> {
  constructor(props?: RegisterFormProps) {
    const initialProps: RegisterFormProps = props ?? {
      authError: null,
      isLoading: false,
    };
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

    const handleSubmit = async (event: Event) => {
      if (event.defaultPrevented) return;

      validator.handleSubmit(event);
      if (event.defaultPrevented) return;

      const formData = getFormDataFromButton(event);
      if (!formData) return;

      const payload: SignUpRequest = {
        first_name: formData.first_name ?? '',
        second_name: formData.second_name ?? '',
        login: formData.login ?? '',
        email: formData.email ?? '',
        password: formData.password ?? '',
        phone: formData.phone ?? '',
      };

      try {
        await authController.signUp(payload);
        router.go(APP_ROUTES.chat);
      } catch (error) {
        console.error('Registration failed', error);
      }
    };

    super({
      ...initialProps,
      events: {
        focusout: validator.handleBlur,
        click: validator.handleClick,
        submit: (event: Event) => {
          void handleSubmit(event);
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
        text: initialProps.isLoading ? 'Создание...' : 'Создать профиль',
        disabled: initialProps.isLoading,
      }),
      LoginButton: new Button({
        class: 'button--link',
        id: 'login-button',
        type: 'button',
        text: 'Войти',
        onClick: () => {
          router.go(APP_ROUTES.login);
        },
      }),
    });

  }

  override componentDidUpdate(oldProps: RegisterFormProps, newProps: RegisterFormProps): boolean {
    void oldProps;
    const registerButton = this.children.RegisterButton as Button;

    registerButton.setProps({
      text: newProps.isLoading ? 'Создание...' : 'Создать профиль',
      disabled: Boolean(newProps.isLoading),
    });

    return true;
  }

  override componentDidMount(): void {
    super.componentDidMount();
    void this.redirectIfAuthorized();
  }

  private async redirectIfAuthorized(): Promise<void> {
    if (store.getState().user) {
      router.go(APP_ROUTES.chat);
      return;
    }

    const user = await authController.fetchCurrentUser();
    if (user) {
      router.go(APP_ROUTES.chat);
    }
  }

  override render(): string {
    return registerFormTemplate;
  }
}

const mapStateToProps = (state: AppState) => ({
  authError: state.auth.error,
  isLoading: state.auth.isLoading,
});

const RegisterFormConnected = withStore(mapStateToProps)(RegisterFormBase);

export { RegisterFormConnected as RegisterForm };
