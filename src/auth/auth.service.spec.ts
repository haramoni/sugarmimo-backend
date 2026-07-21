import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService, UserRole } from './auth.service';
import { RegisterDto } from './dto/register.dto';

const baseUser = {
  id: 'user-1',
  username: 'maria',
  email: 'maria@example.com',
  role: UserRole.SugarBaby,
  gender: 'sugar-baby-woman',
  lookingFor: 'sugar-daddy',
  birthDate: null,
  country: null,
  state: null,
  city: null,
  whatsapp: null,
  telegram: null,
  instagram: null,
  approvalStatus: 'PENDING',
  isPremium: false,
  reviewedAt: null,
  createdAt: null,
};

const registerDto = {
  username: 'Maria',
  email: 'Maria@Example.com',
  password: 'Senha@123',
  profileType: 'sugar-baby-woman',
  lookingFor: 'sugar-daddy',
  birthDate: '1990-01-01',
  termsAccepted: true,
  visibleContactChannels: ['instagram'],
  profilePhotos: [
    {
      dataUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zr6EAAAAASUVORK5CYII=',
      fileName: 'profile.png',
      mimeType: 'image/png',
    },
  ],
} as RegisterDto;

const validPasswordHash =
  '$2b$10$3ZsF3NdxAo4aREgoKKJpuepyUJ2Pc.3/eDT4chc5Lw2mJHg5Q.Kgq';

describe('AuthService', () => {
  const signToken = jest.fn(() => 'signed-token');
  const jwtService = {
    sign: signToken,
  } as unknown as JwtService;
  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(jwtService, usersService as never);
  });

  it('creates Sugar Baby registrations as pending manual approval', async () => {
    usersService.create.mockResolvedValue(baseUser);

    const response = await service.register(registerDto);

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'maria',
        email: 'maria@example.com',
        role: UserRole.SugarBaby,
        approvalStatus: 'PENDING',
        preferences: expect.objectContaining({
          visibleContactChannels: ['instagram'],
        }) as object,
      }),
    );
    expect(response).toEqual({
      requiresApproval: true,
      user: baseUser,
    });
    expect(signToken).not.toHaveBeenCalled();
  });

  it('prioritizes Sugar Baby profile type when deciding approval status', async () => {
    usersService.create.mockResolvedValue(baseUser);

    await service.register({
      ...registerDto,
      role: 'sugar-daddy',
      profileType: 'sugar-baby-woman',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.SugarBaby,
        approvalStatus: 'PENDING',
      }),
    );
  });

  it.each(['sugar-daddy', 'sugar-mommy'])(
    'temporarily blocks %s registrations',
    async (profileType) => {
      await expect(
        service.register({
          ...registerDto,
          profileType,
          profilePhotos: [],
        }),
      ).rejects.toThrow(
        'O cadastro de Sugar Daddies e Sugar Mommies esta temporariamente indisponivel.',
      );

      expect(usersService.create).not.toHaveBeenCalled();
      expect(signToken).not.toHaveBeenCalled();
    },
  );

  it('requires at least one photo from Sugar Baby registrations', async () => {
    await expect(
      service.register({
        ...registerDto,
        profilePhotos: [],
      }),
    ).rejects.toThrow(BadRequestException);

    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('rejects registrations without a valid profile role', async () => {
    await expect(
      service.register({
        ...registerDto,
        profileType: 'administrator',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(usersService.create).not.toHaveBeenCalled();
  });

  it.each(['nome com espaco', 'usuário', 'perfil😀'])(
    'rejects the invalid username %s',
    async (username) => {
      await expect(
        service.register({ ...registerDto, username }),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.create).not.toHaveBeenCalled();
    },
  );

  it('blocks pending Sugar Baby login', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...baseUser,
      passwordHash: validPasswordHash,
    });

    await expect(
      service.login({
        identifier: 'maria@example.com',
        password: 'Senha@123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('allows approved Sugar Baby login', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...baseUser,
      approvalStatus: 'APPROVED',
      reviewedAt: new Date('2026-07-09T12:00:00.000Z'),
      passwordHash: validPasswordHash,
    });

    await expect(
      service.login({
        identifier: 'maria@example.com',
        password: 'Senha@123',
      }),
    ).resolves.toMatchObject({
      accessToken: 'signed-token',
      // Jest asymmetric matchers are intentionally untyped here.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: expect.objectContaining({
        role: UserRole.SugarBaby,
        approvalStatus: 'APPROVED',
      }),
    });
  });

  it('creates an independent session for every simultaneous login', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...baseUser,
      approvalStatus: 'APPROVED',
      passwordHash: validPasswordHash,
    });

    await Promise.all([
      service.login({
        identifier: 'maria@example.com',
        password: 'Senha@123',
      }),
      service.login({
        identifier: 'maria@example.com',
        password: 'Senha@123',
      }),
    ]);

    const firstPayload = signToken.mock.calls[0]?.[0] as
      | { jti?: string }
      | undefined;
    const secondPayload = signToken.mock.calls[1]?.[0] as
      | { jti?: string }
      | undefined;

    expect(firstPayload?.jti).toEqual(expect.any(String));
    expect(secondPayload?.jti).toEqual(expect.any(String));
    expect(firstPayload?.jti).not.toBe(secondPayload?.jti);
  });
});
