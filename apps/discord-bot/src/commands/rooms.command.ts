import { api } from '@mindustry-tool/api';
import { stripColors } from '@mindustry-tool/api';
import { type PlayerConnectRoomWithLink } from '@mindustry-tool/api';
import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { ApplicationIntegrationType, CacheType, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { Context, Options, SlashCommand, SlashCommandContext, StringOption } from 'necord';
import { ApiService } from 'src/api/api.service';
import { RoomsAutocompleteInterceptor } from './rooms-autocomplete.interceptor';
import { PlayerConnectService } from 'src/services/player-connect/player-connect.service';


class RoomsOption {
    @StringOption({
        name: 'name',
        description: 'Filter by room name (optional)',
        required: false,
        autocomplete: true,
    })
    name?: string;
}

@Injectable()
export class RoomsCommand {
    private readonly logger = new Logger(RoomsCommand.name);

    constructor(private readonly apiService: ApiService, private readonly playerConnectService: PlayerConnectService) { }

    @UseInterceptors(RoomsAutocompleteInterceptor)
    @SlashCommand({
        name: 'rooms',
        description: 'View active Mindustry game rooms in real-time',
        integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
        contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
    })
    public async onRooms(@Context() [interaction]: SlashCommandContext, @Options() { name }: RoomsOption) {
        try {
            await interaction.deferReply();

            const allRooms = await this.apiService.apiV4Instance.request(api.v4.playerConnects.getRooms, {
                query: {},
            });

            const rooms = name ? this.filterRooms(allRooms, name) : allRooms;

            if (rooms.length === 0) {
                const message = name
                    ? `❌ No rooms found matching "${name}". The room may have closed.`
                    : '❌ No active rooms at the moment. Check back later!';
                await interaction.editReply({ content: message });
                return;
            }

            if (name) {
                const embeds = rooms.slice(0, 5).map((room) => this.playerConnectService.createRoomEmbed(room));
                
                await interaction.editReply({
                    content: `🎮 Found **${rooms.length}** room(s) matching "${name}"`,
                    embeds,
                });
            } else {
                await interaction.editReply({ embeds: [this.playerConnectService.createRoomsOverviewEmbed(rooms)] });
            }
        } catch (error) {
            this.logger.error('Error in rooms command:', error);
            await this.handleError(interaction);
        }
    }

    private filterRooms(rooms: PlayerConnectRoomWithLink[], query: string): PlayerConnectRoomWithLink[] {
        const lowerQuery = query.toLowerCase();
        return rooms.filter(
            (room) =>
                stripColors(room.data.name).toLowerCase().includes(lowerQuery) ||
                stripColors(room.name).toLowerCase().includes(lowerQuery),
        );
    }


    private async handleError(interaction: ChatInputCommandInteraction<CacheType>) {
        const errorMessage = '❌ Error fetching rooms: ';

        if (interaction.deferred) {
            await interaction.editReply(errorMessage);
        } else if (!interaction.replied) {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
}
