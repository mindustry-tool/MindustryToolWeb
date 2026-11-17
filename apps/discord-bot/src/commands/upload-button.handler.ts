import { Injectable, Logger } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Button, ComponentParam, Context } from 'necord';
import { PendingUploadStore } from 'src/services/pending-upload-store/pending-upload-store.service';
import { ApiService } from 'src/api/api.service';
import { api } from '@mindustry-tool/api';

@Injectable()
export class UploadButtonHandler {
  private readonly logger = new Logger(UploadButtonHandler.name);

  constructor(
    private readonly pendingUploadStore: PendingUploadStore,
    private readonly apiService: ApiService,
  ) {}

  @Button('upload/:id')
  public async onUploadButton(
    @Context() [interaction]: [ButtonInteraction],
    @ComponentParam('id') paramUploadId?: string,
  ) {
    try {
      // Support both / and : customId formats
      const uploadId = paramUploadId || interaction.customId.replace(/^upload[/:]/, '');

      if (!uploadId) {
        await interaction.reply({
          content: '❌ Invalid upload interaction.',
          ephemeral: true,
        });
        return;
      }

      // Check if the pending upload exists (may have expired)
      const pending = this.pendingUploadStore.get(uploadId);

      if (!pending) {
        await interaction.reply({
          content: '⏰ This upload has expired. Please re-post your content to generate a new upload button.',
          ephemeral: true,
        });
        return;
      }

      // Check if the clicker is the original poster
      if (interaction.user.id !== pending.discordUserId) {
        await interaction.reply({
          content: '❌ Only the original poster can upload this content.',
          ephemeral: true,
        });
        return;
      }

      // Check if already uploaded
      if (pending.uploaded) {
        await interaction.reply({
          content: '✅ This content has already been uploaded.',
          ephemeral: true,
        });
        return;
      }

      // Immediately acknowledge the interaction to prevent timeout
      await interaction.deferUpdate();

      const [, error] = await this.apiService.apiV4Instance.tryRequest(api.v4.discordUploads.upload, {
        body: {
          userId: pending.userId,
          file: pending.base64,
          fileType: pending.fileType,
        },
        timeout: 180_000,
      });

      if (error) {
        throw error;
      }

      // Mark as uploaded in the store
      this.pendingUploadStore.markUploaded(uploadId);

      // Disable the button
      const disabledButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`upload/${uploadId}`)
          .setLabel('Uploaded ✓')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      );

      // Update the embed description to reflect the upload
      const originalEmbed = interaction.message.embeds[0];
      if (originalEmbed) {
        const updatedEmbed = EmbedBuilder.from(originalEmbed);
        const description = originalEmbed.description || '';

        // Replace "Logged as **name**" with "Uploaded by **name**"
        const updatedDescription = description.replace(
          /-# Logged as \*\*(.+?)\*\*/,
          '-# Uploaded by **$1**',
        );

        updatedEmbed.setDescription(updatedDescription);

        await interaction.editReply({
          embeds: [updatedEmbed],
          components: [disabledButton],
        });
      } else {
        await interaction.editReply({
          components: [disabledButton],
        });
      }

      this.logger.log(`Upload completed for ${pending.fileType} by user ${pending.userId}`);
    } catch (error) {
      this.logger.error('Error handling upload button interaction:', error);

      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: '❌ Error uploading content: ' + String(error),
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ Error uploading content: ' + String(error),
            ephemeral: true,
          });
        }
      } catch (replyError) {
        this.logger.error('Failed to send error response to interaction:', replyError);
      }
    }
  }
}
