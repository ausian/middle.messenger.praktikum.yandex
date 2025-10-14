import HTTPTransport from '../utils/HTTPTransport.ts';
import { constantsAPI } from './constants.ts';

export default abstract class BaseAPI {
  protected readonly http: HTTPTransport;

  protected constructor(endpoint: string) {
    this.http = new HTTPTransport(`${constantsAPI.baseURL}${endpoint}`);
  }
}

