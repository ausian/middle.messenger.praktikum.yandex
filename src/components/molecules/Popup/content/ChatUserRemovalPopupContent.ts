import Block, { type BlockProps } from '../../../../framework/Block.ts';
import { Button } from '../../../atoms/Button/index.ts';
import type { ChatUserDTO } from '../../../../api/types.ts';
import template from './ChatUserRemovalPopupContent.hbs?raw';
import { buildResourceUrl } from '../../../../utils/resource.ts';

interface ChatUserRemovalPopupContentProps extends BlockProps {
  users: ChatUserDTO[];
  currentUserId: number | null;
  onRemove: (userId: number) => Promise<void> | void;
  onCancel: () => void;
  chatTitle?: string;
}

interface ChatUserRemovalPopupContentState {
  errorMessage: string | null;
  isProcessing: boolean;
  processingUserId: number | null;
  hasUsers: boolean;
  mappedUsers: Array<{
    id: number;
    name: string;
    roleLabel: string | null;
    avatarSrc: string | null;
    initial: string | null;
  }>;
  description: string;
}

export class ChatUserRemovalPopupContent extends Block<
ChatUserRemovalPopupContentProps & ChatUserRemovalPopupContentState
> {
  constructor(props: ChatUserRemovalPopupContentProps) {
    const cancelButton = new Button({
      id: 'chat-user-remove-cancel',
      type: 'button',
      class: 'button--link',
      text: 'Отмена',
      onClick: () => {
        props.onCancel();
      },
    });

    const removableUsers = ChatUserRemovalPopupContent.getRemovableUsers(props);

    super({
      ...props,
      errorMessage: null,
      isProcessing: false,
      processingUserId: null,
      hasUsers: removableUsers.length > 0,
      CancelButton: cancelButton,
      description: ChatUserRemovalPopupContent.buildDescription(props.chatTitle),
      events: {
        click: (event: Event) => {
          void this.handleClick(event);
        },
      },
    });

    this.setProps({
      mappedUsers: removableUsers.map((user) => ({
        id: user.id,
        ...ChatUserRemovalPopupContent.mapUser(user),
      })),
    });
  }

  override componentDidUpdate(
    oldProps: ChatUserRemovalPopupContentProps & ChatUserRemovalPopupContentState,
    newProps: ChatUserRemovalPopupContentProps & ChatUserRemovalPopupContentState,
  ): boolean {
    const removableUsers = ChatUserRemovalPopupContent.getRemovableUsers(newProps);
    const mappedUsers = removableUsers.map((user) => ({
      id: user.id,
      ...ChatUserRemovalPopupContent.mapUser(user),
    }));

    const hasUsers = mappedUsers.length > 0;
    const currentMappedUsers = Array.isArray(newProps.mappedUsers) ? newProps.mappedUsers : [];
    const usersChanged =
      currentMappedUsers.length !== mappedUsers.length ||
      currentMappedUsers.some((user, index) => user.id !== mappedUsers[index]?.id);

    if (!usersChanged && newProps.hasUsers === hasUsers && oldProps.chatTitle === newProps.chatTitle) {
      return true;
    }

    if (usersChanged || newProps.hasUsers !== hasUsers) {
      this.setProps({
        hasUsers,
        mappedUsers,
      });
    }

    if (oldProps.chatTitle !== newProps.chatTitle) {
      this.setProps({
        description: ChatUserRemovalPopupContent.buildDescription(newProps.chatTitle),
      });
    }

    return true;
  }

  private async handleClick(event: Event): Promise<void> {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest<HTMLButtonElement>('[data-user-id]');
    if (!button) return;

    event.preventDefault();
    if (this.props.isProcessing) return;

    const datasetId = button.dataset.userId;
    if (!datasetId) return;

    const userId = Number(datasetId);
    if (Number.isNaN(userId)) {
      return;
    }

    this.setProps({
      errorMessage: null,
      isProcessing: true,
      processingUserId: userId,
    });

    try {
      await this.props.onRemove(userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить пользователя';
      this.setProps({
        errorMessage: message,
      });
    } finally {
      this.setProps({
        isProcessing: false,
        processingUserId: null,
      });
    }
  }

  private static getRemovableUsers(
    props: Partial<ChatUserRemovalPopupContentProps & ChatUserRemovalPopupContentState>,
  ): ChatUserDTO[] {
    const users = props.users ?? [];
    const currentUserId = props.currentUserId ?? null;
    return users.filter((user) => user.id !== currentUserId);
  }

  private static formatUserName(user: ChatUserDTO): string {
    if (user.display_name) {
      return user.display_name;
    }

    const parts = [user.first_name, user.second_name].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }

    return user.login;
  }

  private static resolveRoleLabel(user: ChatUserDTO): string | null {
    switch (user.role) {
      case 'owner':
        return 'Владелец';
      case 'admin':
        return 'Администратор';
      default:
        return null;
    }
  }

  private static resolveAvatarSrc(user: ChatUserDTO): string | null {
    return buildResourceUrl(user.avatar ?? null);
  }

  private static resolveInitial(name: string): string | null {
    const normalized = name.trim();
    if (!normalized) return null;
    return normalized.charAt(0).toUpperCase();
  }

  private static mapUser(user: ChatUserDTO): {
    name: string;
    roleLabel: string | null;
    avatarSrc: string | null;
    initial: string | null;
  } {
    const name = this.formatUserName(user);
    return {
      name,
      roleLabel: this.resolveRoleLabel(user),
      avatarSrc: this.resolveAvatarSrc(user),
      initial: this.resolveInitial(name),
    };
  }

  private static buildDescription(chatTitle?: string): string {
    if (chatTitle) {
      return `Выберите пользователя, которого хотите удалить из чата "${chatTitle}".`;
    }
    return 'Выберите пользователя, которого хотите удалить из чата.';
  }

  override render(): string {
    return template;
  }
}

export default ChatUserRemovalPopupContent;
