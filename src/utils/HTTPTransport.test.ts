/// <reference types="mocha" />

import { expect } from 'chai';
import HttpClient, { HTTPError } from './HTTPTransport.ts';

class MockXMLHttpRequest implements Partial<XMLHttpRequest> {
  public static instances: MockXMLHttpRequest[] = [];

  public method = '';

  public url = '';

  public requestBody: unknown = undefined;

  public requestHeaders: Record<string, string> = {};

  public responseHeaders: Record<string, string> = {};

  public status = 200;

  public responseText = '';

  public withCredentials = false;

  public onload: XMLHttpRequest['onload'] = null;

  public onerror: XMLHttpRequest['onerror'] = null;

  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string): void {
    this.requestHeaders[name] = value;
  }

  getResponseHeader(name: string): string | null {
    return this.responseHeaders[name] ?? null;
  }

  send(body?: Document | XMLHttpRequestBodyInit | null): void {
    this.requestBody = body;
  }

  triggerLoad(): void {
    const event = new Event('load') as unknown as ProgressEvent<EventTarget>;
    this.onload?.call(this as unknown as XMLHttpRequest, event);
  }

  triggerError(): void {
    const event = new Event('error') as unknown as ProgressEvent<EventTarget>;
    this.onerror?.call(this as unknown as XMLHttpRequest, event);
  }
}

describe('HTTPTransport', () => {
  const originalXMLHttpRequest = globalThis.XMLHttpRequest;

  beforeEach(() => {
    MockXMLHttpRequest.instances = [];
    globalThis.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = originalXMLHttpRequest;
  });

  it('performs GET request with serialized query params and parses JSON response', async () => {
    const client = new HttpClient('https://api.example.com/');
    const promise = client.get('/users', {
      search: 'john doe',
      page: 2,
      empty: undefined,
      nil: null,
    });

    const xhr = MockXMLHttpRequest.instances[0]!;
    expect(xhr.method).to.equal('GET');
    expect(xhr.url).to.equal('https://api.example.com/users?search=john%20doe&page=2&nil=');
    expect(xhr.withCredentials).to.equal(true);
    xhr.responseHeaders['Content-Type'] = 'application/json; charset=utf-8';
    xhr.responseText = JSON.stringify({ ok: true });
    xhr.triggerLoad();

    const response = await promise;
    expect(response).to.deep.equal({ ok: true });
  });

  it('sends JSON body for POST requests and sets content-type header', async () => {
    const client = new HttpClient('https://api.example.com');
    const promise = client.post('/users', { name: 'Alice' });

    const xhr = MockXMLHttpRequest.instances[0]!;
    expect(xhr.method).to.equal('POST');
    expect(xhr.url).to.equal('https://api.example.com/users');
    expect(xhr.requestHeaders['Content-Type']).to.equal('application/json');
    expect(xhr.requestBody).to.equal(JSON.stringify({ name: 'Alice' }));

    xhr.status = 201;
    xhr.responseText = '';
    xhr.triggerLoad();

    await promise;
  });

  it('sends raw FormData without overriding content-type', async () => {
    const client = new HttpClient('https://files.example.com');
    const formData = new FormData();
    formData.append('file', 'blob');

    const promise = client.put('/upload', formData);

    const xhr = MockXMLHttpRequest.instances[0]!;
    expect(xhr.method).to.equal('PUT');
    expect(xhr.requestHeaders['Content-Type']).to.equal(undefined);
    expect(xhr.requestBody).to.equal(formData);

    xhr.triggerLoad();

    await promise;
  });

  it('rejects with HTTPError on non-success status and exposes parsed message', async () => {
    const client = new HttpClient('https://api.example.com');
    const promise = client.delete('/users/1');

    const xhr = MockXMLHttpRequest.instances[0]!;
    xhr.status = 403;
    xhr.responseText = JSON.stringify({ reason: 'Forbidden' });
    xhr.triggerLoad();

    try {
      await promise;
      throw new Error('Expected HTTPError to be thrown');
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPError);
      const httpError = error as HTTPError;
      expect(httpError.status).to.equal(403);
      expect(httpError.message).to.equal('Forbidden');
      expect(httpError.response).to.deep.equal({ reason: 'Forbidden' });
    }
  });

  it('rejects with network error when request fails', async () => {
    const client = new HttpClient();
    const promise = client.get('/ping');

    const xhr = MockXMLHttpRequest.instances[0]!;
    xhr.triggerError();

    try {
      await promise;
      throw new Error('Expected network error to be thrown');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.equal('Network error');
    }
  });
});
