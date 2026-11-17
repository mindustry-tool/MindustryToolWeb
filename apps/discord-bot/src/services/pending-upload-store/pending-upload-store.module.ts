import { Global, Module } from '@nestjs/common';
import { PendingUploadStore } from './pending-upload-store.service';

@Global()
@Module({
  providers: [PendingUploadStore],
  exports: [PendingUploadStore],
})
export class PendingUploadStoreModule {}
