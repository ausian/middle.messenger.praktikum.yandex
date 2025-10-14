import Block, { type BlockProps } from '../../../../framework/Block.ts';
import { Button } from '../../../atoms/Button/index.ts';
import template from './ChatActionSelectPopupContent.hbs?raw';

export type ChatActionType = 'add' | 'remove' | 'delete';

interface ChatActionSelectPopupContentProps extends BlockProps {
  onSelect: (action: ChatActionType) => void;
  onDelete: () => void | Promise<void>;
}

export class ChatActionSelectPopupContent extends Block<ChatActionSelectPopupContentProps> {
  constructor(props: ChatActionSelectPopupContentProps) {
    const handleDeleteClick = (_event: Event): void => {
      void _event;
      const confirmed = window.confirm('Вы действительно хотите удалить чат?');
      if (!confirmed) return;

      void props.onDelete();
    };

    const addButton = new Button({
      id: 'chat-action-add',
      type: 'button',
      class: 'button--primary',
      text: 'Добавить пользователя',
      onClick: () => {
        props.onSelect('add');
      },
    });

    const removeButton = new Button({
      id: 'chat-action-remove',
      type: 'button',
      text: 'Удалить пользователя',
      onClick: () => {
        props.onSelect('remove');
      },
    });

    const deleteButton = new Button({
      id: 'chat-action-delete',
      type: 'button',
      text: 'Удалить чат',
      onClick: handleDeleteClick,
    });

    const cancelButton = new Button({
      id: 'chat-action-cancel',
      type: 'button',
      class: 'button--link',
      text: 'Отмена',
      onClick: handleDeleteClick,
    });

    super({
      ...props,
      AddButton: addButton,
      RemoveButton: removeButton,
      CancelButton: cancelButton,
      DeleteButton: deleteButton,
    });
  }

  override render(): string {
    return template;
  }
}

export default ChatActionSelectPopupContent;
