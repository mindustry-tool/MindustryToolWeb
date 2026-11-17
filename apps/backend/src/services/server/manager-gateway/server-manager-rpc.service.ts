import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RpcChannel, SubscriptionHandle } from './channel/rpc-channel';
import {
  RpcDescriptor,
  RpcRequest,
  RpcResponse,
  StreamDescriptor,
  StreamMetadata,
  StreamResponse,
  SubscriptionDescriptor,
  SubscriptionParams,
  SubscriptionEvent,
  PushHandle,
  SubscribeContext,
} from './protocol';
import { StreamData, StreamOptions } from './channel/stream-endpoint';
import { ManagerGateway, GatewayEventHandler } from './manager-gateway';

/** Domain-facing RPC surface to managers, owning `serverId → managerId` resolution. */
@Injectable()
export class ManagerRpcClient {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gateway: ManagerGateway,
  ) {}

  isOnline(managerId: string): boolean {
    return this.gateway.isOnline(managerId);
  }

  /** Register a listener for inbound `event` notifications from any manager. */
  onEvent(handler: GatewayEventHandler): void {
    this.gateway.onEvent(handler);
  }

  sendRequest<D extends RpcDescriptor>(
    managerId: string,
    descriptor: D,
    payload: RpcRequest<D>,
    timeoutMs?: number,
  ): Promise<RpcResponse<D>> {
    return this.gateway.sendRequest(managerId, descriptor, payload, timeoutMs);
  }

  sendNotification<D extends RpcDescriptor>(managerId: string, descriptor: D, payload: RpcRequest<D>): void {
    this.gateway.sendNotification(managerId, descriptor, payload);
  }

  /** Send a byte-stream to a connected manager over the generic stream protocol. */
  sendStream<D extends StreamDescriptor>(
    managerId: string,
    descriptor: D,
    metadata: StreamMetadata<D>,
    data: StreamData,
    opts?: StreamOptions,
  ): Promise<StreamResponse<D>> {
    return this.requireChannel(managerId).sendStream(descriptor, metadata, data, opts);
  }

  async sendRequestForServer<D extends RpcDescriptor>(
    serverId: string,
    descriptor: D,
    payload: RpcRequest<D>,
    timeoutMs?: number,
  ): Promise<RpcResponse<D>> {
    const managerId = await this.resolveManagerId(serverId);
    return this.gateway.sendRequest(managerId, descriptor, payload, timeoutMs);
  }

  async subscribeForServer<D extends SubscriptionDescriptor>(
    serverId: string,
    descriptor: D,
    data: SubscriptionParams<D>,
    handler: (event: SubscriptionEvent<D>) => void,
    timeoutMs?: number,
  ): Promise<SubscriptionHandle> {
    const managerId = await this.resolveManagerId(serverId);
    return this.subscribe(managerId, descriptor, data, handler, timeoutMs);
  }

  subscribe<D extends SubscriptionDescriptor>(
    managerId: string,
    descriptor: D,
    data: SubscriptionParams<D>,
    handler: (event: SubscriptionEvent<D>) => void,
    timeoutMs?: number,
  ): Promise<SubscriptionHandle> {
    return this.requireChannel(managerId).subscribe(descriptor, data, handler, timeoutMs);
  }

  registerSubscriptionHandler<D extends SubscriptionDescriptor>(
    managerId: string,
    descriptor: D,
    onSubscribe: (params: SubscriptionParams<D>, pushHandle: PushHandle, context: SubscribeContext) => Promise<void>,
  ): void {
    this.requireChannel(managerId).registerSubscriptionHandler(descriptor, onSubscribe);
  }

  unregisterSubscriptionHandler(managerId: string, descriptor: SubscriptionDescriptor): void {
    this.gateway.getChannel(managerId)?.unregisterSubscriptionHandler(descriptor);
  }

  unsubscribe(managerId: string, requestId: string, reason?: string): void {
    this.gateway.getChannel(managerId)?.unsubscribe(requestId, reason);
  }

  onSubscriptionClose(managerId: string, requestId: string, callback: () => void): void {
    this.gateway.getChannel(managerId)?.onSubscriptionClose(requestId, callback);
  }

  private async resolveManagerId(serverId: string): Promise<string> {
    const server = await this.prismaService.server.findFirstOrThrow({
      where: { id: serverId, deletedAt: null },
      select: { managerId: true },
    });

    const managerId = server.managerId;
    if (!managerId) {
      throw new ServiceUnavailableException(`Server ${serverId} has no manager assigned`);
    }
    return managerId;
  }

  private requireChannel(managerId: string): RpcChannel {
    const channel = this.gateway.getChannel(managerId);
    if (!channel) {
      throw new ServiceUnavailableException(`Server Manager ${managerId} is currently offline or not connected`);
    }
    return channel;
  }
}
