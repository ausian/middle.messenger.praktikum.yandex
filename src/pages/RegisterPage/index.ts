import Block from '../../framework/Block.ts';
import { AuthLayoutBlock } from '../../components/layouts/AuthLayout/index.ts';
import { RegisterForm } from '../../components/molecules/RegisterForm/index.ts';
import './RegisterPage.pcss';

export class RegisterPage extends Block {
  constructor() {
    super({
      AuthLayout: new AuthLayoutBlock({
        pageClass: 'register-page',
        children: new RegisterForm(),
      }),
    });
  }

  override render() {
    return `{{{ AuthLayout }}}`;
  }
}
