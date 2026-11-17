import { Session } from '@mindustry-tool/api';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    const user = request.user as unknown as Session;

    if (!user) {
      throw new UnauthorizedException("You are not logged in");
    }

    return user.id;
  },
);
