import chatAPI from '../api/ChatAPI.ts';
import userAPI from '../api/UserAPI.ts';
import type {
  ChangeChatAvatarResponse,
  ChatDTO,
  ChatMessageDTO,
} from '../api/types.ts';
import store from '../framework/Store.ts';
import { HTTPError } from '../utils/HTTPTransport.ts';

const WEBSOCKET_BASE_URL = 'wss://ya-praktikum.tech/ws/chats';
const PING_INTERVAL_MS = 5000;

class ChatController {
  private sockets = new Map<number, WebSocket>();

  private pingIntervals = new Map<number, number>();

  public async fetchChats(): Promise<ChatDTO[]> {
    store.set('chats.isLoading', true);
    store.set('chats.error', null);

    try {
      const chats = await chatAPI.getChats();
      store.set('chats.list', chats);

      const selectedChatId = store.getState().chats.selectedChatId;
      const firstChat = chats[0];
      if (
        firstChat
        && (!selectedChatId || !chats.some(({ id }) => id === selectedChatId))
      ) {
        void this.selectChat(firstChat.id);
      }

      return chats;
    } catch (error) {
      store.set('chats.error', this.resolveErrorMessage(error, 'Не удалось загрузить чаты'));
      throw error;
    } finally {
      store.set('chats.isLoading', false);
    }
  }

  public async createChat(title: string): Promise<void> {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new Error('Название чата не может быть пустым');
    }

