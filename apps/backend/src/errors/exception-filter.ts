import { ApiError } from '@mindustry-tool/api';
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { Request, Response } from 'express';
import { TimeoutError } from 'p-queue';

const CLIENT_ABORT_CODES = new Set([
  'ERR_STREAM_UNABLE_TO_PIPE',
  'ERR_STREAM_PREMATURE_CLOSE',
  'ERR_STREAM_DESTROYED',
  'ECONNRESET',
  'EPIPE',
]);

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent || response.destroyed || !response.writable) {
      return;
    }

    const errCode =
      typeof exception === 'object' && exception !== null && 'code' in exception
        ? String((exception as Record<string, unknown>).code)
        : undefined;
    const errMsg = exception instanceof Error ? exception.message : undefined;
    const isClientAbort =
      (errCode !== undefined && CLIENT_ABORT_CODES.has(errCode)) ||
      Boolean(errMsg?.includes('closed or destroyed stream')) ||
      Boolean(errMsg?.includes('Premature close'));

    if (isClientAbort) {
      return;
    }

    response.setHeader('Content-Type', 'application/json');

    // 1. Prisma Known Request Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        // Record not found → return 404
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Data not found inside database',
          error: 'Data was not found inside database',
        });
      }

      if (exception.code === 'P2002') {
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Data already exists',
          error: 'Data already exists',
        });
      }

      // Unhandled Prisma error
      this.logger.error(exception);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
      });
    }

    // 2. ApiError
    if (exception instanceof ApiError) {
      return response.status(exception.response.status).json(exception.response);
    }

    // 3. TimeoutError
    if (exception instanceof TimeoutError) {
      return response.status(HttpStatus.GATEWAY_TIMEOUT).json({
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        message: 'Gateway Timeout',
        error: exception.message,
      });
    }

    // 4. Handled HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();

      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    }

    // 5. Unknown, unhandled error
    this.logger.error(exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal Server Error',
    });
  }
}
