import { ChatCryptoService } from './chat-crypto.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const prisma = {
    user: { findUnique: jest.fn(), updateMany: jest.fn() },
    userBlock: { findFirst: jest.fn() },
    profileLike: { findUnique: jest.fn() },
    chatMessage: { create: jest.fn(), deleteMany: jest.fn() },
    chatConversation: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const crypto = {
    encrypt: jest.fn((value: string) => `encrypted:${value}`),
    decrypt: jest.fn((value: string) => value),
  } as unknown as ChatCryptoService;
  const service = new ChatService(prisma as never, crypto);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) =>
      callback(prisma),
    );
  });

  it('allows a Baby to open a conversation with any active Daddy', async () => {
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
        isPremium: false,
        isPremiere: false,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      });
    prisma.userBlock.findFirst.mockResolvedValue(null);
    prisma.chatConversation.upsert.mockResolvedValue({ id: 'conversation-1' });

    await expect(
      service.openConversation('baby-1', 'daddy-1'),
    ).resolves.toEqual({ id: 'conversation-1' });
    expect(prisma.profileLike.findUnique).not.toHaveBeenCalled();
  });

  it('allows a Premiere Daddy to open a matched conversation', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: true,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      })
      .mockResolvedValueOnce({
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: false,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      });
    prisma.userBlock.findFirst.mockResolvedValue(null);
    prisma.profileLike.findUnique.mockResolvedValue({
      daddyLikedAt: new Date(),
      babyLikedAt: new Date(),
    });
    prisma.chatConversation.upsert.mockResolvedValue({ id: 'conversation-1' });

    await expect(
      service.openConversation('daddy-1', 'baby-1'),
    ).resolves.toEqual({ id: 'conversation-1' });
  });

  it('allows a standard Daddy with free messages to open a conversation', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: false,
        freeMessagesUsed: 0,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      })
      .mockResolvedValueOnce({
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: false,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      });
    prisma.userBlock.findFirst.mockResolvedValue(null);
    prisma.chatConversation.upsert.mockResolvedValue({ id: 'conversation-1' });

    await expect(
      service.openConversation('daddy-1', 'baby-1'),
    ).resolves.toEqual({ id: 'conversation-1' });
  });

  it('blocks a standard Daddy after all ten free messages', async () => {
    prisma.chatConversation.findFirst.mockResolvedValue({
      id: 'conversation-1',
      memberOneId: 'baby-1',
      memberTwoId: 'daddy-1',
    });
    prisma.user.findUnique
      .mockResolvedValueOnce({
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: false,
        freeMessagesUsed: 10,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      })
      .mockResolvedValueOnce({
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: false,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      });
    prisma.userBlock.findFirst.mockResolvedValue(null);

    await expect(
      service.sendMessage('daddy-1', 'conversation-1', 'Olá'),
    ).rejects.toThrow('10 mensagens gratuitas');
  });

  it('reports the remaining free message balance for a standard Daddy', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_DADDY',
      isPremium: false,
      isPremiere: false,
      freeMessagesUsed: 3,
    });

    await expect(service.getMessageAccess('daddy-1')).resolves.toEqual({
      canSend: true,
      isTrial: true,
      freeMessagesLimit: 10,
      freeMessagesUsed: 3,
      freeMessagesRemaining: 7,
      requiresUpgrade: false,
    });
  });

  it('sends the tenth free message and returns a zero balance', async () => {
    prisma.chatConversation.findFirst.mockResolvedValue({
      id: 'conversation-1',
      memberOneId: 'baby-1',
      memberTwoId: 'daddy-1',
    });
    prisma.user.findUnique
      .mockResolvedValueOnce({
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: false,
        freeMessagesUsed: 9,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      })
      .mockResolvedValueOnce({
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        isPremium: false,
        isPremiere: false,
        freeMessagesUsed: 0,
        accountStatus: 'ACTIVE',
        suspendedUntil: null,
      })
      .mockResolvedValueOnce({ freeMessagesUsed: 10 });
    prisma.userBlock.findFirst.mockResolvedValue(null);
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.chatMessage.create.mockResolvedValue({
      id: 'message-10',
      conversationId: 'conversation-1',
      senderId: 'daddy-1',
      body: 'encrypted:Olá',
      readAt: null,
      createdAt: new Date(),
    });
    prisma.chatConversation.update.mockResolvedValue({});

    await expect(
      service.sendMessage('daddy-1', 'conversation-1', 'Olá'),
    ).resolves.toEqual(expect.objectContaining({ freeMessagesRemaining: 0 }));
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'daddy-1', freeMessagesUsed: { lt: 10 } },
      data: { freeMessagesUsed: { increment: 1 } },
    });
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
