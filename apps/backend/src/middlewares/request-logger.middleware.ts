import { getRealIp } from '@/utils/query.utils';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const ignored = ['/api/v4/health', '/api/v4/prometheus'];

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(request: Request, _response: Response, next: NextFunction): void {
    const path = request.originalUrl.split('?')[0];

    if (!ignored.includes(path)) {
      this.logger.log(`${request.method} ${path} ${getRealIp(request)}`);
    }

    next();
  }
}