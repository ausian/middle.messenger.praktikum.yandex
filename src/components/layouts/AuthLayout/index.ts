import Block, { type BlockProps } from '../../../framework/Block.ts';
import AuthLayout from './AuthLayout.hbs?raw';
import './AuthLayout.pcss';

interface AuthLayoutProps extends BlockProps {
  pageClass: string;
  children: Block | Block[];
  Footer?: Block;
}

export class AuthLayoutBlock extends Block<AuthLayoutProps> {
  constructor(props: AuthLayoutProps) {
    super({
      ...props,
    });
  }

  override render() {
    return AuthLayout;
  }
}
