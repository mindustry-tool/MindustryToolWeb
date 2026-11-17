import { Controller, Get, Header } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { contentType } from 'prom-client';

@Controller('prometheus')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  @Header('Content-Type', contentType)
  async getMetrics() {
    const data = await this.prometheusService.getMetrics();

    return data;
  }
}
