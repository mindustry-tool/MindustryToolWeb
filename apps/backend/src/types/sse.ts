import { Logger, MessageEvent } from '@nestjs/common';
import { Response } from 'express';

export class Sse {
  private static logger = new Logger(Sse.name);
  private closed = false;
  private onCloseCallback?: () => void;

  constructor(private readonly response: Response) {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    response.flushHeaders?.();

    response.on('close', () => {
      this.close();
    });
  }

  next(msg: MessageEvent) {
    if (this.closed) {
      return;
    }

    try {
      if (msg.type) {
        this.response.write(`event: ${msg.type}\n`);
      }

      if (msg.id) {
        this.response.write(`id: ${msg.id}\n`);
      }

      if (msg.retry) {
        this.response.write(`retry: ${msg.retry}\n`);
      }

      const start = performance.now();
      const serialized = JSON.stringify(msg.data);
      const elapsed = performance.now() - start;
      const threshold = parseInt(process.env.SSE_SERIALIZE_THRESHOLD_MS || '10', 10);

      if (elapsed > threshold) {
        Sse.logger.warn(`SSE serialization took ${elapsed.toFixed(2)}ms (threshold: ${threshold}ms)`);
      }

      this.response.write(`data: ${serialized}\n\n`);
    } catch (err) {
      Sse.logger.error(`Error writing SSE message: ${err}`);
    }
  }

  nextRaw(msg: { type?: string; id?: string; retry?: number; data: string }) {
    if (this.closed) {
      return;
    }

    try {
      if (msg.type) {
        this.response.write(`event: ${msg.type}\n`);
      }

      if (msg.id) {
        this.response.write(`id: ${msg.id}\n`);
      }

      if (msg.retry) {
        this.response.write(`retry: ${msg.retry}\n`);
      }

      this.response.write(`data: ${msg.data}\n\n`);
    } catch (err) {
      Sse.logger.error(`Error writing SSE raw message: ${err}`);
    }
  }

  error(err: unknown) {
    try {
      this.response.write(`event: error\ndata: ${JSON.stringify(err)}\n\n`);
    } catch (e) {
      Sse.logger.error(e);
    }

    this.close();
  }

  complete() {
    this.close();
  }

  onClose(callback: () => void) {
    this.onCloseCallback = callback;
  }

  private close() {
    if (this.closed) return;

    this.closed = true;

    try {
      this.response.end();
    } catch (err) {
      Sse.logger.error(`Error closing SSE response: ${err}`);
    }

    try {
      this.onCloseCallback?.();
    } catch (err) {
      Sse.logger.error(`Error in onClose callback: ${err}`);
    }
  }
}
