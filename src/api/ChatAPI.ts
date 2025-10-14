import BaseAPI from './BaseAPI.ts';
import type {
  ChangeChatAvatarResponse,
  ChatDTO,
  ChatFileDTO,
  ChatTokenResponse,
  ChatUserDTO,
  CreateChatPayload,
  CreateChatResponse,
  DeleteChatRequest,
  DeleteChatResponse,
  GetChatFilesParams,
  GetChatUsersParams,
  GetChatsParams,
  ModifyChatStatusRequest,
  ModifyChatUsersRequest,
  NewMessagesCountResponse,
} from './types.ts';

class ChatAPI extends BaseAPI {
  constructor() {
    super('chats');
  }

  public getChats(params?: GetChatsParams): Promise<ChatDTO[]> {
    return this.http.get<ChatDTO[]>('', params);
  }

  public createChat(payload: CreateChatPayload): Promise<CreateChatResponse> {
    return this.http.post<CreateChatResponse>('', payload);
  }

  public deleteChat(payload: DeleteChatRequest): Promise<DeleteChatResponse> {
    return this.http.delete<DeleteChatResponse>('', payload);
  }

  public getChatFiles(
    chatId: number,
    params?: GetChatFilesParams,
  ): Promise<ChatFileDTO[]> {
    return this.http.get<ChatFileDTO[]>(`${chatId}/files`, params);
  }

  public getArchivedChats(params?: GetChatsParams): Promise<ChatDTO[]> {
    return this.http.get<ChatDTO[]>('archive', params);
  }

  public async archiveChat(payload: ModifyChatStatusRequest): Promise<void> {
    await this.http.post<unknown>('archive', payload);
  }

  public async unarchiveChat(payload: ModifyChatStatusRequest): Promise<void> {
    await this.http.post<unknown>('unarchive', payload);
  }

  public getCommonChats(chatId: number): Promise<ChatDTO[]> {
    return this.http.get<ChatDTO[]>(`${chatId}/common`);
  }

  public getChatUsers(
    chatId: number,
    params?: GetChatUsersParams,
  ): Promise<ChatUserDTO[]> {
    return this.http.get<ChatUserDTO[]>(`${chatId}/users`, params);
  }

  public getNewMessagesCount(
    chatId: number,
  ): Promise<NewMessagesCountResponse> {
    return this.http.get<NewMessagesCountResponse>(`new/${chatId}`);
  }

  public updateAvatar(formData: FormData): Promise<ChangeChatAvatarResponse> {
    return this.http.put<ChangeChatAvatarResponse>('avatar', formData);
  }

  public async addUsers(payload: ModifyChatUsersRequest): Promise<void> {
    await this.http.put<unknown>('users', payload);
  }

  public async removeUsers(payload: ModifyChatUsersRequest): Promise<void> {
    await this.http.delete<unknown>('users', payload);
  }

  public getChatToken(chatId: number): Promise<ChatTokenResponse> {
    return this.http.post<ChatTokenResponse>(`token/${chatId}`);
  }
}

export const chatAPI = new ChatAPI();

export default chatAPI;
