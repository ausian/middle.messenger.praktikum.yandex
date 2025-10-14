import BaseAPI from './BaseAPI.ts';
import type {
  SignInRequest,
  SignUpRequest,
  SignUpResponse,
  UserDTO,
} from './types.ts';

class AuthAPI extends BaseAPI {
  constructor() {
    super('auth');
  }

  public signup(data: SignUpRequest): Promise<SignUpResponse> {
    return this.http.post<SignUpResponse>('signup', data);
  }

  public async signin(data: SignInRequest): Promise<void> {
    await this.http.post<unknown>('signin', data);
  }

  public getUser(): Promise<UserDTO> {
    return this.http.get<UserDTO>('user');
  }

  public async logout(): Promise<void> {
    await this.http.post<unknown>('logout');
  }
}

export const authAPI = new AuthAPI();

export default authAPI;

export type { SignInRequest, SignUpRequest, SignUpResponse, UserDTO };

