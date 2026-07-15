import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const configService = {
    getOrThrow: jest.fn(() => 'test-secret'),
  } as unknown as ConfigService;
  const usersService = {
    findAuthStateById: jest.fn(),
  };

  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(configService, usersService as never);
  });

  it('blocks a pending Sugar Baby even with a signed token', async () => {
    usersService.findAuthStateById.mockResolvedValue({
      id: 'baby-1',
      email: 'baby@example.com',
      role: 'SUGAR_BABY',
      approvalStatus: 'PENDING',
    });

    await expect(
      strategy.validate({
        sub: 'baby-1',
        email: 'baby@example.com',
        role: 'SUGAR_BABY',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('allows an approved Sugar Baby', async () => {
    usersService.findAuthStateById.mockResolvedValue({
      id: 'baby-1',
      email: 'baby@example.com',
      role: 'SUGAR_BABY',
      approvalStatus: 'APPROVED',
    });

    await expect(
      strategy.validate({
        sub: 'baby-1',
        email: 'old@example.com',
        role: 'SUGAR_BABY',
      }),
    ).resolves.toEqual({
      id: 'baby-1',
      email: 'baby@example.com',
      role: 'SUGAR_BABY',
    });
  });
});
