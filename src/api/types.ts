export type Nullable<T> = T | null;

export interface UserDTO {
  id: number;
  first_name: string;
  second_name: string;
  display_name: Nullable<string>;
  login: string;
  email: string;
  phone: string;
  avatar: Nullable<string>;
}

export interface SignUpRequest {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface SignUpResponse {
  id: number;
}

export interface SignInRequest {
  login: string;
  password: string;
}

export interface ChatLastMessageDTO {
  user: UserDTO;
  time: string;
  content: string;
}

export interface ChatDTO {
  id: number;
  title: string;
  avatar: Nullable<string>;
  unread_count: number;
  last_message: Nullable<ChatLastMessageDTO>;
}

export interface CreateChatPayload {
  title: string;
}

export interface CreateChatResponse {
  id: number;
}

export interface DeleteChatRequest {
  chatId: number;
}

export interface DeleteChatResponse {
  userId: number;
  result: {
    id: number;
    title: string;
    avatar: Nullable<string>;
  } | null;
}

export interface GetChatsParams extends Record<string, string | number | boolean | null | undefined> {
  offset?: number;
  limit?: number;
  title?: string;
}

export interface GetChatUsersParams extends Record<string, string | number | boolean | null | undefined> {
  offset?: number;
  limit?: number;
  name?: string;
}

export interface GetChatFilesParams extends Record<string, string | number | boolean | null | undefined> {
  offset?: number;
  limit?: number;
  type?: string;
}

export interface UploadedFileDTO {
  id: number;
  user_id: number;
  path: string;
  filename: string;
  content_type: string;
  content_size: number;
  upload_date: string;
}

export interface ChatFileDTO {
  id: number;
  user_id: number;
  chat_id: number;
  time: string;
  type: string;
  content: string;
  file: UploadedFileDTO;
}

export interface ChatUserDTO extends UserDTO {
  role: 'admin' | 'regular' | 'owner';
}

export interface NewMessagesCountResponse {
  unread_count: number;
}

export interface ChatTokenResponse {
  token: string;
}

export interface ChatMessageDTO {
  chat_id: number;
  content: string;
  file?: UploadedFileDTO;
  id: number;
  is_read?: boolean;
  time: string;
  type: string;
  user_id: number;
}

export interface ModifyChatUsersRequest {
  users: number[];
  chatId: number;
}

export interface ModifyChatStatusRequest {
  chatId: number;
}

export interface ChangeChatAvatarResponse {
  id: number;
  title: string;
  avatar: Nullable<string>;
}

export interface UpdateProfileRequest {
  first_name: string;
  second_name: string;
  display_name: Nullable<string>;
  login: string;
  email: string;
  phone: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserSearchRequest {
  login: string;
}
