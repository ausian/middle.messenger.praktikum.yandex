import BaseAPI from './BaseAPI.ts';
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserDTO,
  UserSearchRequest,
} from './types.ts';

class UserAPI extends BaseAPI {
  constructor() {
    super('user');
  }

  public updateProfile(data: UpdateProfileRequest): Promise<UserDTO> {
    return this.http.put<UserDTO>('profile', data);
  }

  public updateAvatar(formData: FormData): Promise<UserDTO> {
    return this.http.put<UserDTO>('profile/avatar', formData);
  }

  public async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.http.put<unknown>('password', data);
  }

  public search(data: UserSearchRequest): Promise<UserDTO[]> {
    return this.http.post<UserDTO[]>('search', data);
  }
}

export const userAPI = new UserAPI();

export default userAPI;

