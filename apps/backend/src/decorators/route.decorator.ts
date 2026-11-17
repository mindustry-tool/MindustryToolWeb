import { Sse } from '@/types/sse';
import { getRealIp } from '@/utils/query.utils';
import { rateLimiter, clearRequestCron } from '@/rate-limiter/rate-limiter';
import { LimitOptions, RequestLimitMap } from '@/rate-limiter/rate-limiter.types';
import { ApiRouteDef, RequestBody, RequestParams, RequestQuery } from '@mindustry-tool/api';
import { AuthFilter, hasAccess } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import {
  applyDecorators,
  BadRequestException,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Patch,
  Post,
  Put,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiResponse, SchemaObject } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';
import { z, ZodMiniObject, ZodMiniType } from 'zod/v4-mini';

export { clearRequestCron, LimitOptions, RequestLimitMap };

export const ROUTE_METADATA_KEY = 'route';

const logger = new Logger('RouteHanlder');

const methodMap: Record<ApiRouteDef['method'], (path: string) => MethodDecorator> = {
  GET: Get,
  POST: Post,
  PUT: Put,
  DELETE: Delete,
  PATCH: Patch,
} as const;

export function Route<
  TParam extends ZodMiniObject | undefined = undefined,
  TQuery extends ZodMiniObject | undefined = undefined,
  TBody extends ZodMiniType | undefined = undefined,
  TAction extends string | undefined = undefined,
>(
  route: ApiRouteDef<TParam, TQuery, TBody, ZodMiniType | undefined, TAction>,
  options?: {
    formData?: boolean;
  },
) {
  if (!route || !methodMap[route.method]) {
    throw new InternalServerErrorException(`Invalid method: ${route.method}`);
  }

  const decorator: MethodDecorator = methodMap[route.method](route.path);
  const decorators = [decorator, SetMetadata(ROUTE_METADATA_KEY, route)];

  if (options?.formData) {
    decorators.push(FormDataRequest());
  }

  try {
    if (route.body) {
      decorators.push(
        ApiBody({
          schema: z.toJSONSchema(route.body, { target: 'openapi-3.0', unrepresentable: 'any' }) as SchemaObject,
        }),
      );
    }

    if (route.query && route.query.shape) {
      for (const [name, def] of Object.entries(route.query.shape)) {
        try {
          decorators.push(
            ApiQuery({
              name,
              schema: z.toJSONSchema(def, { target: 'openapi-3.0', unrepresentable: 'any' }) as SchemaObject,
              required: !(def._zod.def.type === 'optional'),
              nullable: def._zod.def.type === 'nullable',
            }),
          );
        } catch (error) {
          logger.error(error);
        }
      }
    }

    if (route.params && route.params.shape) {
      for (const [name, def] of Object.entries(route.params.shape)) {
        try {
          decorators.push(
            ApiParam({
              name,
              schema: z.toJSONSchema(def, { target: 'openapi-3.0', unrepresentable: 'any' }) as SchemaObject,
              required: !(def._zod.def.type === 'optional'),
            }),
          );
        } catch (error) {
          logger.error(error);
        }
      }
    }

    if (route.response) {
      decorators.push(
        ApiResponse({
          schema: z.toJSONSchema(route.response, { target: 'openapi-3.0', unrepresentable: 'any' }) as SchemaObject,
        }),
      );
    }
  } catch (error) {
    logger.error(error);
  }

  return applyDecorators(...decorators);
}

export type RouteOptions = { filter?: AuthFilter } & LimitOptions;

export type SseRouteOptions<
  T extends ApiRouteDef<ZodMiniObject, ZodMiniObject, ZodMiniType, ZodMiniType, string>,
  TFilter extends AuthFilter | undefined = undefined,
> = {
  filter?: TFilter;
  authorize?: (
    props: {
      req: Request;
      res: Response;
      user: TFilter extends AuthFilter ? Session : Session | null;
    } & RequestQuery<T> &
      RequestBody<T> &
      RequestParams<T>,
  ) => Promise<void> | void;
} & LimitOptions;

type Exact<T, Shape> = T extends Shape ? (Exclude<keyof T, keyof Shape> extends never ? T : never) : never;

