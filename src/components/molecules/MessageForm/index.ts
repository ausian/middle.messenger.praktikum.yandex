import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import { Send } from '../../../assets/icons/index.ts';
import MessageFormTemplate from './MessageForm.hbs?raw';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import FormValidator from '../../../utils/FormValidator.ts';

export interface MessageFormProps extends BlockProps {
  onSubmit?: (message: string) => void | Promise<void>;
  disabled?: boolean;
}

export class MessageForm extends Block<MessageFormProps> {
  private messageInput: Input;

  private sendButton: Button;

  constructor(props: MessageFormProps = {}) {
    const handleMessageKeydown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      const key = keyboardEvent.key;
      if (key !== 'Enter' && key !== 'NumpadEnter' && key !== 'Return') return;
      if (
        keyboardEvent.shiftKey ||
        keyboardEvent.ctrlKey ||
        keyboardEvent.altKey ||
        keyboardEvent.metaKey ||
        keyboardEvent.repeat
      ) {
        return;
      }

      const target = keyboardEvent.target as HTMLElement | null;
      const form = target?.closest('form');
      if (!form) return;

      keyboardEvent.preventDefault();

      const submitEvent =
        typeof SubmitEvent === 'function'
          ? new SubmitEvent('submit', { bubbles: true, cancelable: true })
          : new Event('submit', { bubbles: true, cancelable: true });

      form.dispatchEvent(submitEvent);
    };

    const messageInput = new Input({
      class: 'input__control--white',
      name: 'message',
      id: 'message',
      type: 'text',
      placeholder: 'Начните вводить сообщение',
      disabled: props.disabled,
    });

    const sendButton = new Button({
      class: 'button--primary',
      id: 'send-message',
      type: 'submit',
      icon: Send,
      disabled: props.disabled,
    });

    const validator = new FormValidator({
      message: messageInput,
    });

    super({
      ...props,
      events: {
        focusout: validator.handleBlur,
        click: validator.handleClick,
        keydown: handleMessageKeydown,
        submit: (event: Event) => {
          if (event.defaultPrevented) return;
          validator.handleSubmit(event);
          if (event.defaultPrevented) return;
          event.preventDefault();

          const formData = getFormDataFromButton(event);
          const message = formData?.message?.trim();
          if (!message) return;

          const result = props.onSubmit?.(message);
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error('Failed to send message', error);
            });
          }
          this.resetForm();
        },
      },
      messageInput,
      sendButton,
    });

    this.messageInput = messageInput;
    this.sendButton = sendButton;
  }

  override componentDidUpdate(oldProps: MessageFormProps, newProps: MessageFormProps): boolean {
    if (oldProps.disabled !== newProps.disabled) {
      const disabled = Boolean(newProps.disabled);
      this.messageInput.setProps({ disabled });
      this.sendButton.setProps({ disabled });
    }

    return true;
  }

  private resetForm(): void {
    const inputProps = this.messageInput.getProps();
    this.messageInput.setProps({
      value: '',
      error: undefined,
      placeholder: inputProps.placeholderPersistent ?? inputProps.placeholder,
    });
  }

  override render() {
    return MessageFormTemplate;
  }
}

export default MessageForm;
