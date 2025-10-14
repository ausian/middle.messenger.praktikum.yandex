import userAPI from '../api/UserAPI.ts';
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserDTO,
} from '../api/types.ts';
import store from '../framework/Store.ts';
import { HTTPError } from '../utils/HTTPTransport.ts';

class UserController {
  public async updateProfile(data: UpdateProfileRequest): Promise<UserDTO> {
    try {
      const updatedUser = await userAPI.updateProfile(data);
      store.set('user', updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(this.resolveErrorMessage(error, 'Не удалось обновить профиль'));
    }
  }

  public async updateAvatar(file: File): Promise<UserDTO> {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const updatedUser = await userAPI.updateAvatar(formData);
      store.set('user', updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(this.resolveErrorMessage(error, 'Не удалось обновить аватар'));
    }
  }

  public async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await userAPI.changePassword(data);
    } catch (error) {
      throw new Error(this.resolveErrorMessage(error, 'Не удалось изменить пароль'));
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
}

const userController = new UserController();

export default userController;
