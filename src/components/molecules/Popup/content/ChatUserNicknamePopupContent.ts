import Block, { type BlockProps } from '../../../../framework/Block.ts';
import { Input } from '../../../atoms/Input/index.ts';
import { Button } from '../../../atoms/Button/index.ts';
import template from './ChatUserNicknamePopupContent.hbs?raw';

interface ChatUserNicknamePopupContentProps extends BlockProps {
  onSubmit: (nickname: string) => Promise<void> | void;
  onCancel: () => void;
  chatTitle?: string;
}

export class ChatUserNicknamePopupContent extends Block<ChatUserNicknamePopupContentProps & { errorMessage: string | null; description: string }> {
  private nicknameInput: Input;

  private submitButton: Button;

  constructor(props: ChatUserNicknamePopupContentProps) {
    const nicknameInput = new Input({
      name: 'nickname',
      id: 'chat-user-nickname',
      type: 'text',
      placeholder: 'Введите никнейм',
      label: 'Никнейм',
      class: 'input__control--white',
    });

    const submitButton = new Button({
      id: 'chat-user-nickname-submit',
      type: 'submit',
      class: 'button--primary',
      text: 'Добавить',
    });

    const cancelButton = new Button({
      id: 'chat-user-nickname-cancel',
      type: 'button',
      class: 'button--link',
      text: 'Отмена',
      onClick: () => {
        props.onCancel();
      },
    });

    const targetChatName = props.chatTitle ? ` "${props.chatTitle}"` : '';
    const addSuffix = props.chatTitle ? ` в чат${targetChatName}` : ' в чат';
    const description = `Укажите никнейм пользователя, которого хотите добавить${addSuffix}.`;

    super({
      ...props,
      description,
      errorMessage: null,
      events: {
        submit: (event: Event) => {
          void this.handleSubmit(event);
        },
        input: () => {
          if (this.props.errorMessage) {
            this.clearError();
          }
        },
      },
      NicknameInput: nicknameInput,
      SubmitButton: submitButton,
      CancelButton: cancelButton,
    });

    this.nicknameInput = nicknameInput;
    this.submitButton = submitButton;
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const target = event.target;
    const formElement =
      target instanceof HTMLFormElement ? target : this.element?.querySelector('form');
    if (!(formElement instanceof HTMLFormElement)) return;

    const formData = new FormData(formElement);
    const rawNickname = formData.get('nickname');
    const nickname = typeof rawNickname === 'string' ? rawNickname.trim() : '';

    if (!nickname) {
      this.showError('Введите никнейм пользователя');
      return;
    }

    this.clearError();
    this.setLoading(true);
    try {
      await this.props.onSubmit(nickname);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить чат';
      this.showError(message);
    } finally {
      this.setLoading(false);
    }
  }

  private clearError(): void {
    this.nicknameInput.setProps({ error: undefined });
    this.setProps({ errorMessage: null });
  }

  private showError(message: string): void {
    this.nicknameInput.setProps({ error: message });
    this.setProps({ errorMessage: message });
  }

  private setLoading(isLoading: boolean): void {
    this.submitButton.setProps({ disabled: isLoading });
    this.nicknameInput.setProps({ disabled: isLoading });
  }

  override render(): string {
    return template;
  }
}

export default ChatUserNicknamePopupContent;
