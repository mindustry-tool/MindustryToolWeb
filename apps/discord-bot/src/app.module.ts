import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig, { AppConfig } from './config';

import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { IntentsBitField, Partials } from 'discord.js';
import { AppUpdate } from 'src/app.update';
import { CommandModule } from 'src/commands/command.module';
import { EventsHandler } from 'src/events.handler';
import { ApiModule } from 'src/api/api.module';
import { PlayerConnectModule } from './services/player-connect/player-connect.module';
import { PendingUploadStoreModule } from './services/pending-upload-store/pending-upload-store.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
      load: [appConfig],
    }),
    NecordModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        token: configService.getOrThrow('discordToken'),
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.MessageContent,
          IntentsBitField.Flags.DirectMessages,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildMembers,
        ],
        partials: [Partials.Channel, Partials.Message],
      }),
    }),
    CommandModule,
    ApiModule,
    PlayerConnectModule,
    PendingUploadStoreModule,
  ],
  providers: [AppUpdate, EventsHandler],
})
export class AppModule { }
