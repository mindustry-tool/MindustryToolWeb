import { api } from '@mindustry-tool/api';
import { ApiError } from '@mindustry-tool/api';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType } from 'discord.js';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { ApiService } from 'src/api/api.service';
import { InfoOption } from 'src/dto/info-option.dto';

@Injectable()
export class InfoCommand {
  private logger: Logger = new Logger(InfoCommand.name);

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
  ) { }

  @SlashCommand({
    name: 'info',
    description: 'Get user info',
    integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
  })
  public async onInfo(@Context() [interaction]: SlashCommandContext, @Options() { user }: InfoOption) {
    try {
      const [res, error] = await this.apiService.apiV4Instance.tryRequest(api.v4.users.getByDiscordId, {
        params: {
          id: user.id,
        },
      });

      if (res) {
        const { id, name, imageUrl, roles } = res;
        const bestRole = roles?.sort((a, b) => b.level - a.level)[0];

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: name,
                iconURL: imageUrl || undefined,
                url: this.configService.get('url.frontend') + '/users/' + id,
              })
              .addFields(
                bestRole
                  ? [
                    {
                      name: 'Role',
                      value: bestRole.id,
                    },
                  ]
                  : [],
              )
              .setDescription('Stats: ' + Object.entries((res.stats as Record<string, any>) || {}).join('\n')),
          ],
        });
      }

      if (error instanceof ApiError && error.response.status === 404) {
        await interaction.reply({
          content: 'User not found',
        });
        return;
      }

      await interaction.reply({
        content: 'Error: ' + String(error),
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
