import Block, { type BlockProps } from '../../../framework/Block.ts';
import { withStore } from '../../../framework/withStore.ts';
import { Button } from '../../atoms/Button/index.ts';
import messageAreaTemplate from './MessageArea.hbs?raw';
import { More, Photo } from '../../../assets/icons/index.ts';
import { MessageList, type MessageListItem } from '../MessageList/index.ts';
import { MessageForm } from '../../molecules/MessageForm/index.ts';
import {
  ChatAvatarUploader,
  type ChatAvatarUploaderProps,
} from '../../molecules/ChatAvatarUploader/index.ts';
import './MessageArea.pcss';
import type {
  ChatDTO,
  ChatMessageDTO,
  ChatUserDTO,
} from '../../../api/types.ts';
import type { AppState } from '../../../framework/Store.ts';
import chatController from '../../../controllers/ChatController.ts';
import { formatDateLabel, formatTime } from '../../../utils/date.ts';
import { buildResourceUrl } from '../../../utils/resource.ts';
import { Message, type MessageProps } from '../../atoms/Message/index.ts';
import { hidePopup, showPopup } from '../../../utils/popupService.ts';
import {
  ChatActionSelectPopupContent,
  ChatUserNicknamePopupContent,
  ChatUserRemovalPopupContent,
} from '../../molecules/Popup/content/index.ts';

interface MessageAreaProps extends BlockProps {
  chat: ChatDTO | null;
  messages: ChatMessageDTO[];
  isMessagesLoading: boolean;
  currentUserId: number | null;
  chatUsers: ChatUserDTO[];
}

interface MessageAreaInternalProps extends MessageAreaProps {
  hasActiveChat: boolean;
  chatName: string;
}

class MessageAreaBase extends Block<MessageAreaInternalProps> {
  private messageList: MessageList;

  private messageForm: MessageForm;

  private chatAvatar: ChatAvatarUploader;

  private chatOptionsButton: Button;

  private isAvatarUploading = false;

  private scrollFrame: number | null = null;

  constructor(
    props: MessageAreaProps = {
      chat: null,
      messages: [],
      isMessagesLoading: false,
      currentUserId: null,
      chatUsers: [],
    },
  ) {
    const hasActiveChat = Boolean(props.chat);
    const chatName = props.chat?.title || 'Выберите чат';

    const messageList = new MessageList({
      isLoading: props.isMessagesLoading,
      items: [],
    });

    const messageForm = new MessageForm({
      disabled: !hasActiveChat,
      onSubmit: (message: string) => {
        try {
          chatController.sendMessage(message);
        } catch (error) {
          console.error('Failed to send message', error);
        }
      },
    });

    const chatAvatarProps: ChatAvatarUploaderProps = {
      author: props.chat?.title ?? undefined,
      src: buildResourceUrl(props.chat?.avatar) ?? undefined,
      disabled: !hasActiveChat,
      icon: Photo,
      onSelect: (file) => {
        void this.handleChatAvatarSelect(file);
      },
    };

    const chatAvatar = new ChatAvatarUploader(chatAvatarProps);

    const chatOptionsButton = new Button({
      id: 'chat-options',
      type: 'button',
      icon: More,
      disabled: !hasActiveChat,
      onClick: () => {
        void this.handleChatOptionsClick();
      },
    });

    super({
      ...props,
      hasActiveChat,
      chatName,
      MessageForm: messageForm,
      chatAvatar,
      chatOptionsButton,
      MessageList: messageList,
    });

    this.messageList = messageList;
    this.messageForm = messageForm;
    this.chatAvatar = chatAvatar;
    this.chatOptionsButton = chatOptionsButton;

    this.updateMessages(props);
  }

  override componentDidMount(): void {
    this.scheduleScrollToBottom();
  }

  override componentDidUpdate(oldProps: MessageAreaInternalProps, newProps: MessageAreaInternalProps): boolean {
    if (oldProps.chat !== newProps.chat) {
      this.updateChatInfo(newProps.chat);
      this.scheduleScrollToBottom();
    }

    if (oldProps.isMessagesLoading !== newProps.isMessagesLoading) {
      this.messageList.setProps({ isLoading: newProps.isMessagesLoading });
    }

    if (oldProps.messages !== newProps.messages || oldProps.chatUsers !== newProps.chatUsers) {
      this.updateMessages(newProps);
      this.scheduleScrollToBottom();
    }

    const hasActiveChat = Boolean(newProps.chat);
    if (oldProps.hasActiveChat !== hasActiveChat) {
      this.messageForm.setProps({ disabled: !hasActiveChat });
      this.chatOptionsButton.setProps({ disabled: !hasActiveChat });
      this.chatAvatar.setProps({ disabled: !hasActiveChat });
      this.setProps({ hasActiveChat, chatName: newProps.chat?.title || 'Выберите чат' });
    }

    return true;
  }

  private updateChatInfo(chat: ChatDTO | null): void {
    const chatName = chat?.title || 'Выберите чат';
    this.setProps({ chatName });
    this.chatAvatar.setProps({
      author: chat?.title ?? undefined,
      src: buildResourceUrl(chat?.avatar) ?? undefined,
      disabled: !chat,
    });
  }

