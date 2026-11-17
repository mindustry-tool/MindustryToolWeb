import { ChatService } from './chat.service';
import { Route, routeHandler, sseRouteHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';
import { Controller } from '@nestjs/common';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Route(api.v4.chats.stream)
  getChat() {
    return sseRouteHandler(api.v4.chats.stream, ({ sse, user, req }) => {
      const chatId = req.headers['x-chat-id'] ? String(req.headers['x-chat-id']) : undefined;
      return this.chatService.handleStream(sse, user ?? null, chatId);
    });
  }

  @Route(api.v4.chats.fetch)
  fetchChat() {
    return routeHandler(api.v4.chats.fetch, ({ query }) => this.chatService.handleFetch(query));
  }

  @Route(api.v4.chats.send)
  sendChat() {
    return routeHandler(api.v4.chats.send, ({ body, user }) => this.chatService.handleSendText(body, user), {
      filter: true,
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.chats.users)
  getUsers() {
    return routeHandler(api.v4.chats.users, () => this.chatService.handleGetUsers());
  }

  @Route(api.v4.chats.userCount)
  getUserCount() {
    return routeHandler(api.v4.chats.userCount, () => this.chatService.handleGetUserCount());
  }

  @Route(api.v4.chats.channels)
  getChannels() {
    return routeHandler(api.v4.chats.channels, () => this.chatService.handleGetChannels());
  }

  @Route(api.v4.chats.updateState)
  updateState() {
    return routeHandler(api.v4.chats.updateState, ({ body, user }) => this.chatService.handleUpdateState(body, user), {
      filter: true,
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.chats.delete)
  deleteChat() {
    return routeHandler(api.v4.chats.delete, ({ params }) => this.chatService.handleDeleteChat(params.id), {
      filter: { any: ['god', 'chat:delete'] },
    });
  }
}
