import { WebSocket } from 'ws';
import { RpcChannel } from './channel/rpc-channel';
import { MANAGER_REPLACED_CLOSE_CODE } from './protocol';
import { ManagerStatusNotifier } from './manager-status-notifier';

/** Registry entry per connected server-manager. */
export interface ManagerConnection {
  managerId: string;
  channel: RpcChannel;
  ws: WebSocket;
}

/** Live manager connections with replacement and stale-close semantics (Java sessionsEqual). */
export class ConnectionRegistry {
  private readonly connections = new Map<string, ManagerConnection>();

  constructor(private readonly notifier: ManagerStatusNotifier) {}

  get(managerId: string): ManagerConnection | undefined {
    return this.connections.get(managerId);
  }

  isOnline(managerId: string): boolean {
    return this.connections.has(managerId);
  }

  /**
   * Register a connection, replacing any live socket for the same manager with
   * close code 4234 (mirrors Java reconnect handling).
   */
  register(connection: ManagerConnection): void {
    const existing = this.connections.get(connection.managerId);
    if (existing && existing.ws !== connection.ws) {
      try {
        existing.ws.close(MANAGER_REPLACED_CLOSE_CODE, 'Replaced by new connection');
      } catch {
        // Old socket already dead; replacement still proceeds
      }
    }

    this.connections.set(connection.managerId, connection);
    this.notifier.opened(connection.managerId);
  }

  /**
   * Evict the connection only when the closing socket is the registered one.
   * @returns true when the registered connection was removed.
   */
  removeIfCurrent(managerId: string, ws: WebSocket): boolean {
    const current = this.connections.get(managerId);
    if (!current || current.ws !== ws) {
      return false;
    }
    this.connections.delete(managerId);
    this.notifier.closed(managerId);
    return true;
  }
}
