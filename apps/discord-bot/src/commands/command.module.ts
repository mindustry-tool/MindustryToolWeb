import { Module } from '@nestjs/common';
import { ContextMenuCommand } from 'src/commands/context-menu.command';
import { InfoCommand } from 'src/commands/info.command';
import { PreviewCommand } from 'src/commands/preview.command';
import { RoomsCommand } from 'src/commands/rooms.command';
import { UploadButtonHandler } from 'src/commands/upload-button.handler';
import { PlayerConnectModule } from 'src/services/player-connect/player-connect.module';

@Module({
    imports: [PlayerConnectModule],
  providers: [PreviewCommand, InfoCommand, ContextMenuCommand, RoomsCommand, UploadButtonHandler],
})
export class CommandModule { }

