import { ForbiddenException } from '@nestjs/common';
import { InteractionsService } from './interactions.service';

describe('InteractionsService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    profileLike: { findUnique: jest.fn() },
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const transaction = {
    profileLike: { create: jest.fn(), update: jest.fn() },
    userPreference: { upsert: jest.fn() },
    notification: { create: jest.fn() },
  };

  let service: InteractionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => unknown) => callback(transaction),
    );
    service = new InteractionsService(prisma as never);
  });

  it('creates a like and notifies the approved Sugar Baby', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'daddy-1',
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
      })
      .mockResolvedValueOnce({
        id: 'baby-1',
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
      });
    prisma.profileLike.findUnique.mockResolvedValue(null);
    transaction.profileLike.create.mockResolvedValue({
      id: 'like-1',
      createdAt: new Date('2026-07-15T12:00:00Z'),
      daddyLikedAt: new Date('2026-07-15T12:00:00Z'),
      babyLikedAt: null,
      contactsReleasedAt: null,
    });

    await expect(service.likeProfile('daddy-1', 'baby-1')).resolves.toEqual(
      expect.objectContaining({ liked: true, contactsReleased: false }),
    );
    expect(transaction.notification.create).toHaveBeenCalledWith({
      data: {
        recipientId: 'baby-1',
        actorId: 'daddy-1',
        profileLikeId: 'like-1',
        type: 'LIKE_RECEIVED',
      },
    });
  });

  it('does not release contacts when the Daddy has not liked first', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'baby-1',
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        preferences: null,
      })
      .mockResolvedValueOnce({
        id: 'daddy-1',
        username: 'daddyativo',
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
      });
    prisma.profileLike.findUnique.mockResolvedValue(null);

    await expect(service.releaseContacts('baby-1', 'daddy-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('releases contacts and notifies the Daddy', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'baby-1',
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        preferences: { preferences: {} },
      })
      .mockResolvedValueOnce({
        id: 'daddy-1',
        username: 'DaddyAtivo',
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
      });
    prisma.profileLike.findUnique.mockResolvedValue({
      id: 'like-1',
      createdAt: new Date('2026-07-15T12:00:00Z'),
      daddyLikedAt: new Date('2026-07-15T12:00:00Z'),
      babyLikedAt: null,
      contactsReleasedAt: null,
    });
    transaction.profileLike.update.mockResolvedValue({
      id: 'like-1',
      createdAt: new Date('2026-07-15T12:00:00Z'),
      daddyLikedAt: new Date('2026-07-15T12:00:00Z'),
      babyLikedAt: null,
      contactsReleasedAt: new Date('2026-07-15T12:05:00Z'),
    });

    await expect(service.releaseContacts('baby-1', 'daddy-1')).resolves.toEqual(
      expect.objectContaining({ contactsReleased: true }),
    );
    expect(transaction.userPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          preferences: { contactViewerUsernames: ['daddyativo'] },
        },
      }),
    );
    expect(transaction.notification.create).toHaveBeenCalledWith({
      data: {
        recipientId: 'daddy-1',
        actorId: 'baby-1',
        profileLikeId: 'like-1',
        type: 'CONTACTS_RELEASED',
      },
    });
  });

  it('lets a Baby like a Daddy, releases contacts and notifies him', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 'baby-1',
        role: 'SUGAR_BABY',
        approvalStatus: 'APPROVED',
        preferences: { preferences: {} },
      })
      .mockResolvedValueOnce({
        id: 'daddy-1',
        username: 'DaddyAtivo',
        role: 'SUGAR_DADDY',
        approvalStatus: 'APPROVED',
      });
    prisma.profileLike.findUnique.mockResolvedValue(null);
    transaction.profileLike.create.mockResolvedValue({
      id: 'like-2',
      createdAt: new Date('2026-07-15T13:00:00Z'),
      daddyLikedAt: null,
      babyLikedAt: new Date('2026-07-15T13:00:00Z'),
      contactsReleasedAt: new Date('2026-07-15T13:00:00Z'),
    });

    await expect(
      service.likeDaddyAndReleaseContacts('baby-1', 'daddy-1'),
    ).resolves.toEqual(
      expect.objectContaining({
        babyLiked: true,
        contactsReleased: true,
      }),
    );
    expect(transaction.userPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          preferences: { contactViewerUsernames: ['daddyativo'] },
        },
      }),
    );
    expect(transaction.notification.create).toHaveBeenCalledWith({
      data: {
        recipientId: 'daddy-1',
        actorId: 'baby-1',
        profileLikeId: 'like-2',
        type: 'BABY_LIKE_AND_RELEASE',
      },
    });
  });
});
