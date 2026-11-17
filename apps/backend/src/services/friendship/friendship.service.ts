import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@/generated/prisma/client';

@Injectable()
export class FriendshipService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFriends(userId: string, query: ApiQuery<typeof api.v4.users.me.friends.getAll>) {
    const friendships = await this.prismaService.friendship.findMany({
      where: {
        status: query.status,
        OR: [{ userId: userId }, { friendId: userId }],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    return friendships.map((f) => (f.userId === userId ? this.addStatus(f.friend) : this.addStatus(f.user)));
  }

  private addStatus(user: User) {
    return {
      ...user,
      status: 'offline',
    } as const;
  }

  async updateFriend(userId: string, friendId: string, body: ApiBody<typeof api.v4.users.me.friends.update>) {
    const [low, high] = [userId, friendId].sort();

    const { count } = await this.prismaService.friendship.updateMany({
      where: {
        userId: low,
        friendId: high,
      },
      data: {
        status: body.status,
      },
    });

    if (count === 0) {
      throw new Error('Friendship not found');
    }

    return this.prismaService.friendship.findFirstOrThrow({
      where: {
        userId: low,
        friendId: high,
      },
    });
  }

  async createFriend(userId: string, body: ApiBody<typeof api.v4.users.me.friends.create>) {
    const [low, high] = [userId, body.userId].sort();

    try {
      return await this.prismaService.friendship.create({
        data: {
          userId: low,
          friendId: high,
          status: 'PENDING',
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Friendship already exists');
      }
      throw e;
    }
  }
}
