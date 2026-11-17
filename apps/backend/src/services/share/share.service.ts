import { PrismaService } from '@/prisma/prisma.service';
import { StatsService } from '@/services/stats/stats.service';
import { api } from '@mindustry-tool/api';
import { ApiQuery } from '@mindustry-tool/api';
import { Injectable } from '@nestjs/common';
import { NotificationService } from '@/services/notification/notification.service';

@Injectable()
export class ShareService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly statsService: StatsService,
    private readonly notificationService: NotificationService,
  ) {}

  private readonly CREDIT_PER_VISIT = 30;

  async createShareLink(url: string, userId: string) {
    return await this.prismaService.shareLink.create({
      data: {
        url,
        createdBy: userId,
        createdAt: new Date(),
      },
    });
  }

  async visitShareLink(id: string, ip: string) {
    const shareLink = await this.prismaService.shareLink.findUniqueOrThrow({
      where: {
        id,
      },
    });

    const invited = await this.prismaService.userInvited.findFirst({
      where: {
        ip,
        userId: shareLink.createdBy,
      },
    });

    if (!invited) {
      await this.prismaService.$transaction(async (tx) => {
        await tx.shareLink.update({
          where: {
            id,
          },
          data: {
            count: {
              increment: 1,
            },
          },
        });

        await tx.userInvited.create({
          data: {
            ip,
            userId: shareLink.createdBy,
          },
        });

        await this.statsService.addStats({
          userId: shareLink.createdBy,
          name: 'credit',
          amount: this.CREDIT_PER_VISIT,
          tx,
        });
      });

      await this.notificationService.notify({
        userId: shareLink.createdBy,
        code: 'share_reward',
        params: {
          url: shareLink.url,
          credits: this.CREDIT_PER_VISIT,
          visitCount: 1,
        },
        aggregationKey: `share_reward:${shareLink.createdBy}:${id}`,
        link: shareLink.url,
      });
    }
  }

  async findMyShareLinks(query: ApiQuery<typeof api.v4.share.findMy>, userId: string) {
    return await this.prismaService.shareLink.findMany({
      where: {
        createdBy: userId,
      },
      skip: query.page * query.size,
      take: query.size,
      orderBy: {
        id: 'desc',
      },
    });
  }

  async countMyShareLinks(userId: string) {
    return await this.prismaService.shareLink.count({
      where: {
        createdBy: userId,
      },
    });
  }
}