function validateRequest<T extends ApiRouteDef<ZodMiniObject, ZodMiniObject, ZodMiniType, ZodMiniType, string>>(
  route: T,
  {
    req,
    base,
  }: {
    req: Request;
    base: RequestQuery<T> & RequestBody<T> & RequestParams<T>;
  },
) {
  if (route.params) {
    const { success, data, error } = route.params.safeParse(req.params);

    if (!success) {
      throw new BadRequestException(z.prettifyError(error) + '\nBad params: ' + JSON.stringify(req.params));
    }

    (base as Record<string, unknown>).params = data;
  }

  if (route.query) {
    const { success, data, error } = route.query.safeParse(req.query);

    if (!success) {
      throw new BadRequestException(z.prettifyError(error) + '\nBad query: ' + JSON.stringify(req.query));
    }

    (base as Record<string, unknown>).query = data;
  }

  if (route.body) {
    const { success, data, error } = route.body.safeParse(req.body);

    if (!success) {
      throw new BadRequestException(z.prettifyError(error) + '\nBad body: ' + JSON.stringify(req.body));
    }

    (base as Record<string, unknown>).body = data;
  }
}

export function routeHandler<
  T extends ApiRouteDef<ZodMiniObject, ZodMiniObject, ZodMiniType, ZodMiniType, string>,
  TOptions extends RouteOptions | undefined = undefined,
>(
  route: T,
  handler: (
    props: {
      req: Request;
      res: Response;
      user: TOptions extends { filter: AuthFilter } ? Session : Session | null;
    } & RequestQuery<T> &
      RequestBody<T> &
      RequestParams<T>,
  ) => Promise<z.infer<T['response'] extends undefined ? void : NonNullable<T['response']>>>,
  options?: Exact<NonNullable<TOptions>, RouteOptions>,
) {
  const handle = async (req: Request, res: Response, user: Session | null) => {
    const ip = getRealIp(req);

    if (rateLimiter.isBlocked(ip)) {
      throw new HttpException(`I'm a teapot`, HttpStatus.I_AM_A_TEAPOT);
    }

    if (options?.limit) {
      const [rate, unit] = options.limit;
      rateLimiter.checkPerRouteLimit(route.method, route.path, ip, rate, unit);
    }

    rateLimiter.checkTierLimit(ip, Boolean(route.action));

    if (options?.filter) {
      if (user == null) {
        throw new UnauthorizedException('You are not logged in, please login first');
      }

      if (!hasAccess(user, options.filter)) {
        throw new ForbiddenException();
      }
    }

    const base = { req, res, user } as Parameters<typeof handler>[0];

    validateRequest(route, { req, base });

    const data = await handler(base);

    if ('response' in route && route.response) {
      const { success, data: result, error } = route.response.safeParse(data);

      if (!success) {
        logger.error(error, 'Bad response: ' + JSON.stringify(data));
        throw new InternalServerErrorException('Bad response');
      }

      return result;
    }

    return data;
  };

  return { handle, options, type: 'json' };
}

export function sseRouteHandler<
  T extends ApiRouteDef<ZodMiniObject, ZodMiniObject, ZodMiniType, ZodMiniType, string>,
  TFilter extends AuthFilter | undefined = undefined,
>(
  route: T,
  handler: (
    props: {
      req: Request;
      res: Response;
      user: TFilter extends AuthFilter ? Session : Session | null;
      sse: Sse;
      next: (data: z.infer<NonNullable<T['response']>>) => void;
    } & RequestQuery<T> &
      RequestBody<T> &
      RequestParams<T>,
  ) => unknown,
  options?: SseRouteOptions<T, TFilter>,
) {
  const handle = async (req: Request, res: Response, user: Session | null) => {
    if (options?.filter) {
      if (user == null) {
        throw new UnauthorizedException('You are not logged in, please login first');
      }

      if (!hasAccess(user, options.filter)) {
        throw new ForbiddenException();
      }
    }

    const base = { req, res, user } as Parameters<typeof handler>[0];

    validateRequest(route, { req, base });

    if (options?.authorize) {
      await options.authorize(base);
    }

    const sse = new Sse(res);

    Object.assign(base, {
      sse,
      next: (data: z.infer<NonNullable<T['response']>>) => {
        if ('response' in route && route.response) {
          const { success, data: result, error } = route.response.safeParse(data);

          if (!success) {
            logger.error(error, 'Bad response: ' + JSON.stringify(data));
            throw new InternalServerErrorException('Bad response');
          }

          if (result === null || (typeof result !== 'object' && typeof result !== 'string')) {
            throw new InternalServerErrorException('Invalid response type: ' + typeof result);
          }

          sse.next({ data: result });
        } else {
          sse.next({ data: data as string | object });
        }
      },
    });

    sse.next({
      type: 'comment',
      data: 'Connected',
    });

    try {
      await handler(base);
    } catch (e) {
      sse.error(e);
    }
  };

  return { handle, options, type: 'sse' };
}
