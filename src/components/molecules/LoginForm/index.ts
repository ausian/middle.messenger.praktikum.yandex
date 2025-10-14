import Block, { type BlockProps } from '../../../framework/Block.ts';
import { withStore } from '../../../framework/withStore.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import LoginFormTemplate from './LoginForm.hbs?raw';
import { router, APP_ROUTES } from '../../../App.ts';
import './LoginForm.pcss';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import FormValidator from '../../../utils/FormValidator.ts';
import authController from '../../../controllers/AuthController.ts';
import store from '../../../framework/Store.ts';
import type { SignInRequest } from '../../../api/AuthAPI.ts';
import type { AppState } from '../../../framework/Store.ts';

interface LoginFormProps extends BlockProps {
  authError: string | null;
  isLoading: boolean;
}

class LoginFormBase extends Block<LoginFormProps> {
  constructor(props?: LoginFormProps) {
    const initialProps: LoginFormProps = props ?? {
      authError: null,
      isLoading: false,
    };

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

    const handleSubmit = async (event: Event) => {
      if (event.defaultPrevented) return;

      validator.handleSubmit(event);
      if (event.defaultPrevented) return;

      const formData = getFormDataFromButton(event);
      if (!formData) return;

      const payload: SignInRequest = {
        login: formData.login ?? '',
        password: formData.password ?? '',
      };

      try {
        await authController.signIn(payload);
        router.go(APP_ROUTES.chat);
      } catch (error) {
        console.error('Login failed', error);
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
      LoginInput: loginInput,
      PasswordInput: passwordInput,
      LoginButton: new Button({
        class: 'button--primary',
        id: 'login-button',
        type: 'submit',
        text: initialProps.isLoading ? 'Входим...' : 'Войти',
        disabled: initialProps.isLoading,
      }),
      RegisterButton: new Button({
        class: 'button--link',
        id: 'register-button',
        type: 'button',
        text: 'Нет профиля?',
        onClick: () => {
          router.go(APP_ROUTES.register);
        },
      }),
    });
  }

  override componentDidUpdate(oldProps: LoginFormProps, newProps: LoginFormProps): boolean {
    void oldProps;
    const loginButton = this.children.LoginButton as Button;

    loginButton.setProps({
      text: newProps.isLoading ? 'Входим...' : 'Войти',
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
    return LoginFormTemplate;
  }
}

const mapStateToProps = (state: AppState) => ({
  authError: state.auth.error,
  isLoading: state.auth.isLoading,
});

const LoginFormConnected = withStore(mapStateToProps)(LoginFormBase);

export { LoginFormConnected as LoginForm };
