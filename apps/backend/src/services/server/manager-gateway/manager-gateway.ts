import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { HttpAdapterHost } from '@nestjs/core';
import { Stream } from 'stream';
import { RpcChannel, TIMEOUT_DEFAULT_MS } from './channel/rpc-channel';
import { RpcDescriptor, RpcRequest, RpcResponse } from './protocol';
import { eventDescriptors, GatewayEvent } from './descriptors/events.descriptors';
import { ManagerAuthenticator } from './manager-authenticator';
import { ConnectionRegistry } from './connection-registry';

export type InboundEventHandler<T = unknown> = (managerId: string, payload: T) => void | Promise<void>;
export type GatewayEventHandler = InboundEventHandler<GatewayEvent>;

/** Raw WebSocket gateway for Server Manager connections at `/managers/gateway`. */
@Injectable()
export class ManagerGateway implements OnModuleInit {
  private readonly logger = new Logger(ManagerGateway.name);
  private readonly eventHandlers: GatewayEventHandler[] = [];
  private wss!: WebSocketServer;

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly authenticator: ManagerAuthenticator,
    private readonly registry: ConnectionRegistry,
  ) {}

  onModuleInit() {
    this.wss = new WebSocketServer({ noServer: true });

    const httpServer = this.adapterHost.httpAdapter.getHttpServer() as import('http').Server;

    httpServer.on('upgrade', (req, socket, head) => {
      const pathname = req.url ? req.url.split('?')[0] : '';

      if (pathname !== '/managers/gateway') {
        socket.destroy();
        return;
      }

      this.handleUpgrade(req, socket, head);
    });

    this.logger.log('WS gateway server attached at /managers/gateway');
  }

  isOnline(managerId: string): boolean {
    return this.registry.isOnline(managerId);
  }

  getChannel(managerId: string): RpcChannel | undefined {
    return this.registry.get(managerId)?.channel;
  }

  sendRequest<D extends RpcDescriptor>(
    managerId: string,
    descriptor: D,
    payload: RpcRequest<D>,
    timeoutMs = TIMEOUT_DEFAULT_MS,
  ): Promise<RpcResponse<D>> {
    const conn = this.registry.get(managerId);
    if (!conn) {
      throw new ServiceUnavailableException(`Server Manager ${managerId} is currently offline or not connected`);
    }
    return conn.channel.sendRequest(descriptor, payload, timeoutMs);
  }

  /** Send a fire-and-forget notification to a connected manager. */
  sendNotification<D extends RpcDescriptor>(managerId: string, descriptor: D, payload: RpcRequest<D>): void {
    const conn = this.registry.get(managerId);
    if (!conn) return;
    conn.channel.sendNotification(descriptor, payload);
  }

  /** Register a listener for inbound `event` notifications from any manager. */
  onEvent(handler: GatewayEventHandler) {
    this.eventHandlers.push(handler);
  }

  private handleUpgrade(req: IncomingMessage, socket: Stream.Duplex, head: Buffer) {
    this.authenticator
      .authenticate(req)
      .then((managerId) => {
        if (!managerId) {
          socket.end(
            'HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\nContent-Length: 12\r\nConnection: close\r\n\r\nUnauthorized',
          );
          return;
        }

        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.registerConnection(managerId, ws);
        });
      })
      .catch((err) => {
        this.logger.error('Error during WS upgrade authentication', err);
        socket.end(
          'HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\nContent-Length: 21\r\nConnection: close\r\n\r\nInternal Server Error',
        );
      });
  }

  private registerConnection(managerId: string, ws: WebSocket) {
    const channel = new RpcChannel(ws);
    this.registry.register({ managerId, channel, ws });

    this.logger.log(`Manager ${managerId} connected via WS`);

    channel.registerHandler(eventDescriptors.managerEvent, async (payload) => {
      for (const handler of this.eventHandlers) {
        try {
          await handler(managerId, payload);
        } catch (err) {
          this.logger.error(`Event handler error for manager ${managerId}`, err);
        }
      }
      return undefined;
    });

    ws.on('close', () => {
      if (!this.registry.removeIfCurrent(managerId, ws)) {
        this.logger.log(`Stale socket for manager ${managerId} closed; keeping current connection`);
        return;
      }
      this.logger.log(`Manager ${managerId} disconnected`);
    });

    ws.on('error', (err) => {
      this.logger.error(`WS error for manager ${managerId}`, err);
    });
  }
}
