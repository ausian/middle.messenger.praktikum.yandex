import Block, { type BlockProps } from '../../../../framework/Block.ts';
import { Input } from '../../../atoms/Input/index.ts';
import { Button } from '../../../atoms/Button/index.ts';
import template from './CreateChatPopupContent.hbs?raw';

interface CreateChatPopupContentProps extends BlockProps {
  onSubmit: (title: string) => Promise<void> | void;
  onCancel: () => void;
}

export class CreateChatPopupContent extends Block<CreateChatPopupContentProps & { errorMessage: string | null }> {
  private titleInput: Input;

  private submitButton: Button;

  constructor(props: CreateChatPopupContentProps) {
    const titleInput = new Input({
      name: 'title',
      id: 'new-chat-title',
      type: 'text',
      placeholder: 'Название чата',
      label: 'Название чата',
      class: 'input__control--white',
    });

    const submitButton = new Button({
      id: 'create-chat-submit',
      type: 'submit',
      class: 'button--primary',
      text: 'Создать',
    });

    const cancelButton = new Button({
      id: 'create-chat-cancel',
      type: 'button',
      class: 'button--link',
      text: 'Отмена',
      onClick: () => {
        props.onCancel();
      },
    });

    super({
      ...props,
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
      ChatTitleInput: titleInput,
      SubmitButton: submitButton,
      CancelButton: cancelButton,
    });

    this.titleInput = titleInput;
    this.submitButton = submitButton;
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const target = event.target;
    const formElement =
      target instanceof HTMLFormElement ? target : this.element?.querySelector('form');
    if (!(formElement instanceof HTMLFormElement)) return;

    const formData = new FormData(formElement);
    const rawTitle = formData.get('title');
    const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';

    if (!title) {
      this.showError('Введите название чата');
      return;
    }

    this.clearError();
    this.setLoading(true);
    try {
      await this.props.onSubmit(title);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать чат';
      this.showError(message);
    } finally {
      this.setLoading(false);
    }
  }

  private clearError(): void {
    this.titleInput.setProps({ error: undefined });
    this.setProps({ errorMessage: null });
  }

  private showError(message: string): void {
    this.titleInput.setProps({ error: message });
    this.setProps({ errorMessage: message });
  }

  private setLoading(isLoading: boolean): void {
    this.submitButton.setProps({ disabled: isLoading });
    this.titleInput.setProps({ disabled: isLoading });
  }

  override render(): string {
    return template;
  }
}

export default CreateChatPopupContent;
