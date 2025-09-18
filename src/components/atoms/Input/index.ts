import Block from '../../../framework/Block.ts';
import InputTemplate from './Input.hbs?raw';
import './Input.pcss';

type InputProps = {
  name: string;
  id: string;
  type: string;
  placeholder: string;
  placeholderPersistent?: string;
  label?: string | undefined;
  error?: string | undefined;
  value?: string | undefined;
  class?: string | undefined;
  hideError?: boolean;
};

export class Input extends Block<InputProps> {
  constructor(props: InputProps) {
    super({
      ...props,
      placeholderPersistent: props.placeholder,
      attr: { class: 'input' },
    });
  }

  override render() {
    return InputTemplate;
  }
}
