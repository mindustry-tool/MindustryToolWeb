import { Test, TestingModule } from '@nestjs/testing';
import { CommentService, extractTextSnippet } from './comment.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { Session } from '@mindustry-tool/api';

describe('CommentService', () => {
  let service: CommentService;
  let prisma: any;
  let notificationService: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (cb) => cb(prisma)),
      comment: {
        findUniqueOrThrow: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'comment-123' }),
        count: jest.fn().mockResolvedValue(1),
      },
      post: {
        findFirstOrThrow: jest.fn(),
        update: jest.fn(),
      },
      item: {
        findUnique: jest.fn(),
      },
    };

    notificationService = {
      notify: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractTextSnippet', () => {
    it('should strip HTML tags and collapse whitespace', () => {
      const input = '<p>Hello <strong>World</strong>!</p><p>New line</p>';
      expect(extractTextSnippet(input)).toBe('Hello World ! New line');
    });

    it('should truncate text longer than maxLength and add ellipsis', () => {
      const input = 'a'.repeat(150);
      const snippet = extractTextSnippet(input, 50);
      expect(snippet.length).toBe(53); // 50 + '...'
      expect(snippet.endsWith('...')).toBe(true);
    });
  });

  describe('create - top-level comment', () => {
    it('should dispatch comment.post notification when commenting on another user post', async () => {
      const authorId = 'author-456';
      const commenter = { id: 'commenter-123', name: 'Alice' } as unknown as Session;

      prisma.post.findFirstOrThrow.mockResolvedValue({
        id: 'post-real-id',
        title: 'Awesome Reactor Design',
        comments: 0,
      });

      prisma.item.findUnique.mockResolvedValue({
        createdBy: authorId,
      });

      await service.create(
        { itemType: 'posts', itemId: 'item-uuid-789' },
        { itemId: 'item-uuid-789', content: '<p>Great post, thanks for sharing!</p>' },
        commenter,
      );

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledWith({
        userId: authorId,
        code: 'comment.post',
        params: {
          itemType: 'posts',
          itemId: 'post-real-id',
          itemName: 'Awesome Reactor Design',
          actorName: 'Alice',
          commentId: 'comment-123',
          contentSnippet: 'Great post, thanks for sharing!',
        },
        groupKey: 'posts:post-real-id',
        link: '/posts/post-real-id?commentId=comment-123',
      });
    });

    it('should NOT dispatch comment.post notification when user comments on their own post', async () => {
      const authorId = 'user-same';
      const user = { id: authorId, name: 'Alice' } as unknown as Session;

      prisma.post.findFirstOrThrow.mockResolvedValue({
        id: 'post-real-id',
        title: 'My Post',
        comments: 0,
      });

      prisma.item.findUnique.mockResolvedValue({
        createdBy: authorId,
      });

      await service.create(
        { itemType: 'posts', itemId: 'item-uuid-789' },
        { itemId: 'item-uuid-789', content: '<p>Self comment</p>' },
        user,
      );

      expect(notificationService.notify).not.toHaveBeenCalled();
    });
  });

  describe('create - reply to comment', () => {
    it('should dispatch comment.reply notification when replying to another user comment', async () => {
      const parentCommentAuthorId = 'user-parent-999';
      const replier = { id: 'user-replier-111', name: 'Bob' } as unknown as Session;

      prisma.comment.findUniqueOrThrow.mockResolvedValue({
        id: 'parent-comment-id',
        userId: parentCommentAuthorId,
      });

      prisma.post.findFirstOrThrow.mockResolvedValue({
        id: 'post-real-id',
        title: 'Discussion Thread',
        comments: 1,
      });

      await service.create(
        { itemType: 'posts', itemId: 'item-uuid-789' },
        {
          itemId: 'item-uuid-789',
          replyId: 'parent-comment-id',
          content: '<p>I agree with your suggestion!</p>',
        },
        replier,
      );

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledWith({
        userId: parentCommentAuthorId,
        code: 'comment.reply',
        params: {
          itemType: 'posts',
          itemId: 'post-real-id',
          itemName: 'Discussion Thread',
          actorName: 'Bob',
          commentId: 'comment-123',
          replyId: 'parent-comment-id',
          contentSnippet: 'I agree with your suggestion!',
        },
        groupKey: 'posts:post-real-id',
        link: '/posts/post-real-id?commentId=comment-123',
      });
    });

    it('should NOT dispatch comment.reply notification when user replies to their own comment', async () => {
      const sameUserId = 'user-self-222';
      const replier = { id: sameUserId, name: 'Bob' } as unknown as Session;

      prisma.comment.findUniqueOrThrow.mockResolvedValue({
        id: 'parent-comment-id',
        userId: sameUserId,
      });

      prisma.post.findFirstOrThrow.mockResolvedValue({
        id: 'post-real-id',
        title: 'Discussion Thread',
        comments: 1,
      });

      await service.create(
        { itemType: 'posts', itemId: 'item-uuid-789' },
        {
          itemId: 'item-uuid-789',
          replyId: 'parent-comment-id',
          content: '<p>Updating my own thoughts</p>',
        },
        replier,
      );

      expect(notificationService.notify).not.toHaveBeenCalled();
    });
  });
});

