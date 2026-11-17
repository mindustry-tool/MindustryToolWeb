import { Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { WsMessage, rawDataToText } from '../protocol';

export type TextFrameHandler = (text: string) => void;
export type BinaryFrameHandler = (frame: Buffer) => void;

/** Thin wrapper over a single `ws.WebSocket`: send + raw frame decoding. */
export class ChannelTransport {
  private readonly logger = new Logger(ChannelTransport.name);

  constructor(private readonly ws: WebSocket) {}

  get socket(): WebSocket {
    return this.ws;
  }

  get isOpen(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }

  onMessage(onText: TextFrameHandler, onBinary: BinaryFrameHandler): void {
    this.ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
      if (isBinary) {
        const buf = ChannelTransport.toBuffer(data);
        if (!buf) {
          this.logger.warn('Received binary frame of unknown shape; dropping');
          return;
        }
        onBinary(buf);
      } else {
        const text = rawDataToText(data);
        if (text === null) {
          this.logger.warn('Received text frame of unknown shape; dropping');
          return;
        }
        onText(text);
      }
    });
  }

  onClose(listener: () => void): void {
    this.ws.on('close', listener);
  }

  onError(listener: (err: Error) => void): void {
    this.ws.on('error', listener);
  }

  sendText(msg: WsMessage<unknown>): void {
    if (!this.isOpen) return;
    this.ws.send(JSON.stringify(msg));
  }

  sendBinary(frame: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.send(frame, { binary: true }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private static toBuffer(data: WebSocket.RawData): Buffer | null {
    if (Buffer.isBuffer(data)) return data;
    if (data instanceof ArrayBuffer) return Buffer.from(data);
    if (Array.isArray(data)) return Buffer.concat(data);
    return null;
  }
}
