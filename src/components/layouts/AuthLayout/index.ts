import Block, { type BlockProps } from '../../../framework/Block.ts';
import AuthLayout from './AuthLayout.hbs?raw';
import { Footer } from '../../organisms/Footer/index.ts';
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
      Footer: new Footer(),
    });
  }

  override render() {
    return AuthLayout;
  }
}
