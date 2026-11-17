import { Global, Module } from '@nestjs/common';
import { ApiService } from 'src/api/api.service';

@Global()
@Module({
  exports: [ApiService],
  providers: [ApiService],
})
export class ApiModule {}
