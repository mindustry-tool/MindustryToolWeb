import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler, sseRouteHandler } from '@/decorators/route.decorator';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Route(api.v4.notifications.sse)
  sse() {
    return sseRouteHandler(
      api.v4.notifications.sse,
      ({ sse, next, user }) => this.notificationService.handleSse(sse, next, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.notifications.findAll)
  findAll() {
    return routeHandler(
      api.v4.notifications.findAll,
      ({ user, query }) => this.notificationService.findAll(user.id, query),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.notifications.getUnreadCount)
  getUnreadCount() {
    return routeHandler(
      api.v4.notifications.getUnreadCount,
      ({ user }) => this.notificationService.getUnreadCount(user.id),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.notifications.markAsRead)
  markAsRead() {
    return routeHandler(
      api.v4.notifications.markAsRead,
      ({ user, params }) => this.notificationService.markAsRead(user.id, params.id),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }

  @Route(api.v4.notifications.markAllAsRead)
  markAllAsRead() {
    return routeHandler(
      api.v4.notifications.markAllAsRead,
      ({ user }) => this.notificationService.markAllAsRead(user.id),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }

  @Route(api.v4.notifications.delete)
  delete() {
    return routeHandler(
      api.v4.notifications.delete,
      ({ user, params }) => this.notificationService.delete(user.id, params.id),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }

  @Route(api.v4.notifications.clearRead)
  clearRead() {
    return routeHandler(api.v4.notifications.clearRead, ({ user }) => this.notificationService.clearRead(user.id), {
      filter: true,
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.notifications.getPreferences)
  getPreferences() {
    return routeHandler(
      api.v4.notifications.getPreferences,
      ({ user }) => this.notificationService.getPreferences(user.id),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.notifications.updatePreferences)
  updatePreferences() {
    return routeHandler(
      api.v4.notifications.updatePreferences,
      ({ user, body }) => this.notificationService.updatePreferences(user.id, body),
      {
        filter: true,
        limit: [20, 'minute'],
      },
    );
  }
}
