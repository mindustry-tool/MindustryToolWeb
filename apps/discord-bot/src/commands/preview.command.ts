import { Injectable } from '@nestjs/common';
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, InteractionContextType } from 'discord.js';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { ApiService } from 'src/api/api.service';
import { PreviewOption } from 'src/dto/preview-option.dto';
import { PendingUploadStore } from 'src/services/pending-upload-store/pending-upload-store.service';
import { createUploadButton, generateMapEmbed, generateSchematicEmbed } from 'src/utils/content.utils';

@Injectable()
export class PreviewCommand {
  constructor(private readonly apiService: ApiService, private readonly pendingUploadStore: PendingUploadStore) { }

  @SlashCommand({
    name: 'preview',
    description: 'Generate preview',
    integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
  })
  public async onPreview(@Context() [interaction]: SlashCommandContext, @Options() { file }: PreviewOption) {
    try {
      if (!['.msch', '.msav', '.txt'].some((ex) => file.name.endsWith(ex))) {
        await interaction.reply('Error: Invalid file type ' + file.name);
        return;
      }

      await interaction.deferReply();

      const res = await fetch(file.url, { signal: AbortSignal.timeout(15000) });

      if (!res.ok) {
        await interaction.editReply('Error: ' + (await res.text()));
        return;
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      if (file.name.endsWith('.msch')) {
        try {
          const result = await generateSchematicEmbed(
            { type: 'file', file: buffer },
            interaction.user,
            this.apiService,
          );

          const components: ActionRowBuilder<ButtonBuilder>[] = [];
          if (result.uploadData) {
            const uploadId = this.pendingUploadStore.store(result.uploadData);
            components.push(createUploadButton(uploadId));
          }

          return await interaction.editReply({
            embeds: [result.embed],
            files: result.attachments,
            components,
          });
        } catch (error) {
          await interaction.editReply('Error: ' + String(error));
          return;
        }
      } else if (file.name.endsWith('.msav')) {
        try {
          const result = await generateMapEmbed(buffer, interaction.user, this.apiService);

          const components: ActionRowBuilder<ButtonBuilder>[] = [];
          if (result.uploadData) {
            const uploadId = this.pendingUploadStore.store(result.uploadData);
            components.push(createUploadButton(uploadId));
          }

          return await interaction.editReply({
            embeds: [result.embed],
            files: result.attachments,
            components,
          });
        } catch (error) {
          await interaction.editReply('Error: ' + String(error));
          return;
        }
      } else if (file.name.endsWith('.txt')) {
        try {
          const result = await generateSchematicEmbed(
            { type: 'base64', data: buffer.toString() },
            interaction.user,
            this.apiService,
          );

          const components: ActionRowBuilder<ButtonBuilder>[] = [];
          if (result.uploadData) {
            const uploadId = this.pendingUploadStore.store(result.uploadData);
            components.push(createUploadButton(uploadId));
          }

          return await interaction.editReply({
            embeds: [result.embed],
            files: result.attachments,
            components,
          });
        } catch (error) {
          await interaction.editReply('Error: ' + String(error));
          return;
        }
      }
    } catch (error) {
      console.error(error);
      if (interaction.deferred) {
        await interaction.editReply('Error: ' + String(error));
      } else if (interaction.replied) {
        await interaction.followUp('Error: ' + String(error));
      } else {
        await interaction.reply('Error: ' + String(error));
      }
    }
  }
}