  private async handleChatAvatarSelect(file: File): Promise<void> {
    if (this.isAvatarUploading) {
      return;
    }

    this.isAvatarUploading = true;
    this.chatAvatar.setProps({ disabled: true });

    try {
      await chatController.updateChatAvatar(file);
      showPopup({
        title: 'Готово',
        message: 'Аватар чата обновлен',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить аватар чата';
      showPopup({
        title: 'Ошибка',
        message,
        type: 'error',
      });
      console.error('Failed to update chat avatar', error);
    } finally {
      this.isAvatarUploading = false;
      const hasChat = Boolean(this.props.chat);
      this.chatAvatar.setProps({ disabled: !hasChat });
    }
  }

  private updateMessages(props: MessageAreaProps): void {
    const items = this.buildMessageItems(
      props.messages,
      props.currentUserId,
      props.chatUsers,
    );

    this.messageList.setProps({
      items,
      isLoading: props.isMessagesLoading,
    });
  }

  private buildMessageItems(
    messages: ChatMessageDTO[],
    currentUserId: number | null,
    users: ChatUserDTO[],
  ): MessageListItem[] {
    const sorted = [...messages].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    const items: MessageListItem[] = [];
    let lastLabel: string | null = null;

    sorted.forEach((message) => {
      const label = formatDateLabel(message.time);
      if (label && label !== lastLabel) {
        items.push(`<div class="message-list__date-badge">${label}</div>`);
        lastLabel = label;
      }

      const author = this.resolveUserName(message.user_id, users);
      const time = formatTime(message.time);

      let text = message.content;
      if (message.type === 'file' && message.file) {
        text = `Файл: ${message.file.filename}`;
      }

      const outgoing = currentUserId != null && message.user_id === currentUserId;

      const messageProps: MessageProps = {
        text,
        outgoing,
      };

      if (!outgoing) {
        messageProps.author = author;
      }

      if (time) {
        messageProps.time = time;
      }

      items.push(new Message(messageProps));
    });

    return items;
  }

  private resolveUserName(userId: number, users: ChatUserDTO[]): string {
    const user = users.find((candidate) => candidate.id === userId);
    if (!user) return 'Неизвестный';
    if (user.first_name) {
      return `${user.first_name}${user.second_name ? ` ${user.second_name}` : ''}`;
    }
    const parts = [user.first_name, user.second_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.login;
  }

  private handleChatOptionsClick(): void {
    const chat = this.props.chat;
    if (!chat) return;

    this.showChatActionPopup(chat);
  }

  private showChatActionPopup(chat: ChatDTO): void {
    const actionPopup = new ChatActionSelectPopupContent({
      onSelect: (action) => {
        if (action === 'add') {
          this.showAddChatUserPopup(chat);
        } else if (action === 'remove') {
          this.showRemoveChatUserPopup(chat);
        }
      },
      onDelete: async () => {
        try {
          await chatController.deleteSelectedChat();
          hidePopup();
          showPopup({
            title: 'Готово',
            message: `Чат "${chat.title}" удален`,
            type: 'success',
            duration: 3000,
          });
        } catch (error) {
          console.error('Failed to delete chat', error);
          const message = error instanceof Error ? error.message : 'Не удалось удалить чат';
          showPopup({
            title: 'Ошибка',
            message,
            type: 'error',
            duration: 4000,
          });
        }
      },
    });

    showPopup({
      title: 'Участники чата',
      content: actionPopup,
    });
  }

  private showAddChatUserPopup(chat: ChatDTO): void {
    const nicknamePopup = new ChatUserNicknamePopupContent({
      chatTitle: chat.title,
      onCancel: () => {
        hidePopup();
      },
      onSubmit: async (nickname) => {
        try {
          await chatController.addUserByNickname(nickname);
          hidePopup();
          showPopup({
            title: 'Готово',
            message: `Пользователь ${nickname} добавлен в чат "${chat.title}"`,
            type: 'success',
            duration: 3000,
          });
        } catch (error) {
          console.error('Failed to add chat user', error);
          throw error;
        }
      },
    });

    showPopup({
      title: 'Добавление участника',
      content: nicknamePopup,
    });
  }

  private showRemoveChatUserPopup(chat: ChatDTO): void {
    const removalPopup = new ChatUserRemovalPopupContent({
      chatTitle: chat.title,
      users: this.props.chatUsers,
      currentUserId: this.props.currentUserId,
      onCancel: () => {
        hidePopup();
      },
      onRemove: async (userId: number) => {
        const userName = this.resolveUserName(userId, this.props.chatUsers);
        const displayName = userName === 'Неизвестный' ? 'Пользователь' : userName;
        try {
          await chatController.removeUserById(userId);
          hidePopup();
          showPopup({
            title: 'Готово',
            message: `${displayName} удален из чата "${chat.title}"`,
            type: 'success',
            duration: 3000,
          });
        } catch (error) {
          console.error('Failed to remove chat user', error);
          throw error;
        }
      },
    });

    showPopup({
      title: 'Удаление участника',
      content: removalPopup,
    });
  }

  override render() {
    return messageAreaTemplate;
  }

  private scheduleScrollToBottom(): void {
    if (typeof window === 'undefined') return;

    if (this.scrollFrame != null) {
      cancelAnimationFrame(this.scrollFrame);
    }

    this.scrollFrame = window.requestAnimationFrame(() => {
      this.scrollFrame = null;
      this.scrollMessagesToBottom();
    });
  }

  private scrollMessagesToBottom(): void {
    const container = this.element?.querySelector('.message-area__messages') as HTMLElement | null;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }
}

const mapStateToProps = (state: AppState) => {
  const selectedChatId = state.chats.selectedChatId;
  const chat = selectedChatId
    ? state.chats.list.find(({ id }) => id === selectedChatId) ?? null
    : null;

  return {
    chat,
    messages: selectedChatId ? (state.messages.byChatId[selectedChatId] ?? []) : [],
    isMessagesLoading: state.messages.isLoading,
    currentUserId: state.user?.id ?? null,
    chatUsers: selectedChatId ? (state.chats.usersByChatId[selectedChatId] ?? []) : [],
  } satisfies MessageAreaProps;
};

export const MessageArea = withStore(mapStateToProps)(MessageAreaBase);

export default MessageArea;
