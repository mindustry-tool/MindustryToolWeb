import { Global, Module } from '@nestjs/common';
import { MemoryCacheService } from '@/services/memory-cache/memory-cache.service';

@Global()
@Module({
  providers: [MemoryCacheService],
  exports: [MemoryCacheService],
})
export class MemoryCacheModule {}
