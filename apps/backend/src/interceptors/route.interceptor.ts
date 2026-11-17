import { clearRequestCron, ROUTE_METADATA_KEY, routeHandler } from '@/decorators/route.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { getSessionOrNull } from '@/utils/auth.utils';
import { getMetricId, getRealIp } from '@/utils/query.utils';
import { ApiRouteDef } from '@mindustry-tool/api';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@/generated/prisma/client';
import { Request, Response } from 'express';
import { MemoryStoredFile } from 'nestjs-form-data';
import { from, isObservable, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { StatsService } from '@/services/stats/stats.service';

@Injectable()
export class RouteInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RouteInterceptor.name);

  private actions: Prisma.ActionCreateManyInput[] = [];

  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
    private prometheusService: PrometheusService,
    private statsService: StatsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const route: ApiRouteDef<any, any, any, any, any> | undefined = this.reflector.get(
      ROUTE_METADATA_KEY,
      context.getHandler(),
    );

    if (!route) {
      return next.handle();
    }

    const start = process.hrtime();

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const path = req.path;
    const pathTemplate = (req.route as { path: string }).path;

    const user = getSessionOrNull(req);
    let routeType: string | undefined;

    res.on('finish', () => {
      const [sec, nanosec] = process.hrtime(start);
      const duration = sec + nanosec / 1e9;

      const realIp = getRealIp(req);
      const { method } = req;
      const metricId = getMetricId(req);

      const { statusCode } = res;

      if (statusCode >= 400 && statusCode !== 404) {
        this.prometheusService.errorsGauge.inc({
          method,
          status: statusCode.toString(),
          url: pathTemplate,
        });

        const clientId = req.headers['x-client-id'] || '';
        const userAgent = req.headers['user-agent'] || '';
        const queryParams = req.query;
        const pathParams = req.params;

        const message = `
        Request: ${statusCode} ${method} ${pathTemplate} ${duration.toFixed(3)}s IP: ${realIp} UserAgent: ${userAgent} QueryParams: ${JSON.stringify(queryParams)} PathParams: ${JSON.stringify(pathParams)} User: ${JSON.stringify(user)} ClientID: ${String(clientId)}`;

        if (statusCode >= 500) {
          this.logger.error(message);
        } else {
          this.logger.debug(message);
        }
      } else {
        this.logger.debug(`${statusCode} ${method} ${path} ${duration.toFixed(3)}s ${realIp}`);
      }

      this.prometheusService.requestGauge.inc({
        method,
        status: statusCode.toString(),
        url: pathTemplate,
      });

      if (routeType !== 'sse') {
        this.prometheusService.responseTimeHistogram.observe(
          {
            method,
            status: statusCode.toString(),
            url: pathTemplate,
          },
          duration,
        );
      }

      const actionName = route.action;

      if (actionName && user && statusCode < 400) {
        this.prometheusService.actionGauge.inc({
          action: actionName,
        });

        this.actions.push({
          name: actionName,
          metadata: {
            params: req.params,
            query: req.query,
            body: this.filterFile(req.body),
          },
          triggeredBy: user.id,
          triggeredAt: new Date(),
        });
      }

      if (metricId && typeof metricId === 'string') {
        this.statsService.recordVisit(metricId).catch((err) => {
          this.logger.error('Failed to record metric visit', err);
        });
      }
    });

    return next.handle().pipe(
      mergeMap((handler) => {
        const { handle, type }: ReturnType<typeof routeHandler> = handler;
        routeType = type;

        if (typeof handle !== 'function') {
          throw new Error('Route handler must be a function');
        }

        const result = handle(req, res, user);

        if (type === 'sse') {
          // Forward async failures (e.g. 401 from auth check before SSE
          // headers are sent) to Nest's exception layer. Dropping the
          // promise here surfaces as an unhandled rejection and crashes
          // the process, while the client just hangs. On success the
          // observable stays open; SSE data flows through `res` directly.
          return new Observable((subscriber) => {
            Promise.resolve(result).then(
              () => {
                // Keep connection open; nothing to emit.
              },
              (err) => subscriber.error(err),
            );
          });
        }

        return from(result).pipe(mergeMap((r) => (isObservable(r) ? r : of(r))));
      }),
    );
  }

  filterFile(object: any): any {
    try {
      if (object instanceof MemoryStoredFile) {
        return '<file>';
      }

      if (object && typeof object === 'object') {
        if (Array.isArray(object)) {
          return object.map((value) => this.filterFile(value));
        }

        const result = {};
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            result[key] = this.filterFile((object as Record<string, unknown>)[key]);
          }
        }
        return result;
      }

      return object;
    } catch (err) {
      this.logger.error('Failed to filter file', err);
      return object;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'saveActions',
  })
  async saveActions() {
    if (this.actions.length > 0) {
      const data = this.actions;
      this.actions = [];
      try {
        await this.prismaService.action.createMany({ data });
      } catch (err) {
        this.logger.error(err);
      }
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'clearRequestLimitMap',
  })
  async clearRequestLimitMap() {
    clearRequestCron();
  }
}
