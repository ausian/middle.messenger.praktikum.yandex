import Block from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import { Send } from '../../../assets/icons/index.ts';
import MessageFormTemplate from './MessageForm.hbs?raw';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import FormValidator from '../../../utils/FormValidator.ts';

export class MessageForm extends Block {
  constructor() {
    super({
      events: {
        submit: (e: Event) => {
          if (e.defaultPrevented) return;
          getFormDataFromButton(e);
        },
      },
      messageInput: new Input({
        class: 'input__control--white',
        name: 'message',
        id: 'message',
        type: 'text',
        placeholder: 'Начните вводить сообщение',
      }),
      sendButton: new Button({
        class: 'button--primary',
        id: 'send-message',
        type: 'submit',
        icon: Send,
      }),
    });
  }

  override componentDidMount(): void {
    new FormValidator(this, {
      message: this.children.messageInput as Input,
    });
  }

  override render() {
    return MessageFormTemplate;
  }
}
