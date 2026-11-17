import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RoleService } from '@/services/role/role.service';
import { MemoryCacheService } from '@/services/memory-cache/memory-cache.service';

@Global()
@Module({
  providers: [RedisService, RoleService, MemoryCacheService],
  exports: [RedisService],
})
export class RedisModule {}
