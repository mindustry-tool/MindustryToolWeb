import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './services/tag/tag.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './services/common/common.module';
import { PlayerConnectModule } from './services/player-connect/player-connect.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from './services/prometheus/prometheus.module';
import { SchematicsModule } from './services/schematic/schematics.module';
import { MapModule } from './services/map/map.module';
// import { PostModule } from './services/post/post.module';
import { MulterModule } from '@nestjs/platform-express';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { AuthModule } from './services/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config';
import { RedisModule } from './services/redis/redis.module';
import { AuthMiddleware } from '@/services/auth/auth.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { UserModule } from './services/user/user.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { PostModule } from './services/post/post.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { MediaModule } from './services/media/media.module';
import { RoleModule } from './services/role/role.module';
import { LoggerMiddleware } from '@/middlewares/logger.middleware';
import { WikiModule } from './services/wiki/wiki.module';
import { IconModule } from './services/icon/icon.module';
import { LikeModule } from './services/like/like.module';
import { CommentModule } from './services/comment/comment.module';
import { PlanetModule } from './services/planet/planet.module';
import { ItemModule } from './services/item/item.module';
import { VerifyModule } from './services/verify/verify.module';
import { ContentParserModule } from './services/content-parser/content-parser.module';
import { GitHubUploadModule } from '@/services/github-upload/github-upload.module';
import { ImageModule } from './services/image/image.module';
import { RouteInterceptor } from '@/interceptors/route.interceptor';
import { ActionModule } from './services/action/action.module';
import { RoleService } from '@/services/role/role.service';
import { OctokitModule } from './services/octokit/octokit.module';
import { ModModule } from './services/mod/mod.module';
import { ServerModule } from './services/server/server.module';
import { ServerGroupModule } from './services/server-group/server-group.module';
import { PluginModule } from './services/plugin/plugin.module';
import { JwtModule } from '@nestjs/jwt';
import { ContentPatchesModule } from './services/content-patches/content-patches.module';
import { ShareModule } from './services/share/share.module';
import { StatsModule } from './services/stats/stats.module';
import { MemoryCacheModule } from '@/services/memory-cache/memory-cache.module';
import { FriendshipModule } from './services/friendship/friendship.module';
import { LogicModule } from './services/logic/logic.module';
import { ChatModule } from './services/chat/chat.module';
import { CrashModule } from './services/crash/crash.module';
import { StorageModule } from './services/storage/storage.module';
import { ImageProxyModule } from './services/image-proxy/image-proxy.module';
import { NotificationModule } from './services/notification/notification.module';
import { CommunityServerModule } from './services/community-server/community-server.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.development.env'],
      cache: true,
      load: [appConfig],
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('serverManager.accessTokenSecret'),
        signOptions: {
          issuer: 'MindustryTool',
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
    NestjsFormDataModule.config({ isGlobal: true, storage: MemoryStoredFile }),
    MulterModule.register({
      dest: './upload',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    PlayerConnectModule,
    PrometheusModule,
    SchematicsModule,
    MapModule,
    // PostModule,
    AuthModule,
    RedisModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('redis.url');
        return {
          stores: [createKeyv(redisUrl)],
          ttl: 10 * 60 * 1000,
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    PostModule,
    MediaModule,
    RoleModule,
    WikiModule,
    IconModule,
    LikeModule,
    CommentModule,
    TagModule,
    PlanetModule,
    ItemModule,
    VerifyModule,
    ContentParserModule,
    GitHubUploadModule,
    MapModule,
    ImageModule,
    ActionModule,
    OctokitModule,
    ModModule,
    ServerModule,
    ServerGroupModule,
    PluginModule,
    ContentPatchesModule,
    ShareModule,
    StatsModule,
    MemoryCacheModule,
    FriendshipModule,
    LogicModule,
    ChatModule,
    CrashModule,
    StorageModule,
    ImageProxyModule,
    NotificationModule,
    CommunityServerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthMiddleware,
    RoleService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: RouteInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware, LoggerMiddleware).forRoutes('*path');
  }
}
