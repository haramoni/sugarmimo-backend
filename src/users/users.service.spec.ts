import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userPhoto: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    userBlock: {
      findMany: jest.fn(),
    },
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.count.mockResolvedValue(0);
    prisma.userBlock.findMany.mockResolvedValue([]);
    service = new UsersService(prisma as never);
  });

  it('forces Sugar Baby profiles to pending approval on create', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      role: 'SUGAR_BABY',
      approvalStatus: 'PENDING',
    });

    await service.create({
      username: 'baby',
      email: 'baby@example.com',
      passwordHash: 'hash',
      role: 'SUGAR_BABY',
      approvalStatus: 'APPROVED',
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        // Jest asymmetric matchers are intentionally untyped here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          role: 'SUGAR_BABY',
          approvalStatus: 'PENDING',
        }),
      }),
    );
  });

  it('suggests only approved Sugar Daddies to approved Sugar Babies', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_BABY',
      approvalStatus: 'APPROVED',
    });
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'daddy-1',
        username: 'daddyativo',
        city: 'Sao Paulo',
        state: 'SP',
      },
    ]);
    await expect(
      service.findActiveDaddySuggestions('baby-1', 'daddy'),
    ).resolves.toEqual([expect.objectContaining({ username: 'daddyativo' })]);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // Jest asymmetric matchers are intentionally untyped here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: expect.objectContaining({
          role: 'SUGAR_DADDY',
          approvalStatus: 'APPROVED',
        }),
      }),
    );
  });

  it('loads only photos that belong to an approved match profile', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_DADDY',
      approvalStatus: 'APPROVED',
    });
    prisma.userPhoto.findFirst.mockResolvedValue({
      id: 'photo-1',
      dataUrl: 'data:image/jpeg;base64,/9j/',
      mimeType: 'image/jpeg',
      isPrivate: false,
      user: { preferences: null },
    });

    await expect(
      service.findMatchPhotoForUser('daddy-1', 'photo-1'),
    ).resolves.toEqual(expect.objectContaining({ id: 'photo-1' }));
    expect(prisma.userPhoto.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'photo-1',
          user: {
            role: 'SUGAR_BABY',
            approvalStatus: 'APPROVED',
          },
        },
      }),
    );
  });

  it('allows a private photo only for an explicitly authorized username', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_DADDY',
      username: 'daddyativo',
      approvalStatus: 'APPROVED',
    });
    prisma.userPhoto.findFirst.mockResolvedValue({
      id: 'private-photo-1',
      dataUrl: 'data:image/jpeg;base64,/9j/',
      mimeType: 'image/jpeg',
      isPrivate: true,
      user: {
        preferences: {
          preferences: {
            privatePhotoViewerUsernames: ['daddyativo'],
          },
        },
      },
    });

    await expect(
      service.findMatchPhotoForUser('daddy-1', 'private-photo-1'),
    ).resolves.toEqual(expect.objectContaining({ id: 'private-photo-1' }));
  });

  it('does not return a private photo to an unauthorized username', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_DADDY',
      username: 'daddynaopermitido',
      approvalStatus: 'APPROVED',
    });
    prisma.userPhoto.findFirst.mockResolvedValue({
      id: 'private-photo-1',
      dataUrl: 'data:image/jpeg;base64,/9j/',
      mimeType: 'image/jpeg',
      isPrivate: true,
      user: {
        preferences: {
          preferences: {
            privatePhotoViewerUsernames: ['daddyativo'],
          },
        },
      },
    });

    await expect(
      service.findMatchPhotoForUser('daddy-1', 'private-photo-1'),
    ).resolves.toBeNull();
  });

  it('does not expose Daddy suggestions to non-Baby profiles', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_DADDY',
      approvalStatus: 'APPROVED',
    });

    await expect(
      service.findActiveDaddySuggestions('daddy-1', ''),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('shows approved Babies to Daddies and only reveals authorized contacts', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_DADDY',
      username: 'daddyativo',
      approvalStatus: 'APPROVED',
    });
    prisma.user.findMany.mockResolvedValue([
      publicBabyProfile({ contactViewerUsernames: ['daddyativo'] }),
      publicBabyProfile({
        id: 'baby-2',
        username: 'babyprivada',
        contactViewerUsernames: ['outrodaddy'],
      }),
    ]);

    const matches = await service.findMatchesForUser('daddy-1');

    expect(matches.items[0]).toEqual(
      expect.objectContaining({
        isOnline: true,
        whatsapp: '5511999999999',
        telegram: null,
        instagram: null,
      }),
    );
    expect(matches.items[1]).toEqual(
      expect.objectContaining({
        whatsapp: null,
        telegram: null,
        instagram: null,
      }),
    );
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // Jest asymmetric matchers are intentionally untyped here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: expect.objectContaining({
          role: 'SUGAR_BABY',
          approvalStatus: 'APPROVED',
        }),
        orderBy: [{ lastActiveAt: 'desc' }, { createdAt: 'desc' }],
        skip: 0,
        take: 10,
        select: expect.objectContaining({
          photos: expect.objectContaining({
            take: 1,
            select: expect.not.objectContaining({ dataUrl: true }) as object,
          }) as object,
        }) as object,
      }),
    );
    expect(matches).toEqual(
      expect.objectContaining({
        page: 1,
        pageSize: 9,
        hasMore: false,
      }),
    );
    expect(prisma.user.count).not.toHaveBeenCalled();
  });

  it('returns match pages incrementally', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_BABY',
      username: 'babyativa',
      approvalStatus: 'APPROVED',
    });
    prisma.user.findMany.mockResolvedValue(
      Array.from({ length: 10 }, (_, index) =>
        publicDaddyProfile(`daddy-${index + 1}`),
      ),
    );

    const result = await service.findMatchesForUser('baby-1', '', 2, 9);

    expect(result.items).toHaveLength(9);
    expect(result.hasMore).toBe(true);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 9, take: 10 }),
    );
  });

  it('returns only active boosted profiles for the opposite role', async () => {
    prisma.user.findUnique.mockResolvedValue({
      role: 'SUGAR_DADDY',
      username: 'daddyativo',
      approvalStatus: 'APPROVED',
    });
    prisma.user.findMany.mockResolvedValue([publicBabyProfile({})]);

    const result = await service.findBoostedProfilesForUser('daddy-1', 1, 6);

    expect(result.items).toHaveLength(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // Jest asymmetric matchers are intentionally untyped here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: expect.objectContaining({
          role: 'SUGAR_BABY',
          approvalStatus: 'APPROVED',
          boostedUntil: { gt: expect.any(Date) as Date },
        }),
        skip: 0,
        take: 7,
      }),
    );
    expect(prisma.user.count).not.toHaveBeenCalled();
  });

  it('paginates pending Sugar Babies with a stable database query', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'baby-7' }]);
    prisma.user.count.mockResolvedValue(13);

    await expect(service.findPendingBabies(2, 6)).resolves.toEqual({
      items: [{ id: 'baby-7' }],
      pagination: {
        page: 2,
        pageSize: 6,
        totalItems: 13,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: true,
      },
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 6,
        take: 6,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('lists the Sugar Babies moved to the waiting queue', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'baby-waiting' }]);
    prisma.user.count.mockResolvedValue(1);

    await expect(service.findWaitingBabies(1, 6)).resolves.toEqual(
      expect.objectContaining({ items: [{ id: 'baby-waiting' }] }),
    );
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          role: 'SUGAR_BABY',
          approvalStatus: 'WAITING',
        },
      }),
    );
  });

  it('updates the authenticated user presence', async () => {
    prisma.user.update.mockResolvedValue({ id: 'user-1' });

    await expect(service.touchPresence('user-1')).resolves.toEqual({
      online: true,
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { lastActiveAt: expect.any(Date) as Date },
      select: { id: true },
    });
  });

  it('activates Premium for a Sugar Daddy', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'SUGAR_DADDY' });
    prisma.user.update.mockResolvedValue({
      id: 'daddy-1',
      isPremium: true,
    });

    await expect(service.updatePremiumStatus('daddy-1', true)).resolves.toEqual(
      expect.objectContaining({ isPremium: true }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'daddy-1' },
        data: { isPremium: true },
      }),
    );
  });

  it('does not apply Premium to a Sugar Baby', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'SUGAR_BABY' });

    await expect(service.updatePremiumStatus('baby-1', true)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('removes a photo only from a Sugar Baby under admin review', async () => {
    prisma.userPhoto.findFirst.mockResolvedValue({ id: 'photo-1' });
    prisma.userPhoto.delete.mockResolvedValue({ id: 'photo-1' });

    await expect(
      service.removePendingProfilePhoto('baby-1', 'photo-1'),
    ).resolves.toEqual({ id: 'photo-1', removed: true });

    expect(prisma.userPhoto.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'photo-1',
        userId: 'baby-1',
        user: {
          role: 'SUGAR_BABY',
          approvalStatus: { in: ['PENDING', 'WAITING'] },
        },
      },
      select: { id: true },
    });
    expect(prisma.userPhoto.delete).toHaveBeenCalledWith({
      where: { id: 'photo-1' },
    });
  });
});

function publicBabyProfile({
  id = 'baby-1',
  username = 'babyativa',
  contactViewerUsernames,
}: {
  id?: string;
  username?: string;
  contactViewerUsernames: string[];
}) {
  return {
    id,
    username,
    role: 'SUGAR_BABY',
    lastActiveAt: new Date(),
    whatsapp: '5511999999999',
    telegram: '@babyativa',
    instagram: '@babyativa',
    preferences: {
      preferences: {
        visibleContactChannels: ['whatsapp', 'instagram'],
        contactViewerUsernames,
      },
    },
  };
}

function publicDaddyProfile(id: string) {
  return {
    id,
    username: id,
    role: 'SUGAR_DADDY',
    isPremium: true,
    lastActiveAt: new Date(),
    whatsapp: null,
    telegram: null,
    instagram: null,
    preferences: { preferences: {} },
  };
}