    try {
      await chatAPI.createChat({ title: trimmedTitle });
      await this.fetchChats();
    } catch (error) {
      store.set('chats.error', this.resolveErrorMessage(error, 'Не удалось создать чат'));
      throw error;
    }
  }

  public async selectChat(chatId: number): Promise<void> {
    const currentState = store.getState();
    if (currentState.chats.selectedChatId === chatId) {
      return;
    }

    store.set('chats.selectedChatId', chatId);
    store.set('messages.error', null);
    store.set('messages.isLoading', true);

    try {
      await this.fetchChatUsers(chatId);
      await this.connectToChat(chatId);
    } catch (error) {
      store.set('messages.isLoading', false);
      throw error;
    }
  }

  public async fetchChatUsers(chatId: number): Promise<void> {
    try {
      const users = await chatAPI.getChatUsers(chatId);
      store.set(`chats.usersByChatId.${chatId}`, users);
    } catch (error) {
      store.set('chats.error', this.resolveErrorMessage(error, 'Не удалось загрузить участников чата'));
      throw error;
    }
  }

  public async addUserByNickname(nickname: string): Promise<void> {
    const selectedChatId = store.getState().chats.selectedChatId;
    if (!selectedChatId) {
      throw new Error('Чат не выбран');
    }

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      throw new Error('Никнейм не может быть пустым');
    }

    const userIds = await this.findUserIdsByNickname(trimmedNickname);
    if (userIds.length === 0) {
      throw new Error('Пользователь с таким никнеймом не найден');
    }

    try {
      await chatAPI.addUsers({ users: userIds, chatId: selectedChatId });
      await this.fetchChatUsers(selectedChatId);
    } catch (error) {
      store.set('chats.error', this.resolveErrorMessage(error, 'Не удалось добавить пользователя в чат'));
      throw error;
    }
  }

  public async removeUserById(userId: number): Promise<void> {
    const selectedChatId = store.getState().chats.selectedChatId;
    if (!selectedChatId) {
      throw new Error('Чат не выбран');
    }

    try {
      await chatAPI.removeUsers({ users: [userId], chatId: selectedChatId });
      await this.fetchChatUsers(selectedChatId);
    } catch (error) {
      store.set('chats.error', this.resolveErrorMessage(error, 'Не удалось удалить пользователя из чата'));
      throw error;
    }
  }

  public async deleteSelectedChat(): Promise<void> {
    const selectedChatId = store.getState().chats.selectedChatId;
    if (!selectedChatId) {
      throw new Error('Чат не выбран');
    }

    try {
      await chatAPI.deleteChat({ chatId: selectedChatId });

      const socket = this.sockets.get(selectedChatId);
      if (socket) {
        socket.close();
      }

      this.clearPing(selectedChatId);
      this.sockets.delete(selectedChatId);

      const currentState = store.getState();

      const nextChats = currentState.chats.list.filter((chat) => chat.id !== selectedChatId);
      store.set('chats.list', nextChats);

      const usersByChatId = { ...currentState.chats.usersByChatId };
      delete usersByChatId[selectedChatId];
      store.set('chats.usersByChatId', usersByChatId);

      const messagesByChatId = { ...currentState.messages.byChatId };
      delete messagesByChatId[selectedChatId];
      store.set('messages.byChatId', messagesByChatId);

      store.set('chats.selectedChatId', null);

      if (nextChats.length > 0) {
        await this.fetchChats();
      }
    } catch (error) {
      store.set('chats.error', this.resolveErrorMessage(error, 'Не удалось удалить чат'));
      throw error;
    }
  }

  public async updateChatAvatar(file: File): Promise<ChangeChatAvatarResponse> {
    const selectedChatId = store.getState().chats.selectedChatId;
    if (!selectedChatId) {
      throw new Error('Чат не выбран');
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('chatId', String(selectedChatId));

    try {
      const updatedChat = await chatAPI.updateAvatar(formData);
      const currentChats = store.getState().chats.list;
      const nextChats = currentChats.map((chat) => {
        if (chat.id !== updatedChat.id) return chat;
        return {
          ...chat,
          title: updatedChat.title ?? chat.title,
          avatar: updatedChat.avatar ?? null,
        };
      });

      store.set('chats.list', nextChats);
      store.set('chats.error', null);
      return updatedChat;
    } catch (error) {
      const message = this.resolveErrorMessage(error, 'Не удалось обновить аватар чата');
      store.set('chats.error', message);
      throw new Error(message);
    }
  }

  public sendMessage(content: string): void {
    const trimmed = content.trim();
    if (!trimmed) return;

    const selectedChatId = store.getState().chats.selectedChatId;
    if (!selectedChatId) {
      throw new Error('Чат не выбран');
    }

    const socket = this.sockets.get(selectedChatId);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('Нет соединения с чатом');
    }

    socket.send(JSON.stringify({ type: 'message', content: trimmed }));
  }

  public disconnectAll(): void {
    [...this.sockets.entries()].forEach(([chatId, socket]) => {
      socket.close();
      this.clearPing(chatId);
    });

    this.sockets.clear();
  }

  private async connectToChat(chatId: number): Promise<void> {
    if (this.sockets.has(chatId)) {
      store.set('messages.isLoading', false);
      return;
    }

    const user = store.getState().user;
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      const { token } = await chatAPI.getChatToken(chatId);
      const socket = new WebSocket(`${WEBSOCKET_BASE_URL}/${user.id}/${chatId}/${token}`);

      socket.addEventListener('open', () => {
        store.set('messages.error', null);
        socket.send(JSON.stringify({ content: '0', type: 'get old' }));
        this.startPing(chatId, socket);
      });

      socket.addEventListener('message', (event) => {
        this.handleSocketMessage(chatId, event);
      });

      socket.addEventListener('close', () => {
        this.clearPing(chatId);
        this.sockets.delete(chatId);
      });

      socket.addEventListener('error', (event) => {
        console.error('WebSocket error', event);
        store.set('messages.error', 'Ошибка соединения с чатом');
      });

      this.sockets.set(chatId, socket);
    } catch (error) {
      store.set('messages.error', this.resolveErrorMessage(error, 'Не удалось подключиться к чату'));
      store.set('messages.isLoading', false);
      throw error;
    }
  }

  private handleSocketMessage(chatId: number, event: MessageEvent<string>): void {
    const rawPayload = typeof event.data === 'string' ? event.data.trim() : '';

    if (!rawPayload) {
      return;
    }

    const isJsonPayload = rawPayload.startsWith('{') || rawPayload.startsWith('[');
    if (!isJsonPayload) {
      if (rawPayload === 'WS token is not valid') {
        store.set('messages.error', 'Не удалось подключиться к чату. Идет повторное подключение...');
        void this.reconnectChat(chatId);
        return;
      }

      console.warn('Получено сообщение чата в неизвестном формате', rawPayload);
      return;
    }

    try {
      const data = JSON.parse(rawPayload) as unknown;

      if (Array.isArray(data)) {
        const messages = [...data].reverse() as ChatMessageDTO[];
        this.setMessages(chatId, messages);
        store.set('messages.isLoading', false);
        return;
      }

      if (typeof data === 'object' && data !== null) {
        const message = data as ChatMessageDTO & { type?: string };

        if (message.type === 'message' || message.type === 'file') {
          this.appendMessages(chatId, [message]);
          store.set('messages.isLoading', false);
          return;
        }

        if (message.type === 'get old' || message.type === 'pong') {
          return;
        }

        if (message.type === 'user connected') {
          void this.fetchChatUsers(chatId);
          return;
        }
      }
    } catch (error) {
      console.warn('Не удалось обработать сообщение чата', error);
    }
  }

  private setMessages(chatId: number, messages: ChatMessageDTO[]): void {
    store.set(`messages.byChatId.${chatId}`, messages);
  }

  private appendMessages(chatId: number, messages: ChatMessageDTO[]): void {
    const currentMessages = store.getState().messages.byChatId[chatId] ?? [];
    const existingIds = new Set(currentMessages.map((message) => message.id));

    const merged = [...currentMessages];
    messages.forEach((message) => {
      if (!existingIds.has(message.id)) {
        merged.push(message);
      }
    });

    merged.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    store.set(`messages.byChatId.${chatId}`, merged);
  }

  private async findUserIdsByNickname(nickname: string): Promise<number[]> {
    try {
      const users = await userAPI.search({ login: nickname });
      const normalized = nickname.trim().toLowerCase();

      return users
        .filter((user) => {
          const displayName = user.display_name?.trim().toLowerCase() ?? null;
          const userLogin = user.login.trim().toLowerCase();
          return displayName === normalized || userLogin === normalized;
        })
        .map((user) => user.id);
    } catch (error) {
      store.set('chats.error', this.resolveErrorMessage(error, 'Не удалось найти пользователя'));
      throw error;
    }
  }

  private startPing(chatId: number, socket: WebSocket): void {
    this.clearPing(chatId);
    const intervalId = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, PING_INTERVAL_MS);

    this.pingIntervals.set(chatId, intervalId);
  }

  private clearPing(chatId: number): void {
    const intervalId = this.pingIntervals.get(chatId);
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      this.pingIntervals.delete(chatId);
    }
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HTTPError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  }

  private async reconnectChat(chatId: number): Promise<void> {
    const existingSocket = this.sockets.get(chatId);
    if (existingSocket && existingSocket.readyState === WebSocket.OPEN) {
      existingSocket.close();
    }

    this.clearPing(chatId);
    this.sockets.delete(chatId);

    store.set('messages.isLoading', true);

    try {
      await this.connectToChat(chatId);
    } catch (error) {
      store.set('messages.error', this.resolveErrorMessage(error, 'Не удалось переподключиться к чату'));
      store.set('messages.isLoading', false);
      console.warn('Ошибка при повторном подключении к чату', error);
    }
  }
}

const chatController = new ChatController();

export default chatController;
