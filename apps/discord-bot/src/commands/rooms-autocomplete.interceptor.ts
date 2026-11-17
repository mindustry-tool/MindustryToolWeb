import { api } from '@mindustry-tool/api';
import { stripColors } from '@mindustry-tool/api';
import { Injectable, Logger } from '@nestjs/common';
import { AutocompleteInteraction } from 'discord.js';
import { AutocompleteInterceptor } from 'necord';
import { ApiService } from 'src/api/api.service';

const MAX_CHOICES = 25;
const MAX_NAME_LENGTH = 100;
const CACHE_TTL = 30 * 1000; // 30 seconds

interface Room {
    name: string;
    data: {
        name: string;
        players: unknown[];
    };
}

interface CachedRooms {
    data: Room[];
    timestamp: number;
}

@Injectable()
export class RoomsAutocompleteInterceptor extends AutocompleteInterceptor {
    private readonly logger = new Logger(RoomsAutocompleteInterceptor.name);
    private roomsCache: CachedRooms | null = null;

    constructor(private readonly apiService: ApiService) {
        super();
    }

    private async getRooms() {
        const now = Date.now();

        if (this.roomsCache && now - this.roomsCache.timestamp < CACHE_TTL) {
            return this.roomsCache.data;
        }

        const rooms = await this.apiService.apiV4Instance.request(api.v4.playerConnects.getRooms, {
            query: {},
        });

        this.roomsCache = { data: rooms, timestamp: now };
        return rooms;
    }

    public async transformOptions(interaction: AutocompleteInteraction) {
        const focused = interaction.options.getFocused(true);

        if (focused.name !== 'name') {
            return interaction.respond([]);
        }

        try {
            const rooms = await this.getRooms();

            const searchValue = focused.value.toString().toLowerCase();

            const choices = rooms
                .map((room) => ({
                    roomName: stripColors(room.data.name),
                    serverName: stripColors(room.name),
                    players: room.data.players.length,
                }))
                .filter(
                    (room) =>
                        room.roomName.toLowerCase().includes(searchValue) ||
                        room.serverName.toLowerCase().includes(searchValue),
                )
                .slice(0, MAX_CHOICES)
                .map((room) => ({
                    name: `${room.roomName} (${room.players} players) - ${room.serverName}`.slice(0, MAX_NAME_LENGTH),
                    value: room.roomName,
                }));

            return interaction.respond(choices);
        } catch (error) {
            this.logger.error('Error fetching rooms for autocomplete:', error);
            return interaction.respond([]);
        }
    }
}
