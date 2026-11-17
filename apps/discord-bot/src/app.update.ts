import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { ActionRowBuilder, ButtonBuilder, Client, Message } from 'discord.js';
import { createUploadButton, generateMapEmbed, generateSchematicEmbed } from 'src/utils/content.utils';
import { ApiService } from 'src/api/api.service';
import { api } from '@mindustry-tool/api';
import { PlayerConnectService } from 'src/services/player-connect/player-connect.service';
import { PendingUploadStore } from 'src/services/pending-upload-store/pending-upload-store.service';

interface TrackedMessage {
  replyIds: string[];
  timestamp: number;
}

interface UserMessageTrack {
  channelId: string;
  message: Message;
  timestamp: number;
}

interface HoneypotTrackEntry {
  channelId: string;
  messageId: string;
  timestamp: number;
}

@Injectable()
export class AppUpdate {
  private readonly logger = new Logger(AppUpdate.name);

  private readonly HONEYPOT_CHANNEL_IDS = new Set(['1556671043534327860', '1556996355660972052']);
  private readonly HONEYPOT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly HONEYPOT_MAX_ENTRIES = 50;

  // Map to track original message ID -> reply message IDs with timestamp
  private readonly messageReplyMap = new Map<string, TrackedMessage>();

  // Map to track user messages across channels for spam protection
  private readonly userMessageMap = new Map<string, UserMessageTrack[]>();

  // Map to track marked users (userId -> expiration timestamp)
  private readonly markedUsers = new Map<string, number>();

  // Honeypot buffer: per-user recent messages (channelId, messageId, timestamp)
  private readonly honeypotBuffer = new Map<string, HoneypotTrackEntry[]>();

  // Clean up old entries after 1 hour to prevent memory leak
  private readonly MESSAGE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_ENTRIES = 1000; // Maximum entries before forced cleanup

