import { Injectable } from '@nestjs/common';
import { EmbedBuilder, time, TimestampStyles } from 'discord.js';
import { stripColors } from '@mindustry-tool/api';
import { type PlayerConnectRoomWithLink } from '@mindustry-tool/api';

@Injectable()
export class PlayerConnectService {
    private readonly IMAGE_URL =
        'https://image.mindustry-tool.com/media/019a9155-8e14-74b7-9609-ae9e7622e5f4.png';

    private readonly COLOR = '#ffd700';

    formatRoom(room: PlayerConnectRoomWithLink): string {
        const { data, name: serverName, link } = room;

        const mods =
            data.mods && data.mods.length > 0
                ? stripColors(data.mods.join(', '))
                : 'None';

        return [
            `## Room: ${stripColors(data.name)}`,
            `- **Players**: ${data.players.length}`,
            ...data.players.map((p) => `  - ${stripColors(p.name)}`),
            `- **Map**: ${stripColors(data.mapName)}`,
            `- **Server**: ${stripColors(serverName)}`,
            `- **Mods**: ${mods}`,
            `- **Version**: ${data.version ?? 'Unknown'}`,
            `- **Password**: ${data.isSecured ? 'Yes' : 'No'}`,
            `- **Language**: ${data.locale ?? 'Unknown'}`,
            `- **Created**: ${time(new Date(data.createdAt), TimestampStyles.RelativeTime)}`,
            link ? `- **Link**: \`${link}\`` : undefined,
        ]
            .filter(Boolean)
            .join('\n');
    }

    createRoomEmbed(room: PlayerConnectRoomWithLink): EmbedBuilder {
        return new EmbedBuilder()
            .setDescription(this.formatRoom(room))
            .setColor(this.COLOR)
            .setImage(this.IMAGE_URL)
            .setFooter({ text: `Ping: ${room.data.ping}ms` })
            .setTimestamp();
    }


    createRoomsOverviewEmbed(rooms: PlayerConnectRoomWithLink[]): EmbedBuilder {
        const description = rooms.map((room) => this.formatRoom(room)).join('\n\n');
        const totalPlayers = rooms.reduce((sum, r) => sum + r.data.players.length, 0);

        return new EmbedBuilder()
            .setDescription(description || 'No active rooms at the moment.')
            .setColor(this.COLOR)
            .setImage(this.IMAGE_URL)
            .setFooter({
                text: `${rooms.length} rooms • ${totalPlayers} players online`,
            })
            .setTimestamp();
    }

    createRoomEmbeds(
        rooms: PlayerConnectRoomWithLink[],
        limit = 5,
    ): EmbedBuilder[] {
        return rooms.slice(0, limit).map((room) => this.createRoomEmbed(room));
    }

    formatRoomsPlainText(rooms: PlayerConnectRoomWithLink[]): string {
        return (
            rooms
                .map((room) => this.formatRoom(room))
                .join('\n\n') + '.'
        );
    }
}
