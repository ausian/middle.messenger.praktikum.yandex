import Block from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import { Send } from '../../../assets/icons/index.ts';
import MessageFormTemplate from './MessageForm.hbs?raw';
import getFormDataFromButton from '../../../utils/getFormDataFromButton.ts';
import FormValidator from '../../../utils/FormValidator.ts';

export class MessageForm extends Block {
  constructor() {
    const messageInput = new Input({
      class: 'input__control--white',
      name: 'message',
      id: 'message',
      type: 'text',
      placeholder: 'Начните вводить сообщение',
    });

    const sendButton = new Button({
      class: 'button--primary',
      id: 'send-message',
      type: 'submit',
      icon: Send,
    });

    const validator = new FormValidator({
      message: messageInput,
    });

    super({
      events: {
        focusout: validator.handleBlur,
        click: validator.handleClick,
        submit: (event: Event) => {
          if (event.defaultPrevented) return;
          validator.handleSubmit(event);
          if (event.defaultPrevented) return;
          getFormDataFromButton(event);
        },
      },
      messageInput,
      sendButton,
    });
  }

  override render() {
    return MessageFormTemplate;
  }
}
