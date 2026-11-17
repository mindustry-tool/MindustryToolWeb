import { PrismaService } from '@/prisma/prisma.service';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { StatsService } from '@/services/stats/stats.service';
import { AuthFilter, hasAccess } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Item, VerificationStatus } from '@/generated/prisma/client';
import { NotificationService } from '@/services/notification/notification.service';

type DataWithVerify = {
  verifierId: string | null;
  verificationStatus: VerificationStatus;
};

type DataRepository<D extends DataWithVerify> = {
  update: (props: {
    where: {
      itemId: string;
    };
    data: {
      verifierId: string;
      verificationStatus: VerificationStatus;
    };
  }) => Promise<D>;
  findFirstOrThrow: (props: {
    where: {
      itemId: string;
    };
    include: {
      item: true;
    };
  }) => Promise<
    D & {
      item: Item;
    }
  >;
};

@Injectable()
export class VerifyService {
  private contentMap: Record<
    'schematics' | 'maps' | 'content-patches',
    { auth: AuthFilter; repo: DataRepository<DataWithVerify>; webhook: string }
  >;

  private readonly logger = new Logger(VerifyService.name);

  private readonly CREDIT_PER_VERIFY = 30;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly prometheusService: PrometheusService,
    private readonly statsService: StatsService,
    private readonly notificationService: NotificationService,
  ) {
    this.contentMap = {
      schematics: {
        auth: 'schematic:manage',
        repo: this.prismaService.schematic,
        // TODO: Config
        webhook:
          'https://discord.com/api/webhooks/1512383530552786975/K1SbD-Ez7w-5BdIGRYmoic8lhflgoosUS2k6DHgHY82yV-Z3Ocy54AisXjwbSS3xdvto',
      },
      maps: {
        auth: 'map:manage',
        repo: this.prismaService.map,
        webhook:
          'https://discord.com/api/webhooks/1512383530552786975/K1SbD-Ez7w-5BdIGRYmoic8lhflgoosUS2k6DHgHY82yV-Z3Ocy54AisXjwbSS3xdvto',
      },
      'content-patches': {
        auth: 'content-patch:manage',
        repo: this.prismaService.contentPatch,
        webhook:
          'https://discord.com/api/webhooks/1512383530552786975/K1SbD-Ez7w-5BdIGRYmoic8lhflgoosUS2k6DHgHY82yV-Z3Ocy54AisXjwbSS3xdvto',
      },
    };
  }

  sendNotification(itemType: keyof typeof this.contentMap, id: string, action: 'verify' | 'reject' | 'create') {
    const url = this.configService.getOrThrow('url.frontend') + `/${itemType}/${id}`;

    const content = this.contentMap[itemType];

    if (!content) {
      throw new BadRequestException(`Invalid item type not found: ${itemType}`);
    }

    const { webhook } = content;

    fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `${action} ${url}`,
      }),
      signal: AbortSignal.timeout(5000),
    }).catch((error) => this.logger.error(error));
  }

  async reset(itemType: string, id: string, session: Session) {
    const content = this.contentMap[itemType as keyof typeof this.contentMap];

    if (!content) {
      throw new BadRequestException(`Invalid item type not found: ${itemType}`);
    }

    const { auth, repo } = content;

    if (!hasAccess(session, auth)) {
      throw new ForbiddenException('Youre so fucked up');
    }

    const result = await repo.update({
      where: {
        itemId: id,
      },
      data: {
        verifierId: session.id,
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    return result;
  }

  async update(itemType: string, id: string, session: Session, action: 'verify' | 'reject', reason?: string) {
    const content = this.contentMap[itemType as keyof typeof this.contentMap];

    if (!content) {
      throw new BadRequestException(`Invalid item type not found: ${itemType}`);
    }

    const { auth, repo } = content;

    if (!hasAccess(session, auth)) {
      throw new ForbiddenException('Youre so fucked up');
    }

    const exists = await repo.findFirstOrThrow({
      where: {
        itemId: id,
      },
      include: {
        item: true,
      },
    });

    const result = await repo.update({
      where: {
        itemId: id,
      },
      data: {
        verifierId: session.id,
        verificationStatus: action === 'verify' ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
      },
    });

    if (exists.item.createdBy !== session.id && exists.verifierId === null) {
      if (action === 'verify') {
        await this.statsService.addStats({
          userId: exists.item.createdBy,
          name: 'credit',
          amount: 30,
          tx: this.prismaService,
        });
      }

      await this.statsService.addStats({
        userId: session.id,
        name: 'credit',
        amount: 10,
        tx: this.prismaService,
      });
    }

    this.prometheusService.verifyGauge.inc(
      {
        action,
        itemType,
        verifier: session.name + ':' + session.id,
      },
      1,
    );

    this.sendNotification(itemType as keyof typeof this.contentMap, id, action);

    const namedItem = exists as { name?: string; title?: string };
    const itemName = namedItem.name ?? namedItem.title ?? '';
    if (action === 'verify') {
      await this.notificationService.notify({
        userId: exists.item.createdBy,
        code: 'verification.approved',
        params: {
          itemType,
          itemId: id,
          itemName,
          credits: 30,
        },
        groupKey: `${itemType}:${id}`,
        link: `/${itemType}/${id}`,
      });
    } else if (action === 'reject') {
      await this.notificationService.notify({
        userId: exists.item.createdBy,
        code: 'verification.rejected',
        params: {
          itemType,
          itemId: id,
          itemName,
          reason,
        },
        groupKey: `${itemType}:${id}`,
        link: `/${itemType}/${id}`,
      });
    }

    return result;
  }
}
