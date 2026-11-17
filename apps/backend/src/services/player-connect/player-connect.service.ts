import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PlayerConnectRoomWithLink, playerConnectRoomUpdateSchema, playerConnectRoomRemoveSchema } from '@mindustry-tool/api';
import { api } from '@mindustry-tool/api';
import { ApiResult } from '@mindustry-tool/api';
import { PlayerConnectEvent } from '@mindustry-tool/api';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { z } from 'zod/v4-mini';
import { EventSourceMessage, EventSourceParserStream } from 'eventsource-parser/stream';
import { Cache } from '@nestjs/cache-manager';
import { ProfanityService } from '@/services/profanity/profanity.service';
import { Sse } from '@/types/sse';

type PlayerConnectRoomUpdate = z.infer<typeof playerConnectRoomUpdateSchema>;

type SanitizedRoomResult = {
  room: PlayerConnectRoomUpdate;
  filteredFields: string[];
};

@Injectable()
export class PlayerConnectService {
  private readonly clients = new Set<Sse>();
  private rooms: Array<PlayerConnectRoomWithLink> = [];
  private readonly providers: Map<string, PlayerConnectProvider> = new Map();
  private readonly logger: Logger = new Logger(PlayerConnectService.name);

  private timeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly prometheusService: PrometheusService,
    private readonly cache: Cache,
    private readonly profanityService: ProfanityService,
  ) {}

  handleSse(sse: Sse, next: (data: ApiResult<typeof api.v4.playerConnects.sse>) => void) {
    this.clients.add(sse);
    sse.onClose(() => {
      this.clients.delete(sse);
    });

    next({
      rooms: this.rooms,
    });
  }

  private async onRoomUpdate() {
    this.prometheusService.playerConnectRoomGauge.set(this.rooms.length);
    this.prometheusService.playerConnectPlayerGauge.set(
      this.rooms.reduce((prev, curr) => prev + curr.data.players.length, 0),
    );

    const data: Map<string, number> = new Map();

    for (const room of this.rooms) {
      const provider = room.name;
      const count = data.get(provider) || 0;
      data.set(provider, count + 1);
    }

    for (const [provider, count] of data.entries()) {
      this.prometheusService.playerConnectProviderGauge.set({ provider }, count);
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      const payload: PlayerConnectEvent = {
        rooms: this.rooms,
      };
      const serialized = JSON.stringify(payload);

      for (const client of this.clients) {
        client.nextRaw({ data: serialized });
      }
    }, 200);
  }

  async getProviders() {
    const cacheKey = 'player-connect-providers';
    const cachedData = await this.cache.get<ApiResult<typeof api.v4.playerConnects.getProviders>>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const data = await this.prisma.playerConnect.findMany({
      where: {
        deleted: false,
      },
    });

    const providers = data.map((item) => ({
      ...item,
      address: item.address + ':' + item.port,
      httpAddress: item.address,
    }));

    await this.cache.set(cacheKey, providers, 1000 * 60);

    return providers;
  }

  getRooms(q?: string): PlayerConnectRoomWithLink[] {
    if (!q || q.length === 0) {
      return this.rooms;
    }

    return this.rooms.filter((room) => room.data.name.includes(q));
  }

  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: 'handleCron',
  })
  async handleCron() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    try {
      const playerConnects = await this.prisma.playerConnect.findMany();
      const mapped = playerConnects.map((item) => ({
        ...item,
        address: item.address + ':' + item.port,
        httpAddress: item.address,
      }));

      for (const playerConnect of mapped) {
        const { name, httpAddress, httpPort, port } = playerConnect;
        const provider = this.providers.get(httpAddress);

        if (!provider) {
          try {
            this.providers.set(
              httpAddress,
              new PlayerConnectProvider({
                address: httpAddress,
                httpPort,
                  onRoomConnect: async () => {
                    try {
                      await this.prisma.playerConnect.update({
                        where: {
                          id: playerConnect.id,
                        },
                        data: {
                          deleted: false,
                        },
                      });
                    } catch (error) {
                      this.logger.error(error);
                    }
                  },
                  onRoomUpdate: (data) => this.updateRoom(name, httpAddress, port, data),
                  onRoomRemove: (data) => this.removeRoom(data),
                  onClose: async () => {
                    try {
                      await this.prisma.playerConnect.update({
                        where: {
                          id: playerConnect.id,
                        },
                        data: {
                          deleted: true,
                        },
                      });
                    } catch (error) {
                      this.logger.error(error);
                    }

                    await this.clearRoomFromAddress(httpAddress).catch((error) => this.logger.error(error));
                  },
                  onExit: async () => {
                    this.providers.delete(httpAddress);
                    await this.clearRoomFromAddress(httpAddress).catch((error) => this.logger.error(error));
                  },
              }),
            );
          } catch (error) {
            this.logger.error(`Fetch error: ${error}`);
            await this.clearRoomFromAddress(httpAddress).catch((error) => this.logger.error(error));
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async updateRoom(name: string, address: string, port: number, raw: string) {
    const { data, success, error } = z.array(playerConnectRoomUpdateSchema).safeParse(JSON.parse(raw));

    if (!success) {
      this.logger.error(`Fail to update room, parse error: ${z.prettifyError(error)}
                data: ${raw}`);
      return;
    }

    for (const room of data) {
      const sanitizedRoom = await this.sanitizeRoomUpdate(room);
      const link = `player-connect://${address}:${port}/${room.roomId}`;
      const data: PlayerConnectRoomWithLink = {
        address,
        httpAddress: address,
        name,
        link,
        ...sanitizedRoom.room,
      };
      const index = this.rooms.findIndex((r) => r.roomId === room.roomId);

      if (sanitizedRoom.filteredFields.length > 0) {
        this.logger.warn(
          `Filtered player-connect room text for room ${room.roomId} from ${address}:${port}; fields=${sanitizedRoom.filteredFields.join(',')}`,
        );
      }

      if (index === -1) {
        this.rooms.push(data);
      } else {
        this.rooms[index] = data;
      }
    }

    await this.onRoomUpdate();
  }

  private async removeRoom(raw: string) {
    const { data, success, error } = playerConnectRoomRemoveSchema.safeParse(JSON.parse(raw));

    if (!success) {
      this.logger.error(`Fail to remove room, parse error: ${z.prettifyError(error)}
                data: ${raw}`);
      return;
    }

    this.rooms = this.rooms.filter((room) => room.roomId !== data.roomId);

    await this.onRoomUpdate();
  }

  private async clearRoomFromAddress(address: string) {
    this.rooms = this.rooms.filter((room) => room.address !== address);

    await this.onRoomUpdate();
  }

  private async sanitizeRoomUpdate(room: PlayerConnectRoomUpdate): Promise<SanitizedRoomResult> {
    const filteredFields: string[] = [];

    const [roomName, mapName, gamemode] = await Promise.all([
      this.profanityService.sanitizeText(room.data.name),
      this.profanityService.sanitizeText(room.data.mapName),
      this.profanityService.sanitizeText(room.data.gamemode),
    ]);

    const mods = await Promise.all(
      room.data.mods.map(async (mod, index) => {
        const result = await this.profanityService.sanitizeText(mod);

        if (result.filtered) {
          filteredFields.push(`data.mods[${index}]`);
        }

        return result.value;
      }),
    );

    const players = await Promise.all(
      room.data.players.map(async (player, index) => {
        const result = await this.profanityService.sanitizeText(player.name);

        if (result.filtered) {
          filteredFields.push(`data.players[${index}].name`);
        }

        return {
          ...player,
          name: result.value,
        };
      }),
    );

    if (roomName.filtered) {
      filteredFields.push('data.name');
    }

    if (mapName.filtered) {
      filteredFields.push('data.mapName');
    }

    if (gamemode.filtered) {
      filteredFields.push('data.gamemode');
    }

    // Keep this list aligned with room fields shown in frontend and Discord consumers.
    return {
      room: {
        ...room,
        data: {
          ...room.data,
          name: roomName.value,
          mapName: mapName.value,
          gamemode: gamemode.value,
          mods,
          players,
        },
      },
      filteredFields,
    };
  }
}
class PlayerConnectProvider {
  private readonly logger: Logger = new Logger(PlayerConnectProvider.name);

  private shouldReconnect = true;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 10 * 60 * 1000; // Max 10 minutes
  private currentDelay = this.reconnectDelay;
  private abort = new AbortController();
  private maxReconnectCount = 10;
  private reconnectCount = 0;
    
  constructor(
    private config: {
      readonly address: string;
      readonly httpPort: number;
      readonly onRoomConnect: () => Promise<void>;
      readonly onRoomUpdate: (data: string) => Promise<void>;
      readonly onRoomRemove: (data: string) => Promise<void>;
      readonly onClose: () => Promise<void>;
      readonly onExit: () => Promise<void>;
    },
  ) {
    this.connect().catch((error) => this.logger.error(error));
  }

  private async connect(): Promise<void> {
    const { address, httpPort, onRoomConnect, onRoomUpdate, onRoomRemove, onClose, onExit } = this.config;

    const connectAbortController = new AbortController();
    const connectTimer = setTimeout(() => {
      connectAbortController.abort();
    }, 10000);

    const handshakeSignal = AbortSignal.any([this.abort.signal, connectAbortController.signal]);

    try {
      const response = await fetch(`http://${address}:${httpPort}/rooms`, {
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        method: 'GET',
        signal: handshakeSignal,
      });

      clearTimeout(connectTimer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error(`Response body is null`);
      }

      this.logger.log('Connected to: ' + address + ':' + httpPort);
      await onRoomConnect();
      this.currentDelay = this.reconnectDelay;

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream())
        .getReader();

      try {
        while (this.shouldReconnect) {
          const { value, done }: { value?: EventSourceMessage; done: boolean } = await reader.read();

          if (done) {
            this.logger.log(`Connection closed: ${address}:${httpPort}`);
            break;
          }

          if (!value) {
            this.logger.log(`Undefined value for event: ${value}`);
            break;
          }

          if (value.event === 'comment') {
            continue;
          } else if (value.event === 'update') {
            await onRoomUpdate(value.data);
          } else if (value.event === 'remove') {
            await onRoomRemove(value.data);
          }
        }
      } finally {
        try {
          await reader.cancel();
        } catch {}
      }
    } catch (error) {
      clearTimeout(connectTimer);
      this.logger.debug(`Failed to fetch rooms data from server ${address}:${httpPort}, error: ${error}`);
    }

    this.abort.abort();
    this.abort = new AbortController();

    await onClose();

    this.reconnectCount++;

    if (this.reconnectCount >= this.maxReconnectCount) {
      await onExit();
      return;
    }

    if (this.shouldReconnect) {
      setTimeout(() => {
        if (this.shouldReconnect) {
          this.connect().catch((error) => this.logger.error(error));
        }
      }, this.currentDelay);

      this.currentDelay = Math.min(Math.round(this.currentDelay * 1.5) + 100, this.maxReconnectDelay);
    }
  }
}
