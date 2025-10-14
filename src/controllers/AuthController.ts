import authAPI, {
  type SignInRequest,
  type SignUpRequest,
  type SignUpResponse,
  type UserDTO,
} from '../api/AuthAPI.ts';
import store from '../framework/Store.ts';
import { HTTPError } from '../utils/HTTPTransport.ts';
import chatController from './ChatController.ts';

class AuthController {
  public async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    store.set('auth.isLoading', true);
    store.set('auth.error', null);
    store.set('auth.lastRegistrationId', null);

    try {
      const response = await authAPI.signup(data);

      let userForStore: UserDTO;

      try {
        userForStore = await authAPI.getUser();
      } catch (_innerError) {
        userForStore = {
          id: response.id,
          first_name: data.first_name,
          second_name: data.second_name,
          display_name: null,
          login: data.login,
          email: data.email,
          phone: data.phone,
          avatar: null,
        };
      }

      store.set('auth.lastRegistrationId', response.id);
      store.set('user', userForStore);

      return response;
    } catch (error) {
      let message = 'Не удалось создать аккаунт';

      if (error instanceof HTTPError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      store.set('auth.error', message);
      store.set('auth.lastRegistrationId', null);

      throw error;
    } finally {
      store.set('auth.isLoading', false);
    }
  }

  public async signIn(data: SignInRequest): Promise<UserDTO> {
    store.set('auth.isLoading', true);
    store.set('auth.error', null);
    store.set('auth.lastRegistrationId', null);

    try {
      await authAPI.signin(data);
      const user = await authAPI.getUser();
      store.set('user', user);
      return user;
    } catch (error) {
      if (error instanceof HTTPError && error.message === 'User already in system') {
        const user = await authAPI.getUser();
        store.set('user', user);
        return user;
      }

      let message = 'Не удалось войти';

      if (error instanceof HTTPError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      store.set('auth.error', message);
      throw error;
    } finally {
      store.set('auth.isLoading', false);
    }
  }

  public async logout(): Promise<void> {
    store.set('auth.isLoading', true);
    store.set('auth.error', null);

    try {
      await authAPI.logout();
      chatController.disconnectAll();
      store.reset();
    } catch (error) {
      let message = 'Не удалось выйти из аккаунта';

      if (error instanceof HTTPError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      store.set('auth.error', message);
      throw error;
    } finally {
      store.set('auth.isLoading', false);
    }
  }

  public async fetchCurrentUser(): Promise<UserDTO | null> {
    try {
      const user = await authAPI.getUser();
      store.set('user', user);
      return user;
    } catch (error) {
      if (error instanceof HTTPError && error.status === 401) {
        store.set('user', null);
        return null;
      }

      if (error instanceof Error) {
        console.warn('Failed to fetch current user', error);
      }

      return null;
    }
  }
}

const authController = new AuthController();

export default authController;
