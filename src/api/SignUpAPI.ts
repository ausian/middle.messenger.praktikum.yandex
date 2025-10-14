import BaseAPI from './BaseAPI.ts';
import type { SignUpRequest, SignUpResponse } from './types.ts';

class SignUpAPI extends BaseAPI {
  constructor() {
    super('auth/signup');
  }

  public create(data: SignUpRequest): Promise<SignUpResponse> {
    return this.http.post<SignUpResponse>('', data);
  }
}

export const signUpAPI = new SignUpAPI();

export default signUpAPI;

export type { SignUpRequest, SignUpResponse };
