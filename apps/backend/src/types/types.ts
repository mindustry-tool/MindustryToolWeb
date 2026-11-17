import { AuthorityEnum } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { PrismaClient, Role, User } from '@/generated/prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

export type CurrentUser = Session | null;

export type UserWithRoleAndAuthority = User & {
  roles: Role[];
  authorities: AuthorityEnum[];
  stats: Record<string, number>;
  bannedUntil?: Date | null;
};

export type AuthProvider = 'discord' | 'google';

export type TransactionContext = Omit<PrismaClient, ITXClientDenyList>;
