import { pipeline } from 'stream';
import { promisify } from 'util';
import type { Readable } from 'stream';
import type { Response } from 'express';

export const pipelineAsync = promisify(pipeline);

const CLIENT_ABORT_CODES = new Set([
  'ERR_STREAM_UNABLE_TO_PIPE',
  'ERR_STREAM_PREMATURE_CLOSE',
  'ERR_STREAM_DESTROYED',
  'ECONNRESET',
  'EPIPE',
]);

/**
 * Safely pipes a readable stream to an Express response.
 * Handles client disconnects/aborts gracefully without throwing unhandled exceptions,
 * and ensures the source stream is destroyed to prevent resource leaks.
 */
export async function pipeStreamToResponse(stream: Readable, res: Response): Promise<void> {
  if (res.destroyed || res.writableEnded || !res.writable) {
    stream.destroy();
    return;
  }

  const onClose = () => {
    stream.destroy();
  };

  res.once('close', onClose);

  try {
    await pipelineAsync(stream, res);
  } catch (err: unknown) {
    stream.destroy();

    const errCode =
      typeof err === 'object' && err !== null && 'code' in err
        ? String(err.code)
        : undefined;
    const errMsg = err instanceof Error ? err.message : undefined;

    const isClientAbort =
      (errCode !== undefined && CLIENT_ABORT_CODES.has(errCode)) ||
      res.destroyed ||
      !res.writable ||
      Boolean(errMsg?.includes('closed or destroyed stream')) ||
      Boolean(errMsg?.includes('Premature close'));

    if (!isClientAbort) {
      if (!res.headersSent) {
        res.removeHeader('Content-Type');
        res.removeHeader('Cache-Control');
        res.removeHeader('Content-Disposition');
      }
      throw err;
    }
  } finally {
    res.off('close', onClose);
  }
}

