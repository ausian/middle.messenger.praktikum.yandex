import Block, { type BlockProps } from '../../../framework/Block.ts';
import ButtonTemplate from './Button.hbs?raw';
import './Button.pcss';

interface ButtonProps extends BlockProps {
  text?: string;
  id: string;
  type: string;
  class?: string;
  icon?: string;
  active?: boolean;
  onClick?: (e: Event) => void | ((e: MouseEvent) => void);
}

export class Button extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    super({
      ...props,
      events: {
        ...(props.events ?? {}),
        click: (e: Event) => {
          if (props.onClick) props.onClick(e);
        },
      }
    });
  }

  override render() {
    return ButtonTemplate;
  }
}
