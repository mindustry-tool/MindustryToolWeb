import { Injectable, Logger } from '@nestjs/common';
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, InteractionContextType, Message } from 'discord.js';
import { Context, MessageCommand, MessageCommandContext, TargetMessage } from 'necord';
import { ApiService } from 'src/api/api.service';
import { PendingUploadStore } from 'src/services/pending-upload-store/pending-upload-store.service';
import { createUploadButton, generateMapEmbed, generateSchematicEmbed } from 'src/utils/content.utils';

@Injectable()
export class ContextMenuCommand {
    private readonly logger = new Logger(ContextMenuCommand.name);

    constructor(
        private readonly apiService: ApiService,
        private readonly pendingUploadStore: PendingUploadStore,
    ) { }

    @MessageCommand({
        name: 'Preview',
        integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
        contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
    })
    public async preview(
        @Context() [interaction]: MessageCommandContext,
        @TargetMessage() message: Message,
    ) {
        try {
            // Check if bot already replied with a preview to this message
            const channel = message.channel;
            if ('messages' in channel) {
                const recentMessages = await channel.messages.fetch({ limit: 10, after: message.id }).catch(() => null);
                if (recentMessages) {
                    const botReply = recentMessages.find(
                        (msg) =>
                            msg.author.id === interaction.client.user?.id &&
                            msg.reference?.messageId === message.id &&
                            msg.embeds.length > 0 &&
                            msg.embeds[0].image?.url?.includes('preview.png'),
                    );
                    if (botReply) {
                        await interaction.reply({
                            content: '✅ This message already has a preview! Check above.',
                            ephemeral: true,
                        });
                        return;
                    }
                }
            }

            // Check for base64 schematic in message content
            const base64Match = message.content.match(/bXNja[A-Za-z0-9+/=]+/);

            // Check for file attachments
            const schematicFile = message.attachments.find((att) => att.name.endsWith('.msch'));
            const mapFile = message.attachments.find((att) => att.name.endsWith('.msav'));
            const txtFile = message.attachments.find((att) => att.name.endsWith('.txt'));

            // Check if any previewable content exists
            if (!base64Match && !schematicFile && !mapFile && !txtFile) {
                await interaction.reply({
                    content: '❌ No previewable content found in this message.\n\nLooking for:\n• Text starting with `bXNjaA` (schematic base64)\n• File with `.msch` extension (schematic)\n• File with `.msav` extension (map)\n• File with `.txt` extension (base64)',
                    ephemeral: true,
                });
                return;
            }

            await interaction.deferReply();

            // Priority: Map file > Schematic file > TXT file > Base64 text
            if (mapFile) {
                // Handle .msav map file
                const res = await fetch(mapFile.url, { signal: AbortSignal.timeout(15000) });
                if (!res.ok) {
                    await interaction.editReply('❌ Error fetching file: ' + (await res.text()));
                    return;
                }

                const buffer = Buffer.from(await res.arrayBuffer());
                const result = await generateMapEmbed(
                    buffer,
                    message.author,
                    this.apiService,
                );

                const components: ActionRowBuilder<ButtonBuilder>[] = [];
                if (result.uploadData) {
                    const uploadId = this.pendingUploadStore.store(result.uploadData);
                    components.push(createUploadButton(uploadId));
                }

                await interaction.editReply({
                    embeds: [result.embed],
                    files: result.attachments,
                    components,
                });
                return;
            }

            if (schematicFile) {
                // Handle .msch schematic file
                const res = await fetch(schematicFile.url, { signal: AbortSignal.timeout(15000) });
                if (!res.ok) {
                    await interaction.editReply('❌ Error fetching file: ' + (await res.text()));
                    return;
                }

                const buffer = Buffer.from(await res.arrayBuffer());
                const result = await generateSchematicEmbed(
                    { type: 'file', file: buffer },
                    message.author,
                    this.apiService,
                );

                const components: ActionRowBuilder<ButtonBuilder>[] = [];
                if (result.uploadData) {
                    const uploadId = this.pendingUploadStore.store(result.uploadData);
                    components.push(createUploadButton(uploadId));
                }

                await interaction.editReply({
                    embeds: [result.embed],
                    files: result.attachments,
                    components,
                });
                return;
            }

            if (txtFile) {
                // Handle .txt file containing base64
                const res = await fetch(txtFile.url, { signal: AbortSignal.timeout(15000) });
                if (!res.ok) {
                    await interaction.editReply('❌ Error fetching file: ' + (await res.text()));
                    return;
                }

                const buffer = Buffer.from(await res.arrayBuffer());
                const result = await generateSchematicEmbed(
                    { type: 'base64', data: buffer.toString() },
                    message.author,
                    this.apiService,
                );

                const components: ActionRowBuilder<ButtonBuilder>[] = [];
                if (result.uploadData) {
                    const uploadId = this.pendingUploadStore.store(result.uploadData);
                    components.push(createUploadButton(uploadId));
                }

                await interaction.editReply({
                    embeds: [result.embed],
                    files: result.attachments,
                    components,
                });
                return;
            }

            if (base64Match) {
                // Handle base64 schematic from message content
                const result = await generateSchematicEmbed(
                    { type: 'base64', data: base64Match[0] },
                    message.author,
                    this.apiService,
                );

                const components: ActionRowBuilder<ButtonBuilder>[] = [];
                if (result.uploadData) {
                    const uploadId = this.pendingUploadStore.store(result.uploadData);
                    components.push(createUploadButton(uploadId));
                }

                await interaction.editReply({
                    embeds: [result.embed],
                    files: result.attachments,
                    components,
                });
                return;
            }
        } catch (error) {
            this.logger.error('Error in preview command:', error);

            if (interaction.deferred) {
                await interaction.editReply('❌ Error: ' + String(error));
            } else if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Error: ' + String(error),
                    ephemeral: true,
                });
            }
        }
    }
}
