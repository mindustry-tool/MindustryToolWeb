import { Attachment } from 'discord.js';
import { AttachmentOption } from 'necord';

export class PreviewOption {
  @AttachmentOption({
    name: 'file',
    description: 'File to preview: .msch, .msav, .txt',
  })
  public file: Attachment;
}
