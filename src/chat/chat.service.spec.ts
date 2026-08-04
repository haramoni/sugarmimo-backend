import { ForbiddenException } from '@nestjs/common';
import { ChatCryptoService } from './chat-crypto.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    userBlock: { findFirst: jest.fn() },
    profileLike: { findUnique: jest.fn() },
    chatMessage: { deleteMany: jest.fn() },
    chatConversation: { upsert: jest.fn() },
  };
  const crypto = {
    encrypt: jest.fn((value: string) => `encrypted:${value}`),
    decrypt: jest.fn((value: string) => value),
  } as unknown as ChatCryptoService;
  const service = new ChatService(prisma as never, crypto);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires reciprocal likes before opening a conversation', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      })
      .mockResolvedValueOnce({
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
        isPremium: true,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      });
    prisma.userBlock.findFirst.mockResolvedValue(null);
    prisma.profileLike.findUnique.mockResolvedValue({
      daddyLikedAt: new Date(),
      babyLikedAt: null,
    });

    await expect(
      service.openConversation('baby-1', 'daddy-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.chatConversation.upsert).not.toHaveBeenCalled();
  });

  it('removes messages older than the 60-day retention window', async () => {
    prisma.chatMessage.deleteMany.mockResolvedValue({ count: 4 });
    const before = Date.now() - 60 * 24 * 60 * 60 * 1000;

    await expect(service.deleteExpiredMessages()).resolves.toEqual({
      deletedCount: 4,
    });

    const calls = prisma.chatMessage.deleteMany.mock.calls as Array<
      [{ where: { createdAt: { lt: Date } } }]
    >;
    const cutoff = calls[0][0].where.createdAt.lt;
    expect(cutoff).toBeInstanceOf(Date);
    expect(cutoff.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(cutoff.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
