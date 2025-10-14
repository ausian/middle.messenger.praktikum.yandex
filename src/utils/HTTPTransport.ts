type QueryParams = Record<string, string | number | boolean | null | undefined>;

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

const HEADER_CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';
const TEXT_PLAIN_UTF8 = 'text/plain;charset=UTF-8';
const NETWORK_ERROR_MESSAGE = 'Network error';

export class HTTPError extends Error {
  public readonly status: number;

  public readonly response: unknown;

  constructor(status: number, message: string, response: unknown) {
    super(message);
    this.name = 'HTTPError';
    this.status = status;
    this.response = response;
  }
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  get<T = unknown>(url: string, query?: QueryParams): Promise<T> {
    return this.send<T>(HttpMethod.GET, this.buildUrl(url, query));
  }

  post<T = unknown>(url: string, data?: unknown): Promise<T> {
    return this.send<T>(HttpMethod.POST, this.buildUrl(url), data);
  }

  put<T = unknown>(url: string, data?: unknown): Promise<T> {
    return this.send<T>(HttpMethod.PUT, this.buildUrl(url), data);
  }

  delete<T = unknown>(url: string, data?: unknown): Promise<T> {
    return this.send<T>(HttpMethod.DELETE, this.buildUrl(url), data);
  }

  private buildUrl(url: string, query?: QueryParams): string {
    const trimmedBase = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const path = url
      ? (url.startsWith('/') ? url : `/${url}`)
      : '';
    const endpoint = `${trimmedBase}${path}`;
    if (!query) return endpoint;
    const parts: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      const encodedKey = encodeURIComponent(key);
      if (value === null) {
        parts.push(`${encodedKey}=`);
      } else {
        parts.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
      }
    }
    const qs = parts.join('&');
    if (!qs) return endpoint;
    return endpoint + (endpoint.includes('?') ? '&' : '?') + qs;
  }

  private send<T>(method: HttpMethod, url: string, data?: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.withCredentials = true;

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 400) {
          const ct = xhr.getResponseHeader(HEADER_CONTENT_TYPE) || '';
          if (ct.includes(APPLICATION_JSON)) {
            try {
              resolve(JSON.parse(xhr.responseText) as T);
            } catch {
              resolve(xhr.responseText as unknown as T);
            }
          } else {
            resolve(xhr.responseText as unknown as T);
          }
        } else {
          const rawResponse = xhr.responseText;
          let parsedResponse: unknown = rawResponse;
          let message = `HTTP ${xhr.status}`;

          if (rawResponse) {
            try {
              parsedResponse = JSON.parse(rawResponse);
              if (
                typeof parsedResponse === 'object'
                && parsedResponse !== null
                && 'reason' in parsedResponse
                && typeof (parsedResponse as { reason: unknown }).reason === 'string'
              ) {
                message = (parsedResponse as { reason: string }).reason;
              } else if (typeof rawResponse === 'string') {
                message = rawResponse;
              }
            } catch {
              if (typeof rawResponse === 'string') {
                message = rawResponse;
              }
            }
          }

          reject(new HTTPError(xhr.status, message, parsedResponse));
        }
      };

      xhr.onerror = () => reject(new Error(NETWORK_ERROR_MESSAGE));

      if (method === HttpMethod.GET || data == null) {
        xhr.send();
        return;
      }

      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        xhr.send(data);
        return;
      }

      if (typeof data === 'string') {
        xhr.setRequestHeader(HEADER_CONTENT_TYPE, TEXT_PLAIN_UTF8);
        xhr.send(data);
        return;
      }

      xhr.setRequestHeader(HEADER_CONTENT_TYPE, APPLICATION_JSON);
      xhr.send(JSON.stringify(data));
    });
  }
}

export default HttpClient;
