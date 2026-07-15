import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(matches[0]).toEqual(
      expect.objectContaining({
        isOnline: true,
        whatsapp: '5511999999999',
        telegram: null,
        instagram: '@babyativa',
      }),
    );
    expect(matches[1]).toEqual(
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
