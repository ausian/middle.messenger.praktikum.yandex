import EventBus from './EventBus.ts';
import set, { type Indexed } from '../utils/set.ts';
import type {
  ChatDTO,
  ChatMessageDTO,
  ChatUserDTO,
  UserDTO,
} from '../api/types.ts';

export enum StoreEvents {
  Updated = 'updated',
}

export type AppUser = UserDTO;

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  lastRegistrationId: number | null;
}

export interface AppState {
  user: AppUser | null;
  auth: AuthState;
  chats: ChatsState;
  messages: MessagesState;
}

export interface ChatsState {
  list: ChatDTO[];
  isLoading: boolean;
  error: string | null;
  selectedChatId: number | null;
  usersByChatId: Record<number, ChatUserDTO[]>;
}

export interface MessagesState {
  byChatId: Record<number, ChatMessageDTO[]>;
  isLoading: boolean;
  error: string | null;
}

const createDefaultState = (): AppState => ({
  user: null,
  auth: {
    isLoading: false,
    error: null,
    lastRegistrationId: null,
  },
  chats: {
    list: [],
    isLoading: false,
    error: null,
    selectedChatId: null,
    usersByChatId: {},
  },
  messages: {
    byChatId: {},
    isLoading: false,
    error: null,
  },
});

class Store extends EventBus {
  private state: AppState = createDefaultState();

  public getState(): Readonly<AppState> {
    return this.state;
  }

  public set(path: string, value: unknown): void {
    set(this.state as unknown as Indexed, path, value);
    this.emit(StoreEvents.Updated, this.getState());
  }

  public setState(nextState: AppState): void {
    this.state = nextState;
    this.emit(StoreEvents.Updated, this.getState());
  }

  public reset(): void {
    this.setState(createDefaultState());
  }
}

const store = new Store();

export type StoreInstance = typeof store;

export default store;
