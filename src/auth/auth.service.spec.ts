import { UnauthorizedException } from '@nestjs/common';
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
  reviewedAt: null,
  createdAt: null,
};

const registerDto = {
  username: 'Maria',
  email: 'Maria@Example.com',
  password: 'Senha@123',
  profileType: 'sugar-baby-woman',
  lookingFor: 'sugar-daddy',
  profilePhotos: [
    {
      dataUrl: 'data:image/png;base64,abc',
      fileName: 'profile.png',
      mimeType: 'image/png',
    },
  ],
} as RegisterDto;

describe('AuthService', () => {
  const jwtService = {
    sign: jest.fn(() => 'signed-token'),
  } as unknown as JwtService;
  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(jwtService, usersService);
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
      }),
    );
    expect(response).toEqual({
      accessToken: 'signed-token',
      requiresApproval: true,
      user: baseUser,
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: baseUser.id,
      email: baseUser.email,
      role: baseUser.role,
    });
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

  it('creates Sugar Daddy registrations as approved with a session token', async () => {
    usersService.create.mockResolvedValue({
      ...baseUser,
      role: UserRole.SugarDaddy,
      gender: 'sugar-daddy',
      approvalStatus: 'APPROVED',
    });

    const response = await service.register({
      ...registerDto,
      profileType: 'sugar-daddy',
      lookingFor: 'sugar-baby-woman',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.SugarDaddy,
        approvalStatus: 'APPROVED',
      }),
    );
    expect(response).toMatchObject({
      accessToken: 'signed-token',
      user: expect.objectContaining({
        role: UserRole.SugarDaddy,
        approvalStatus: 'APPROVED',
      }),
    });
  });

  it('blocks pending Sugar Baby login', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...baseUser,
      passwordHash:
        '$2b$10$mSLptsyvzfZ4qL9xxTHlPu6ha7UM6BjNMJ9KD7jT6/lpjuYitTNqK',
    });

    await expect(
      service.login({
        identifier: 'maria@example.com',
        password: 'Senha@123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
