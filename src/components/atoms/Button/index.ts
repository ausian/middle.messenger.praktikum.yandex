import Block from '../../../framework/Block.ts';
import ButtonTemplate from './Button.hbs?raw';
import './Button.pcss';

type ButtonProps = {
  text?: string;
  id: string;
  type: string;
  class?: string;
  icon?: string;
  active?: boolean;
  onClick?: (e: Event) => void | ((e: MouseEvent) => void);
  events?: Record<string, EventListener>;
  attr?: Record<string, string>;
};

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
