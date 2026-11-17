import { Request, Response, NextFunction } from 'express';
import { Injectable, Logger, NestMiddleware, OnModuleDestroy } from '@nestjs/common';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { getClientFromMetricId, getMetricId, getRealIp } from '@/utils/query.utils';

const ignored = ['/api/v4/health', '/api/v4/prometheus'];

@Injectable()
export class LoggerMiddleware implements NestMiddleware, OnModuleDestroy {
  private readonly sweepInterval: NodeJS.Timeout;
  private readonly cuncurrentDuration = 30 * 60 * 1000;
  private readonly logger = new Logger(LoggerMiddleware.name);

  private readonly midUsers = new Map<string, { client: 'web' | 'mod' | 'unknown'; expireAt: number }>();
  private readonly anonymousUsers = new Map<string, number>();

  constructor(private prometheusService: PrometheusService) {
    this.prometheusService.cuncurrentUserGauge.set({ client: 'web' }, 0);
    this.prometheusService.cuncurrentUserGauge.set({ client: 'mod' }, 0);
    this.prometheusService.cuncurrentUserGauge.set({ client: 'unknown' }, 0);
    this.prometheusService.cuncurrentUserAnonymousGauge.set({}, 0);

    this.sweepInterval = setInterval(() => {
      this.sweepExpired();
    }, 30_000);
    this.sweepInterval.unref();
  }

  onModuleDestroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
    }
  }

  sweepExpired(): void {
    const now = Date.now();

    for (const [key, record] of this.midUsers.entries()) {
      if (record.expireAt <= now) {
        this.midUsers.delete(key);
      }
    }

    for (const [ip, expireAt] of this.anonymousUsers.entries()) {
      if (expireAt <= now) {
        this.anonymousUsers.delete(ip);
      }
    }

    let web = 0;
    let mod = 0;
    let unknown = 0;

    for (const record of this.midUsers.values()) {
      if (record.client === 'web') {
        web++;
      } else if (record.client === 'mod') {
        mod++;
      } else {
        unknown++;
      }
    }

    this.prometheusService.cuncurrentUserGauge.set({ client: 'web' }, web);
    this.prometheusService.cuncurrentUserGauge.set({ client: 'mod' }, mod);
    this.prometheusService.cuncurrentUserGauge.set({ client: 'unknown' }, unknown);
    this.prometheusService.cuncurrentUserAnonymousGauge.set({}, this.anonymousUsers.size);
  }

  use(request: Request, response: Response, next: NextFunction): void {
    response.on('finish', () => {
      const { originalUrl } = request;
      const clientId = String(request.headers['x-client-id']);

      if (!ignored.includes(originalUrl) && clientId !== 'WEB-SERVER') {
        const metricId = getMetricId(request);
        const now = Date.now();
        const expireAt = now + this.cuncurrentDuration;

        if (metricId) {
          const client = getClientFromMetricId(metricId);
          const existing = this.midUsers.get(metricId);

          this.midUsers.set(metricId, { client, expireAt });

          if (!existing) {
            this.prometheusService.cuncurrentUserGauge.inc({ client }, 1);
          } else if (existing.client !== client) {
            this.prometheusService.cuncurrentUserGauge.dec({ client: existing.client }, 1);
            this.prometheusService.cuncurrentUserGauge.inc({ client }, 1);
          }
        } else {
          const realIp = getRealIp(request);
          const exists = this.anonymousUsers.has(realIp);

          this.anonymousUsers.set(realIp, expireAt);

          if (!exists) {
            this.prometheusService.cuncurrentUserAnonymousGauge.inc({}, 1);
          }
        }
      }
    });

    next();
  }
}