  public constructor(
    private readonly client: Client,
    private readonly apiService: ApiService,
    private readonly pendingUploadStore: PendingUploadStore,
    private readonly playerConnectService: PlayerConnectService,
  ) {
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanupOldEntries(), 5 * 60 * 1000);
  }

  private cleanupOldEntries() {
    const now = Date.now();
    let removedCount = 0;

    for (const [messageId, tracked] of this.messageReplyMap.entries()) {
      if (now - tracked.timestamp > this.MESSAGE_TTL) {
        this.messageReplyMap.delete(messageId);
        removedCount++;
      }
    }

    // If still too many entries, remove oldest ones
    if (this.messageReplyMap.size > this.MAX_ENTRIES) {
      const entries = Array.from(this.messageReplyMap.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, this.messageReplyMap.size - this.MAX_ENTRIES);
      for (const [messageId] of toRemove) {
        this.messageReplyMap.delete(messageId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.log(`Cleaned up ${removedCount} old entries. Current size: ${this.messageReplyMap.size}`);
    }

    // Clean up user message map
    for (const [userId, messages] of this.userMessageMap.entries()) {
      const recentMessages = messages.filter((m) => now - m.timestamp < 5000);
      if (recentMessages.length === 0) {
        this.userMessageMap.delete(userId);
      } else {
        this.userMessageMap.set(userId, recentMessages);
      }
    }

    // Clean up marked users map
    for (const [userId, expireAt] of this.markedUsers.entries()) {
      if (now > expireAt) {
        this.markedUsers.delete(userId);
      }
    }

    // Clean up honeypot buffer
    for (const [userId, entries] of this.honeypotBuffer.entries()) {
      const recentEntries = entries.filter((e) => now - e.timestamp < this.HONEYPOT_TTL);
      if (recentEntries.length === 0) {
        this.honeypotBuffer.delete(userId);
      } else {
        this.honeypotBuffer.set(userId, recentEntries);
      }
    }
  }

  private trackReply(originalMessageId: string, replyMessage: Message) {
    const existing = this.messageReplyMap.get(originalMessageId);
    if (existing) {
      existing.replyIds.push(replyMessage.id);
      // Don't update timestamp - keep original creation time
    } else {
      this.messageReplyMap.set(originalMessageId, {
        replyIds: [replyMessage.id],
        timestamp: Date.now(),
      });
    }
  }

  private trackHoneypotMessage(userId: string, channelId: string, messageId: string, timestamp: number) {
    let entries = this.honeypotBuffer.get(userId) || [];

    // Prune entries older than 5 minutes
    entries = entries.filter((entry) => timestamp - entry.timestamp < this.HONEYPOT_TTL);

    // Add new entry
    entries.push({ channelId, messageId, timestamp });

    // Cap at 50 entries per user (drop oldest)
    if (entries.length > this.HONEYPOT_MAX_ENTRIES) {
      entries = entries.slice(-this.HONEYPOT_MAX_ENTRIES);
    }

    this.honeypotBuffer.set(userId, entries);
  }

  private async handleHoneypotTrip(message: Message, userId: string) {
    try {
      // Delete the honeypot trigger message first
      try {
        if (message.deletable) {
          await message.delete();
          this.logger.warn(`Deleted honeypot trigger message ${message.id} from user ${userId}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to delete honeypot trigger message ${message.id}: ${error}`);
      }

      // Delete buffered messages newest-first
      const entries = this.honeypotBuffer.get(userId) || [];
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        try {
          const channel = await this.client.channels.fetch(entry.channelId).catch(() => null);
          if (channel && 'messages' in channel) {
            const msg = await channel.messages.fetch(entry.messageId).catch(() => null);
            if (msg && msg.deletable) {
              await msg.delete();
              this.logger.warn(
                `Deleted buffered message ${entry.messageId} in channel ${entry.channelId} from user ${userId}`,
              );
            } else if (msg) {
              this.logger.warn(`Buffered message ${entry.messageId} in channel ${entry.channelId} not deletable`);
            } else {
              this.logger.warn(
                `Buffered message ${entry.messageId} in channel ${entry.channelId} not found (already deleted?)`,
              );
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to delete buffered message ${entry.messageId}: ${error}`);
        }
      }

      // Clear the user's honeypot buffer
      this.honeypotBuffer.delete(userId);

      // Attempt DM invite then kick
      await this.dmInviteAndKick(message, userId);
    } catch (error) {
      this.logger.error(`Error in honeypot trip handler for user ${userId}:`, error);
    }
  }

  private async dmInviteAndKick(triggerMessage: Message, userId: string) {
    const guild = triggerMessage.guild;
    if (!guild) {
      this.logger.warn(`Honeypot trip in DM channel, cannot kick user ${userId}`);
      return;
    }

    let inviteUrl: string | null = null;

    // Try to create single-use invite from trigger channel (or honeypot channel as fallback)
    const inviteChannel = triggerMessage.channel;
    if ('createInvite' in inviteChannel) {
      try {
        const invite = await inviteChannel.createInvite({
          maxUses: 1,
          maxAge: 86400, // 24 hours
        });
        inviteUrl = invite.url;
      } catch (error) {
        this.logger.warn(`Failed to create invite for honeypot trip user ${userId}: ${error}`);
      }
    }

    // Attempt DM
    try {
      const user = await this.client.users.fetch(userId);
      if (inviteUrl) {
        await user.send(`You have been removed from the server. You can rejoin using this invite: ${inviteUrl}`);
      } else {
        await user.send(
          'You have been removed from the server (honeypot tripped). Please use a public invite to rejoin.',
        );
      }
      this.logger.log(`DM sent to honeypot tripped user ${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to DM honeypot tripped user ${userId} (DMs closed?): ${error}`);
    }

    // Kick regardless of DM/invite success
    try {
      await guild.members.kick(userId, 'honeypot tripped');
      this.logger.warn(`Kicked user ${userId} for honeypot trip`);
    } catch (error) {
      this.logger.error(`Failed to kick honeypot tripped user ${userId}: ${error}`);
    }

    try {
      if (inviteChannel.isSendable()) {
        await inviteChannel.send(`Kicked ${userId}`);
      }
    } catch (error) {
      this.logger.warn(error);
    }
  }

  @Once('clientReady')
  public onReady(@Context() [client]: ContextOf<'clientReady'>) {
    this.logger.log(client.user);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }

  @On('messageDelete')
  public async onMessageDelete(@Context() [message]: ContextOf<'messageDelete'>) {
    try {
      const tracked = this.messageReplyMap.get(message.id);

      if (!tracked || tracked.replyIds.length === 0) {
        return;
      }

      this.logger.log(`Deleting ${tracked.replyIds.length} preview(s) for deleted message ${message.id}`);

      for (const replyId of tracked.replyIds) {
        try {
          const channel = message.channel;
          const replyMessage = await channel.messages.fetch(replyId).catch(() => null);

          if (replyMessage && replyMessage.deletable) {
            await replyMessage.delete();
            this.logger.log(`Deleted preview message ${replyId}`);
          }
        } catch (error) {
          this.logger.warn(`Failed to delete reply ${replyId}: ${error}`);
        }
      }

      // Clean up the mapping
      this.messageReplyMap.delete(message.id);
    } catch (error) {
      this.logger.error('Error in messageDelete handler:', error);
    }
  }

  @On('messageCreate')
  public async onMessageCreate(@Context() [message]: ContextOf<'messageCreate'>) {
    try {
      if (message.author.bot) {
        return;
      }

      const userId = message.author.id;
      const now = Date.now();

      // Track message for honeypot buffer (all non-bot messages)
      this.trackHoneypotMessage(userId, message.channel.id, message.id, now);

      // Check honeypot trip first - before any other logic
      if (this.HONEYPOT_CHANNEL_IDS.has(message.channel.id)) {
        await this.handleHoneypotTrip(message, userId);
        return;
      }
      const markedExpireAt = this.markedUsers.get(userId);
      if (markedExpireAt) {
        if (now < markedExpireAt) {
          if (message.deletable) {
            await message.delete().catch(() => null);
          }
          await message.channel.send('abnormal behavior').catch(() => null);
          return;
        } else {
          this.markedUsers.delete(userId);
        }
      }

      let userMessages = this.userMessageMap.get(userId) || [];

      // Filter out messages older than 1 second
      userMessages = userMessages.filter((m) => now - m.timestamp < 2000);

      // Add current message
      userMessages.push({
        channelId: message.channel.id,
        message: message,
        timestamp: now,
      });

      this.userMessageMap.set(userId, userMessages);

      // Check if there are messages in 3 different channels
      const uniqueChannels = new Set(userMessages.map((m) => m.channelId));
      if (uniqueChannels.size >= 4) {
        this.logger.warn(
          `User ${message.author.displayName} sent messages in ${uniqueChannels.size} different channels within 1s. Marking user and deleting messages.`,
        );

        // Mark user for 1 minute
        this.markedUsers.set(userId, now + 60 * 1000);

        for (const msg of userMessages) {
          try {
            if (msg.message.deletable) {
              msg.message
                .delete()
                .catch((error) => this.logger.warn(`Failed to delete spam message ${msg.message.id}: ${error}`));
            }
          } catch (error) {
            this.logger.warn(`Failed to delete spam message ${msg.message.id}: ${error}`);
          }
        }
        return;
      }

      const channelName = 'name' in message.channel ? message.channel.name : 'DM';
      const guildName = message.guild?.name || 'Direct Message';

      this.logger.log(`[${guildName}] ${channelName} ${message.author.displayName}: ${message.content}`);

      if (message.content.includes('bXNjaA')) {
        const reply = await message.reply({
          content: 'Generating schematic...',
        });

        // Track the reply
        this.trackReply(message.id, reply);

        const startIndex = message.content.indexOf('bXNjaA');
        const endIndex = message.content.indexOf(' ', startIndex + 1);
        const data = message.content.substring(startIndex, endIndex >= 0 ? endIndex : message.content.length);

        try {
          const result = await generateSchematicEmbed({ type: 'base64', data }, message.author, this.apiService);

          const components: ActionRowBuilder<ButtonBuilder>[] = [];
          if (result.uploadData) {
            const uploadId = this.pendingUploadStore.store(result.uploadData);
            components.push(createUploadButton(uploadId));
          }

          await reply.edit({
            content: '',
            embeds: [result.embed],
            files: result.attachments,
            components,
          });
        } catch (error) {
          await reply.edit('Error: ' + String(error));
          return;
        }
      }

      const schematics = message.attachments.filter((att) => att.name.endsWith('.msch'));
      const maps = message.attachments.filter((att) => att.name.endsWith('.msav'));

      if (schematics.size > 0) {
        for (const schematic of schematics.values()) {
          const reply = await message.reply({
            content: 'Generating schematic: ' + schematic.name,
          });

          // Track the reply
          this.trackReply(message.id, reply);

          const res = await fetch(schematic.url, { signal: AbortSignal.timeout(15000) });

          if (!res.ok) {
            await reply.edit('Error: ' + (await res.text()));
            continue;
          }

          const buffer = Buffer.from(await res.arrayBuffer());

          try {
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

            await reply.edit({
              content: '',
              embeds: [result.embed],
              files: result.attachments,
              components,
            });
          } catch (error) {
            await reply.edit('Error: ' + String(error));
            continue;
          }
        }
      }

      if (maps.size > 0) {
        for (const map of maps.values()) {
          const reply = await message.reply({
            content: 'Generating map: ' + map.name,
          });

          this.trackReply(message.id, reply);

          const res = await fetch(map.url, { signal: AbortSignal.timeout(15000) });

          if (!res.ok) {
            await reply.edit('Error: ' + (await res.text()));
            continue;
          }

          const buffer = Buffer.from(await res.arrayBuffer());

          try {
            const result = await generateMapEmbed(buffer, message.author, this.apiService);

            const components: ActionRowBuilder<ButtonBuilder>[] = [];
            if (result.uploadData) {
              const uploadId = this.pendingUploadStore.store(result.uploadData);
              components.push(createUploadButton(uploadId));
            }

            await reply.edit({
              content: '',
              embeds: [result.embed],
              files: result.attachments,
              components,
            });
          } catch (error) {
            await reply.edit('Error: ' + String(error));
            continue;
          }
        }
      }

      if (message.content.startsWith('player-connect://')) {
        const allRooms = await this.apiService.apiV4Instance.request(api.v4.playerConnects.getRooms, {
          query: {},
        });

        const match = allRooms.find((room) => room.link === message.content);
        if (match) {
          await message.channel.send({ embeds: [this.playerConnectService.createRoomEmbed(match)] });
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
