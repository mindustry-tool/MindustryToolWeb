import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PluginModule } from '@/services/plugin/plugin.module';
import { UserModule } from '@/services/user/user.module';
import { ServerManagerService } from './services/server-manager.service';
import { ServerAuthorityService } from './services/server-authority.service';
import { ServerLogService } from './services/server-log.service';
import { ServerWebhookService } from './services/server-webhook.service';
import { ServerFileService } from './services/server-file.service';
import { ServerPlayerService } from './services/server-player.service';
import { ServerRuntimeService } from './services/server-runtime.service';
import { ManagerGateway } from './manager-gateway/manager-gateway';
import { ManagerAuthenticator } from './manager-gateway/manager-authenticator';
import { ConnectionRegistry } from './manager-gateway/connection-registry';
import { DiscordManagerStatusNotifier, MANAGER_STATUS_NOTIFIER } from './manager-gateway/manager-status-notifier';
import { ManagerRpcClient } from './manager-gateway/server-manager-rpc.service';

@Module({
  controllers: [ServerController],
  providers: [
    ManagerAuthenticator,
    DiscordManagerStatusNotifier,
    {
      provide: MANAGER_STATUS_NOTIFIER,
      useExisting: DiscordManagerStatusNotifier,
    },
    {
      provide: ConnectionRegistry,
      useFactory: (notifier: DiscordManagerStatusNotifier) => new ConnectionRegistry(notifier),
      inject: [DiscordManagerStatusNotifier],
    },
    ManagerGateway,
    ManagerRpcClient,
    ServerManagerService,
    ServerAuthorityService,
    ServerLogService,
    ServerWebhookService,
    ServerFileService,
    ServerPlayerService,
    ServerRuntimeService,
    ServerService,
  ],
  imports: [PluginModule, UserModule],
  exports: [
    ManagerGateway,
    ManagerRpcClient,
    ServerService,
    ServerManagerService,
    ServerAuthorityService,
    ServerLogService,
    ServerWebhookService,
    ServerFileService,
    ServerPlayerService,
    ServerRuntimeService,
  ],
})
export class ServerModule {}
