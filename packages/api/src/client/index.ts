import * as z from 'zod/v4-mini';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import type {
  AnyApiRouteDef,
  ApiConfig,
  ApiResponse,
  RequestConfig,
  RequestParams,
  RequestQuery,
  RequestBody,
  RequestReturnType,
  SseRequestConfig,
} from '../types/index.js';

export class ApiError extends Error {
  constructor(public response: { message: string; status: number; statusText: string; url: string; cause?: unknown }) {
    const { message, status, statusText, cause, url } = response;
    super(`[${status}:${statusText}] ${url} ${message}`, { cause });
  }
}

export class ApiInstance {
  private config: ApiConfig;
  private onUnauthorizedListeners: ((error: ApiError) => void)[] = [];

  constructor(config: ApiConfig) {
    this.config = config;
    if (config.onUnauthorized) {
      this.onUnauthorizedListeners.push(config.onUnauthorized);
    }
  }

  addOnUnauthorizedListener(listener: (error: ApiError) => void) {
    this.onUnauthorizedListeners.push(listener);
    return () => {
      this.onUnauthorizedListeners = this.onUnauthorizedListeners.filter((l) => l !== listener);
    };
  }

  private notifyUnauthorized(error: ApiError) {
    for (const listener of this.onUnauthorizedListeners) {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in onUnauthorized listener:', err);
      }
    }
  }

  private getUrl<T extends AnyApiRouteDef>(
    route: T,
    { baseUrl, ...args }: RequestConfig & RequestParams<T> & RequestQuery<T> & RequestBody<T>,
  ) {
    if (!baseUrl && !this.config.baseUrl) {
      throw new Error('baseUrl is unset');
    }

    let path: string = route.path;

    if ('params' in args && args.params) {
      for (const [key, value] of Object.entries(args.params as Record<string, unknown>)) {
        if (value === null || value === undefined) continue;
        path = path.replace(':' + key, String(value));
      }
    }

    const url = new URL(`${baseUrl ?? this.config.baseUrl}${path}`);

    if ('query' in args && args.query) {
      for (const [key, value] of Object.entries(args.query as Record<string, unknown>)) {
        if (value === null || value === undefined) continue;
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url;
  }

  async request<T extends AnyApiRouteDef, C extends RequestConfig>(
    route: T,
    config: C & RequestParams<T> & RequestQuery<T> & RequestBody<T>,
  ): Promise<RequestReturnType<T, C>> {
    const { withCredentials = true, timeout, baseUrl, signal: userSignal, ...args } = config;

    const url = this.getUrl(route, config);
    let contentTypeHeaders: Record<string, string> = {};
    let body: BodyInit | null | undefined = undefined;

    if ('body' in args && args.body !== undefined) {
      if (typeof args.body === 'string') {
        body = args.body;
        contentTypeHeaders = { 'Content-Type': 'text/plain' };
      } else if (args.body instanceof FormData) {
        body = args.body;
      } else {
        contentTypeHeaders = { 'Content-Type': 'application/json' };
        body = JSON.stringify(args.body);
      }
    }

    const effectiveTimeout = timeout !== undefined ? timeout : (this.config.timeout ?? 15000);
    const activeUserSignal = userSignal ?? undefined;
    let finalSignal: AbortSignal | undefined;

    if (effectiveTimeout > 0 && Number.isFinite(effectiveTimeout)) {
      const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
      finalSignal = activeUserSignal ? AbortSignal.any([activeUserSignal, timeoutSignal]) : timeoutSignal;
    } else {
      finalSignal = activeUserSignal;
    }

    let response: Response;

    try {
      response = await fetch(url, {
        ...args,
        signal: finalSignal,
        body,
        headers: {
          ...this.config.headers,
          ...contentTypeHeaders,
          ...args.headers,
        },
        credentials: withCredentials ? 'include' : 'omit',
        method: route.method,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new ApiError({
          message: `Request timed out after ${effectiveTimeout}ms`,
          status: 408,
          statusText: 'Request Timeout',
          url: url.toString(),
          cause: error,
        });
      }
      throw error;
    }

    if (response.ok) {
      const responseType = config.responseType ?? 'json';

      if (responseType === 'raw') {
        return response as RequestReturnType<T, C>;
      }

      if (responseType === 'buffer') {
        return (await response.arrayBuffer()) as RequestReturnType<T, C>;
      }

      if (!route.response) {
        return {} as RequestReturnType<T, C>;
      }

      const text = await response.text();
      const skipValidation = config.skipResponseValidation ?? this.config.skipResponseValidation;

      if (!text) {
        if (skipValidation) {
          return null as RequestReturnType<T, C>;
        }

        const nullResult = route.response.safeParse(null);
        if (nullResult.success) {
          return nullResult.data as RequestReturnType<T, C>;
        }

        const undefinedResult = route.response.safeParse(undefined);
        if (undefinedResult.success) {
          return undefinedResult.data as RequestReturnType<T, C>;
        }

        return {} as RequestReturnType<T, C>;
      }

      const json: unknown = JSON.parse(text);

      if (skipValidation) {
        return json as RequestReturnType<T, C>;
      }

      const result = route.response.safeParse(json);

      if (!result.success) {
        throw new ApiError({
          message: 'Invalid response: ' + result.error.message,
          status: response.status,
          statusText: response.statusText,
          url: url.toString(),
          cause: result.error,
        });
      }

      return result.data as RequestReturnType<T, C>;
    } else {
      let message = '';

      try {
        const text = await response.text();
        const json = JSON.parse(text);
        message = json.message || json.error || text;
      } catch {
        message = response.statusText;
      }

      const apiError = new ApiError({
        message,
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
      });

      if (response.status === 401) {
        this.notifyUnauthorized(apiError);
      }

      throw apiError;
    }
  }

  async tryRequest<T extends AnyApiRouteDef, C extends RequestConfig>(
    route: T,
    config: C & RequestParams<T> & RequestQuery<T> & RequestBody<T>,
  ): ApiResponse<RequestReturnType<T, C>> {
    try {
      const data = await this.request(route, config);
      return [data, null];
    } catch (error) {
      return [
        null,
        error instanceof ApiError ? error : new Error('Request failed: ' + String(error), { cause: error }),
      ];
    }
  }

  async sse<T extends AnyApiRouteDef>(
    route: T,
    config: SseRequestConfig<T> & RequestParams<T> & RequestQuery<T> & RequestBody<T>,
  ) {
    const {
      onNext,
      onConnect,
      onError,
      onClose,
      withCredentials = true,
      timeout,
      baseUrl,
      signal: userSignal,
      ...args
    } = config;

    const url = this.getUrl(route, config);
    let contentTypeHeaders: Record<string, string> = {};
    let body: BodyInit | null | undefined = undefined;

    if ('body' in args && args.body !== undefined) {
      if (typeof args.body === 'string') {
        body = args.body;
        contentTypeHeaders = { 'Content-Type': 'text/plain' };
      } else if (args.body instanceof FormData) {
        body = args.body;
      } else {
        contentTypeHeaders = { 'Content-Type': 'application/json' };
        body = JSON.stringify(args.body);
      }
    }

    if (!route.response) {
      throw new Error(`Route ${route.path} has no response schema`);
    }

    const connectTimeout = timeout !== undefined ? timeout : (this.config.timeout ?? 15000);
    const connectAbortController = new AbortController();
    let connectTimer: ReturnType<typeof setTimeout> | undefined;

    if (connectTimeout > 0 && Number.isFinite(connectTimeout)) {
      connectTimer = setTimeout(() => {
        connectAbortController.abort(new DOMException('SSE connection timed out', 'TimeoutError'));
      }, connectTimeout);
    }

    const activeUserSignal = userSignal ?? undefined;
    const handshakeSignal = activeUserSignal
      ? AbortSignal.any([activeUserSignal, connectAbortController.signal])
      : connectAbortController.signal;

    let response: Response;
    try {
      response = await fetch(url, {
        ...args,
        signal: handshakeSignal,
        body,
        headers: {
          Accept: 'text/event-stream',
          ...this.config.headers,
          ...contentTypeHeaders,
          ...args.headers,
        },
        credentials: withCredentials ? 'include' : 'omit',
        method: route.method,
      });
    } catch (error) {
      if (connectTimer) clearTimeout(connectTimer);
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new ApiError({
          message: `SSE connection timed out after ${connectTimeout}ms`,
          status: 408,
          statusText: 'Request Timeout',
          url: url.toString(),
          cause: error,
        });
      }
      throw error;
    }

    if (connectTimer) clearTimeout(connectTimer);

    if (!response.ok) {
      let message = '';
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        message = json.message || json.error || text;
      } catch {
        message = response.statusText;
      }

      const apiError = new ApiError({
        message,
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
      });

      if (response.status === 401) {
        this.notifyUnauthorized(apiError);
      }

      throw apiError;
    }

    onConnect?.();

    const stream = response.body?.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());

    if (!stream) {
      throw new Error('Response body is null');
    }

    const reader = stream.getReader();
    let isClosed = false;

    const onAbort = () => {
      if (!isClosed) {
        isClosed = true;
        reader.cancel().catch(() => {});
      }
    };

    if (userSignal) {
      userSignal.addEventListener('abort', onAbort, { once: true });
    }

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done || !value) {
          onClose?.();
          break;
        }

        if (value.event === 'comment' || value.event === 'heartbeat' || value.event === 'ping') {
          continue;
        }

        if (value.event === 'error') {
          if (onError) {
            onError(value.data);
          } else {
            throw new Error(`SSE error: ${value.data} on ${url}`);
          }
        }

        let data: unknown;
        try {
          data = route.response.parse(JSON.parse(value.data));
        } catch (e) {
          throw new ApiError({
            message: 'Invalid data: ' + value.data + '\n' + String(e),
            status: 400,
            statusText: 'Bad Request',
            url: url.toString(),
          });
        }

        try {
          await onNext(data as z.infer<NonNullable<T['response']>>);
        } catch (error) {
          throw new Error('Stream error: ' + String(error), {
            cause: error,
          });
        }
      }
    } finally {
      isClosed = true;
      if (userSignal) {
        userSignal.removeEventListener('abort', onAbort);
      }
      try {
        await reader.cancel();
      } catch {
        console.warn('Failed to cancel SSE reader');
      }
    }
  }

  async header(key: string, value: string) {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    this.config.headers[key] = value;
    return this;
  }
}
