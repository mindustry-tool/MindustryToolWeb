import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';
import { monitorEventLoopDelay } from 'perf_hooks';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private readonly register: client.Registry;

  public readonly playerConnectPlayerGauge = new client.Gauge({
    name: 'player_connect_player',
    help: 'Player connect',
  });

  public readonly playerConnectProviderGauge = new client.Gauge({
    name: 'player_connect_provider',
    help: 'Player connect provider',
    labelNames: ['provider'],
  });

  public readonly playerConnectRoomGauge = new client.Gauge({
    name: 'player_connect_room',
    help: 'Player connect',
  });

  public readonly verifyGauge = new client.Gauge({
    name: 'verify',
    help: 'Content verified',
    labelNames: ['action', 'itemType', 'verifier'],
  });

  public readonly cuncurrentUserGauge = new client.Gauge({
    name: 'cuncurrent_user',
    help: 'Concurrent user',
    labelNames: ['client'],
  });

  public readonly cuncurrentUserAnonymousGauge = new client.Gauge({
    name: 'cuncurrent_user_anonymous',
    help: 'Concurrent user anonymous (without mid)',
  });
  
  public readonly errorsGauge = new client.Counter({
    name: 'errors',
    help: 'Errors',
    labelNames: ['method', 'status', 'url'],
  });

  public readonly requestGauge = new client.Counter({
    name: 'requests',
    help: 'Requests',
    labelNames: ['method', 'status', 'url'],
  });

  public readonly responseTimeHistogram = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'status', 'url'],
    buckets: [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
  });

  public readonly actionGauge = new client.Counter({
    name: 'actions',
    help: 'Actions',
    labelNames: ['action'],
  });

  public readonly playerGauge = new client.Counter({
    name: 'players',
    help: 'Players',
    labelNames: ['server'],
  });

  public readonly serverPlayerGauge = new client.Gauge({
    name: 'server_players',
    help: 'Server players',
    labelNames: ['server'],
  });

  public readonly tagCounter = new client.Counter({
    name: 'tag',
    help: 'Tag',
    labelNames: ['type', 'tag'],
  });

  public readonly downloadCounter = new client.Counter({
    name: 'download',
    help: 'Download',
    labelNames: ['type'],
  });

  public readonly eventLoopLagGauge = new client.Gauge({
    name: 'event_loop_lag_milliseconds',
    help: 'Event loop lag in milliseconds',
    labelNames: ['quantile'],
  });

  private eventLoopHistogram!: ReturnType<typeof monitorEventLoopDelay>;

  constructor() {
    this.register = new client.Registry();
    this.register.setDefaultLabels({ app: 'api-v4' });
    client.collectDefaultMetrics({ register: this.register });
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    this.register.registerMetric(this.playerConnectRoomGauge);
    this.register.registerMetric(this.playerConnectProviderGauge);
    this.register.registerMetric(this.playerConnectPlayerGauge);
    this.register.registerMetric(this.verifyGauge);
    this.register.registerMetric(this.cuncurrentUserGauge);
    this.register.registerMetric(this.cuncurrentUserAnonymousGauge);
    this.register.registerMetric(this.errorsGauge);
    this.register.registerMetric(this.responseTimeHistogram);
    this.register.registerMetric(this.requestGauge);
    this.register.registerMetric(this.actionGauge);
    this.register.registerMetric(this.playerGauge);
    this.register.registerMetric(this.serverPlayerGauge);
    this.register.registerMetric(this.tagCounter);
    this.register.registerMetric(this.downloadCounter);
    this.register.registerMetric(this.eventLoopLagGauge);

    this.eventLoopHistogram = monitorEventLoopDelay({ resolution: 20 });
    this.eventLoopHistogram.enable();

    setInterval(() => {
      this.eventLoopLagGauge.set({ quantile: 'p50' }, this.eventLoopHistogram.percentile(50) / 1e6);
      this.eventLoopLagGauge.set({ quantile: 'p95' }, this.eventLoopHistogram.percentile(95) / 1e6);
      this.eventLoopLagGauge.set({ quantile: 'p99' }, this.eventLoopHistogram.percentile(99) / 1e6);
      this.eventLoopHistogram.reset();
    }, 5000);
  }
}
