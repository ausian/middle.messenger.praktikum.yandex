import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Button } from '../../atoms/Button/index.ts';
import errorBannerTemplate from './ErrorBanner.hbs?raw';
import './ErrorBanner.pcss';

interface ErrorBannerProps extends BlockProps {
  code: string;
  text: string;
}

export class ErrorBanner extends Block<ErrorBannerProps> {
  constructor(props: ErrorBannerProps) {
    super({
      ...props,
      ChatButton: new Button({
        id: 'error-to-chat',
        type: 'button',
        class: 'button--primary',
        text: 'В чат',
        onClick: () => console.log('Переход в чат'),
      }),
    });
  }

  override render() {
    return errorBannerTemplate;
  }
}
