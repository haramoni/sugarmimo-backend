import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
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
        data: expect.objectContaining({
          role: 'SUGAR_BABY',
          approvalStatus: 'PENDING',
        }),
      }),
    );
  });
});
