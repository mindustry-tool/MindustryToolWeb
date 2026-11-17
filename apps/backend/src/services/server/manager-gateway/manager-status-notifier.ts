import { Injectable, Logger } from '@nestjs/common';
import { SERVER_CONSTANTS } from '../server.constants';

export const MANAGER_STATUS_NOTIFIER = Symbol('MANAGER_STATUS_NOTIFIER');

/** Notified when a manager connection opens or closes. */
export interface ManagerStatusNotifier {
  opened(managerId: string): void;
  closed(managerId: string): void;
}

@Injectable()
export class DiscordManagerStatusNotifier implements ManagerStatusNotifier {
  private readonly logger = new Logger(DiscordManagerStatusNotifier.name);

  opened(managerId: string): void {
    this.send(managerId, 'open');
  }

  closed(managerId: string): void {
    this.send(managerId, 'close');
  }

  private send(managerId: string, status: 'open' | 'close'): void {
    const payload = JSON.stringify({
      embeds: [
        {
          title: managerId,
          color: status === 'open' ? 0xff69b4 : 0x3498db,
          fields: [{ name: 'Status', value: status, inline: false }],
        },
      ],
    });

    for (const webhook of SERVER_CONSTANTS.DISCORD_WEBHOOKS) {
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: AbortSignal.timeout(5000),
      }).catch((error) => this.logger.error('Failed to send default discord webhook', error));
    }
  }
}
