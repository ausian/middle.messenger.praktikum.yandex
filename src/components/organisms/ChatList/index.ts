import Block, { type BlockProps } from '../../../framework/Block.ts';
import { withStore } from '../../../framework/withStore.ts';
import chatListTemplate from './ChatList.hbs?raw';
import {
  ChatItem,
  type ChatItemProps,
} from '../../molecules/ChatItem/index.ts';
import { Input } from '../../atoms/Input/index.ts';
import './ChatList.pcss';
import chatController from '../../../controllers/ChatController.ts';
import { buildResourceUrl } from '../../../utils/resource.ts';
import { formatTime } from '../../../utils/date.ts';
import type { AppState } from '../../../framework/Store.ts';
import type { ChatDTO } from '../../../api/types.ts';

interface ChatListProps extends BlockProps {
  chats: ChatDTO[];
  selectedChatId: number | null;
  isLoading: boolean;
  error: string | null;
}

interface ChatListInternalState {
  hasChats: boolean;
  filter: string;
}

type ChatListInternalProps = ChatListProps & ChatListInternalState;

class ChatListBase extends Block<ChatListInternalProps> {
  private isSyncing = false;

  constructor(
    props: ChatListProps = {
      chats: [],
      selectedChatId: null,
      isLoading: false,
      error: null,
    },
  ) {
    const searchInput = new Input({
      class: 'input__square input__square--white',
      name: 'search',
      id: 'search',
      type: 'text',
      placeholder: 'Поиск',
      events: {
        input: (event: Event) => {
          const target = event.target as HTMLInputElement | null;
          this.setProps({ filter: target?.value ?? '' });
        },
      },
    });

    super({
      ...props,
      hasChats: false,
      filter: '',
      searchInput,
    });
  }

  override componentDidMount(): void {
    super.componentDidMount();
    this.updateChats(this.props);
  }

  override componentDidUpdate(oldProps: ChatListInternalProps, newProps: ChatListInternalProps): boolean {
    if (this.isSyncing) {
      return true;
    }

    const chatsChanged = oldProps.chats !== newProps.chats;
    const selectionChanged = oldProps.selectedChatId !== newProps.selectedChatId;
    const filterChanged = oldProps.filter !== newProps.filter;

    if (chatsChanged || selectionChanged || filterChanged) {
      this.updateChats(newProps);
    }

    return true;
  }

  private updateChats(props: ChatListInternalProps): void {
    const filterRaw = typeof props.filter === 'string' ? props.filter : '';
    const filter = filterRaw.trim().toLowerCase();

    const visibleChats = props.chats.filter((chat) => {
      if (!filter) return true;
      const title = chat.title?.toLowerCase() ?? '';
      const lastMessage = chat.last_message?.content?.toLowerCase() ?? '';
      return title.includes(filter) || lastMessage.includes(filter);
    });

    const canUseDOM = typeof document !== 'undefined';
    const searchInputBlock = this.children.searchInput as Input | undefined;
    const searchInputElement = canUseDOM
      ? (searchInputBlock?.element?.querySelector('input') as HTMLInputElement | null) ?? null
      : null;
    const shouldRestoreFocus =
      canUseDOM && searchInputElement !== null && document.activeElement === searchInputElement;
    const selectionStart = shouldRestoreFocus ? searchInputElement.selectionStart : null;
    const selectionEnd = shouldRestoreFocus ? searchInputElement.selectionEnd : null;

    const items: ChatItem[] = visibleChats.map((chat) => {
      const time = formatTime(chat.last_message?.time);
      const avatarSrc = buildResourceUrl(chat.avatar);

      const itemProps: ChatItemProps = {
        chatId: chat.id,
        author: chat.title || 'Без названия',
        text: chat.last_message?.content ?? '',
        active: props.selectedChatId === chat.id,
        onSelect: (chatId) => {
          void chatController.selectChat(chatId).catch((error) => {
            console.error('Failed to select chat', error);
          });
        },
      };

      if (time) {
        itemProps.time = time;
      }

      if (avatarSrc) {
        itemProps.avatar = avatarSrc;
      }

      if (chat.unread_count > 0) {
        itemProps.unread = chat.unread_count;
      }

      return new ChatItem(itemProps);
    });

    this.isSyncing = true;
    this.setLists({ chats: items });
    this.setProps({ hasChats: items.length > 0 });
    this.isSyncing = false;

    if (shouldRestoreFocus && typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const currentInput =
          (searchInputBlock?.element?.querySelector('input') as HTMLInputElement | null)
          ?? searchInputElement;
        if (!currentInput) return;
        currentInput.focus();

        if (selectionStart !== null && selectionEnd !== null && currentInput === document.activeElement) {
          currentInput.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    }
  }

  override render() {
    return chatListTemplate;
  }
}

const mapStateToProps = (state: AppState) => ({
  chats: state.chats.list,
  selectedChatId: state.chats.selectedChatId,
  isLoading: state.chats.isLoading,
  error: state.chats.error,
});

export const ChatList = withStore(mapStateToProps)(ChatListBase);

export default ChatList;
