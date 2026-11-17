import { api } from '@mindustry-tool/api';
import { PlayerConnectEvent } from '@mindustry-tool/api';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ActivityType, BaseGuildTextChannel, Client, EmbedBuilder, Message } from 'discord.js';
import { PlayerConnectService } from 'src/services/player-connect/player-connect.service';
import { ApiService } from 'src/api/api.service';

@Injectable()
export class EventsHandler implements OnModuleInit {
  private readonly logger = new Logger(EventsHandler.name);

  private ROOM_MESSAGE_FOOTER = '324762387';

  private lastRoomData?: PlayerConnectEvent['rooms'] = undefined;

  private shouldReconnect = true;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 10 * 60 * 1000;
  private currentDelay = this.reconnectDelay;
  private abortController = new AbortController();

  constructor(
    private readonly client: Client,
    private readonly apiService: ApiService,
    private readonly playerConnectService: PlayerConnectService,
  ) {}

  onModuleInit() {
    void this.connectSse();
  }

  private async connectSse() {
    while (this.shouldReconnect) {
      try {
        await this.apiService.apiV4Instance.sse(api.v4.playerConnects.sse, {
          signal: this.abortController.signal,
          onConnect: () => {
            this.logger.log('Connected to backend SSE for player-connects');
            this.currentDelay = this.reconnectDelay;
          },
          onNext: async (event) => {
            await this.onPlayerConnect(event);
          },
          onError: (err) => {
            this.logger.error('SSE error:', err);
          },
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          this.logger.error(`SSE connection error: ${err.message}`);
        }
      }

      if (this.shouldReconnect) {
        this.logger.log(`Reconnecting to SSE in ${this.currentDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, this.currentDelay));
        this.currentDelay = Math.min(Math.round(this.currentDelay * 1.5) + 100, this.maxReconnectDelay);
      }
    }
  }

  private updateBotPresence(rooms: PlayerConnectEvent['rooms']) {
    const totalPlayers = rooms.reduce((acc, room) => acc + room.data.players.length, 0);
    const statusText = rooms.length > 0 ? `${rooms.length} rooms • ${totalPlayers} players` : 'No active rooms';

    this.client.user?.setPresence({
      activities: [
        {
          name: statusText,
          type: ActivityType.Watching,
        },
      ],
      status: rooms.length > 0 ? 'online' : 'idle',
    });
  }

  async onPlayerConnect(event: PlayerConnectEvent) {
    try {
      const channelIds = ['1417747176368509058'];

      const rooms = event.rooms;

      // Update bot presence/activity
      this.updateBotPresence(rooms);

      const roomDataString = this.playerConnectService.formatRoomsPlainText(rooms);

      const isNewRoomCreated = this.lastRoomData && this.lastRoomData.length < rooms.length;

      this.lastRoomData = rooms;

      // Process each channel independently
      const results = await Promise.allSettled(
        channelIds.map((channelId) =>
          this.updatePlayerConnectChannel(channelId, rooms, roomDataString, isNewRoomCreated),
        ),
      );

      // Log results for each channel
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.error(`Channel ${channelIds[index]} failed: ${result.reason}`);
        }
      });
    } catch (error) {
      this.logger.error('Player connect handler error:', error);
    }
  }

  private async updatePlayerConnectChannel(
    channelId: string,
    rooms: PlayerConnectEvent['rooms'],
    roomDataString: string,
    isNewRoomCreated: boolean | undefined,
  ) {
    const channel = await this.client.channels.fetch(channelId);

    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    if (!(channel instanceof BaseGuildTextChannel)) {
      throw new Error(`Channel ${channelId} is not a text channel, type: ${channel?.type}`);
    }

    const messages = await channel.messages.fetch({ limit: 5 });

    let lastMessage: Message<true> | undefined = undefined;
    const messagesToDelete: Message<true>[] = [];

    // First pass: find the room message and collect messages to delete
    for (const [, message] of messages) {
      if (
        lastMessage === undefined &&
        message.embeds.length > 0 &&
        message.embeds[0].footer?.text === this.ROOM_MESSAGE_FOOTER
      ) {
        lastMessage = message;
      } else {
        messagesToDelete.push(message);
      }
    }

    // Delete other messages (non-blocking)
    for (const message of messagesToDelete) {
      message
        .delete()
        .catch((error) => this.logger.warn(`[${channelId}] Failed to delete message ${message.id}: ${error}`));
    }

    const embed = new EmbedBuilder()
      .setFooter({ text: this.ROOM_MESSAGE_FOOTER })
      .setDescription(roomDataString)
      .setColor('#ffd700')
      .setImage('https://image.mindustry-tool.com/media/019a9155-8e14-74b7-9609-ae9e7622e5f4.png');

    if (lastMessage && !isNewRoomCreated) {
      if (rooms.length === 0) {
        await lastMessage.delete().catch((error) => this.logger.error(`[${channelId}] Failed to delete:`, error));
      } else {
        await lastMessage
          .edit({ embeds: [embed] })
          .catch((error) => this.logger.error(`[${channelId}] Failed to edit:`, error));
      }
    } else {
      if (lastMessage) {
        await lastMessage.delete().catch((error) => this.logger.error(`[${channelId}] Failed to delete:`, error));
      }
      await channel
        .send({ embeds: [embed] })
        .catch((error) => this.logger.error(`[${channelId}] Failed to send:`, error));
    }
  }
}
