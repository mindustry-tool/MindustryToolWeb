import { User } from 'discord.js';
import { UserOption } from 'necord';

export class InfoOption {
  @UserOption({
    name: 'user',
    description: 'User',
  })
  public user: User;
}
