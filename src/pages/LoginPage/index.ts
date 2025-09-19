import Block from '../../framework/Block.ts';
import { AuthLayoutBlock } from '../../components/layouts/AuthLayout/index.ts';
import { LoginForm } from '../../components/molecules/LoginForm/index.ts';
import './LoginPage.pcss';

export class LoginPage extends Block {
  constructor() {
    super({
      AuthLayout: new AuthLayoutBlock({
        pageClass: 'login-page',
        children: new LoginForm(),
      }),
    });
  }

  override render() {
    return `{{{ AuthLayout }}}`;
  }
}
