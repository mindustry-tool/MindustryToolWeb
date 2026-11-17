import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ProfanityService } from '@/services/profanity/profanity.service';
import { NotFoundException } from '@nestjs/common';
import { Sse } from '@/types/sse';

describe('ChatService', () => {
  let service: ChatService;

  const mockPrisma = {
    chatMessage: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    chatChannel: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockProfanity = {
    sanitizeText: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProfanityService, useValue: mockProfanity },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('handleDeleteChat', () => {
    const channelId = '0192e000-0000-7000-8000-000000000001';
    const messageId = '0192e987-6543-7890-abcd-ef0123456789';
    const prevMessageId = '0192e111-1111-7111-8111-111111111111';

    it('should throw NotFoundException when message does not exist', async () => {
      mockPrisma.chatMessage.findUnique.mockResolvedValue(null);

      await expect(service.handleDeleteChat('missing-id')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.chatMessage.delete).not.toHaveBeenCalled();
    });

    it('should delete message, update channel lastMessageId when deleting latest, and broadcast SSE delete event', async () => {
      mockPrisma.chatMessage.findUnique.mockResolvedValue({
        id: messageId,
        channelId,
        content: 'hello',
        createdBy: '0192e000-0000-7000-8000-000000000099',
        createdAt: new Date(),
        replyTo: null,
        channel: {
          id: channelId,
          name: 'Global',
          lastMessageId: messageId,
        },
      });
      mockPrisma.chatMessage.delete.mockResolvedValue({ id: messageId });
      mockPrisma.chatMessage.findFirst.mockResolvedValue({ id: prevMessageId });
      mockPrisma.chatChannel.update.mockResolvedValue({});
      mockPrisma.chatChannel.findMany.mockResolvedValue([{ id: channelId, name: 'Global' }]);

      const mockSseClient = {
        next: jest.fn(),
        onClose: jest.fn(),
        error: jest.fn(),
        close: jest.fn(),
      } as unknown as Sse;

      await service.handleStream(mockSseClient, null, 'guest-123');

      await service.handleDeleteChat(messageId);

      expect(mockPrisma.chatMessage.delete).toHaveBeenCalledWith({
        where: { id: messageId },
      });
      expect(mockPrisma.chatChannel.update).toHaveBeenCalledWith({
        where: { id: channelId },
        data: { lastMessageId: prevMessageId },
      });
      expect(mockSseClient.next).toHaveBeenCalledWith({
        data: {
          type: 'delete',
          data: {
            id: messageId,
            channelId,
            lastMessageId: prevMessageId,
          },
        },
      });
    });

    it('should not update channel lastMessageId if deleted message was not the latest', async () => {
      mockPrisma.chatMessage.findUnique.mockResolvedValue({
        id: prevMessageId,
        channelId,
        content: 'older message',
        createdBy: '0192e000-0000-7000-8000-000000000099',
        createdAt: new Date(),
        replyTo: null,
        channel: {
          id: channelId,
          name: 'Global',
          lastMessageId: messageId,
        },
      });
      mockPrisma.chatMessage.delete.mockResolvedValue({ id: prevMessageId });

      await service.handleDeleteChat(prevMessageId);

      expect(mockPrisma.chatMessage.delete).toHaveBeenCalledWith({
        where: { id: prevMessageId },
      });
      expect(mockPrisma.chatMessage.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.chatChannel.update).not.toHaveBeenCalled();
    });
  });
});
