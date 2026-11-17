import type * as z from 'zod/v4-mini';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiRouteDef<
  TParam extends z.ZodMiniObject | undefined = undefined,
  TQuery extends z.ZodMiniObject | undefined = undefined,
  TBody extends z.ZodMiniType | undefined = undefined,
  TResponse extends z.ZodMiniType | undefined = undefined,
  TAction extends string | undefined = string | undefined,
> = {
  path: string;
  method: Method;
  params?: TParam;
  query?: TQuery;
  body?: TBody;
  response?: TResponse;
  action?: TAction;
};

export type AnyApiRouteDef = ApiRouteDef<
  z.ZodMiniObject | undefined,
  z.ZodMiniObject | undefined,
  z.ZodMiniType | undefined,
  z.ZodMiniType | undefined,
  string | undefined
>;

export function defineApiRoute<
  TParam extends z.ZodMiniObject | undefined = undefined,
  TQuery extends z.ZodMiniObject | undefined = undefined,
  TBody extends z.ZodMiniType | undefined = undefined,
  TResponse extends z.ZodMiniType | undefined = undefined,
  TAction extends string | undefined = undefined,
>({
  path,
  method,
  params,
  query,
  body,
  response,
  action,
}: {
  params?: TParam;
  query?: TQuery;
  body?: TBody;
  response?: TResponse;
  action?: TAction;
  path: string;
  method: Method;
}) {
  const route = { path, method, params, query, body, response, action };
  return route satisfies ApiRouteDef<TParam, TQuery, TBody, TResponse, TAction>;
}

export type RequestQuery<T extends AnyApiRouteDef> = T['query'] extends undefined
  ? {}
  : { query: z.infer<NonNullable<T['query']>> };

export type RequestBody<T extends AnyApiRouteDef> = T['body'] extends undefined
  ? {}
  : { body: z.infer<NonNullable<T['body']>> };

export type RequestParams<T extends AnyApiRouteDef> = T['params'] extends undefined
  ? {}
  : { params: z.infer<NonNullable<T['params']>> };

export type RequestResponse<T extends AnyApiRouteDef> = T['response'] extends undefined
  ? {}
  : { response: z.infer<NonNullable<T['response']>> };

export type ResponseType = 'json' | 'buffer' | 'raw';

export type RequestConfig = Omit<RequestInit, 'method' | 'credentials' | 'body' | 'query' | 'params'> & {
  withCredentials?: boolean;
  timeout?: number;
  baseUrl?: string;
  responseType?: ResponseType;
  skipResponseValidation?: boolean;
};

export type RequestReturnType<
  T extends AnyApiRouteDef,
  C extends RequestConfig,
> = C['responseType'] extends 'buffer'
  ? ArrayBuffer
  : C['responseType'] extends 'raw'
    ? Response
    : T['response'] extends undefined
      ? {}
      : z.infer<NonNullable<T['response']>>;

export type SseRequestConfig<T extends AnyApiRouteDef> = RequestConfig & {
  onNext: (data: z.infer<NonNullable<T['response']>>) => unknown;
  onError?: (error: unknown) => void;
  onConnect?: () => void;
  onClose?: () => void;
};

export type ApiConfig = {
  baseUrl: string;
  headers?: Record<string, string>;
  onUnauthorized?: (error: Error) => void;
  skipResponseValidation?: boolean;
  timeout?: number;
};

export type SuccessResponse<T> = [T, null];
export type ErrorResponse = [null, Error];
export type ApiResponse<T> = Promise<SuccessResponse<T> | ErrorResponse>;

export type ApiResult<T extends AnyApiRouteDef> =
  T extends ApiRouteDef<infer _P, infer _Q, infer _B, infer R, infer _A>
    ? R extends z.ZodMiniType
      ? z.infer<R>
      : never
    : never;

export type ApiBody<T extends AnyApiRouteDef> =
  T extends ApiRouteDef<infer _P, infer _Q, infer B, infer _R, infer _A>
    ? B extends z.ZodMiniType
      ? z.infer<B>
      : never
    : never;

export type ApiQuery<T extends AnyApiRouteDef> =
  T extends ApiRouteDef<infer _P, infer Q, infer _B, infer _R, infer _A>
    ? Q extends z.ZodMiniObject
      ? z.infer<Q>
      : never
    : never;

export type ApiParams<T extends AnyApiRouteDef> =
  T extends ApiRouteDef<infer P, infer _Q, infer _B, infer _R, infer _A>
    ? P extends z.ZodMiniObject
      ? z.infer<P>
      : never
    : never;

export type ExtractActions<T> = T extends { action?: infer A }
  ? A extends string
    ? A
    : T extends Record<string, infer U>
      ? ExtractActions<U>
      : never
  : T extends Record<string, infer U>
    ? ExtractActions<U>
    : never;

export type ExtractActionValue<T> =
  T extends ApiRouteDef<infer P, infer Q, infer B, infer _R, infer A>
    ? A extends string
      ? {
          [key in A]: {
            params: P extends z.ZodMiniObject ? z.infer<P> : never;
            query: Q extends z.ZodMiniObject ? z.infer<Q> : never;
            body: B extends z.ZodMiniType ? z.infer<B> : never;
          };
        }
      : T extends Record<string, infer U>
        ? ExtractActionValue<U>
        : never
    : T extends Record<string, infer U>
      ? ExtractActionValue<U>
      : never;
