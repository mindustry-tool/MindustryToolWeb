import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class AdminNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Route(api.v4.management.notifications.broadcast)
  broadcast() {
    return routeHandler(
      api.v4.management.notifications.broadcast,
      ({ user, body }) => this.notificationService.broadcast(user.id, body),
      {
        filter: 'notification:manage',
      },
    );
  }

  @Route(api.v4.management.notifications.getHistory)
  getHistory() {
    return routeHandler(
      api.v4.management.notifications.getHistory,
      ({ query }) => this.notificationService.getBroadcastHistory(query.page, query.size),
      {
        filter: 'notification:manage',
      },
    );
  }

  @Route(api.v4.management.notifications.delete)
  delete() {
    return routeHandler(
      api.v4.management.notifications.delete,
      ({ params }) => this.notificationService.deleteSystemNotification(params.id),
      {
        filter: 'notification:manage',
      },
    );
  }
}
