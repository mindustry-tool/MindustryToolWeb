import type { AuthorityEnum } from '../constants/index.js';

export type SessionLike = {
  id: string;
  authorities: string[];
};

export type AuthFilter =
  | {
      all: AuthFilter[];
    }
  | {
      any: AuthFilter[];
    }
  | boolean
  | AuthorityEnum
  | AuthorityEnum[]
  | { authorId: string | null | undefined }
  | undefined;

export function hasAccess(session: SessionLike | undefined | null, filter: AuthFilter): boolean {
  if (filter === undefined) {
    return true;
  }

  if (!session) {
    return false;
  }

  if (session.authorities.some((authority) => authority === 'god')) {
    return true;
  }

  if (typeof filter === 'boolean') {
    return filter;
  }

  if (typeof filter === 'string') {
    return session.authorities?.map((a) => a.toLowerCase()).includes(filter.toLowerCase());
  }

  if (Array.isArray(filter)) {
    return filter.every((f) => hasAccess(session, f));
  }

  if ('all' in filter) {
    return filter.all.every((f) => hasAccess(session, f));
  }

  if ('any' in filter) {
    return filter.any.some((f) => hasAccess(session, f));
  }

  return session.id === filter.authorId;
}
