import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import crypto from 'crypto';
import { Session } from '@mindustry-tool/api';

export function getSessionOrNull(req: Request): Session | null {
  return req.user as unknown as Session;
}

export function getSession(req: Request): Session {
  const user = getSessionOrNull(req);

  if (!user) {
    throw new UnauthorizedException('You are not logged in');
  }

  return user;
}

export function sha256(data: string) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getSessionKey({ userId, hashedToken }: { userId: string; hashedToken: string }) {
  return `session:${userId}:${hashedToken}`;
}

export function getSessionPrefix(userId: string) {
  return `session:${userId}:*`;
}

export function generateSessionByUser(user: Session): {
  token: string;
  session: Session;
} {
  const token = generateSessionToken();

  return {
    token,
    session: {
      ...user,
    },
  };
}
