type QueryParams = Record<string, string | number | boolean | null | undefined>;

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  get<T = unknown>(url: string, query?: QueryParams): Promise<T> {
    const fullUrl = this.buildUrl(url, query);
    return this.send<T>('GET', fullUrl);
  }

  post<T = unknown>(url: string, data?: unknown): Promise<T> {
    return this.send<T>('POST', this.baseUrl + url, data);
  }

  put<T = unknown>(url: string, data?: unknown): Promise<T> {
    return this.send<T>('PUT', this.baseUrl + url, data);
  }

  delete<T = unknown>(url: string, data?: unknown): Promise<T> {
    return this.send<T>('DELETE', this.baseUrl + url, data);
  }

  private buildUrl(url: string, query?: QueryParams): string {
    const endpoint = this.baseUrl + url;
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

  private send<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: unknown,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 400) {
          const ct = xhr.getResponseHeader('Content-Type') || '';
          if (ct.includes('application/json')) {
            try {
              resolve(JSON.parse(xhr.responseText) as T);
            } catch {
              resolve(xhr.responseText as unknown as T);
            }
          } else {
            resolve(xhr.responseText as unknown as T);
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      if (method === 'GET' || data == null) {
        xhr.send();
        return;
      }

      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        xhr.send(data);
        return;
      }

      if (typeof data === 'string') {
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        xhr.send(data);
        return;
      }

      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    });
  }
}

export default HttpClient;
