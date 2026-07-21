import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { validateProfilePhotos } from '../users/profile-photo.validation';

export const UserRole = {
  SugarDaddy: 'SUGAR_DADDY',
  SugarBaby: 'SUGAR_BABY',
  Admin: 'ADMIN',
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (!/^[A-Za-z0-9._-]{2,50}$/.test(registerDto.username)) {
      throw new BadRequestException(
        'O nome de usuario deve conter apenas letras, numeros, ponto, hifen ou sublinhado.',
      );
    }

    const lookingFor = registerDto.lookingFor ?? registerDto.interest;
    const role = this.resolveRole(registerDto.profileType ?? registerDto.role);

    if (!role) {
      throw new BadRequestException('Tipo de perfil invalido.');
    }

    if (role === UserRole.SugarDaddy) {
      throw new BadRequestException(
        'O cadastro de Sugar Daddies e Sugar Mommies esta temporariamente indisponivel.',
      );
    }

    if (registerDto.termsAccepted !== true) {
      throw new BadRequestException('E necessario aceitar os termos de uso.');
    }

    this.validateAdultBirthDate(registerDto.birthDate);

    const photos = registerDto.profilePhotos ?? [];
    if (role === UserRole.SugarBaby && photos.length === 0) {
      throw new BadRequestException(
        'Sugar Babies precisam enviar pelo menos uma foto.',
      );
    }
    validateProfilePhotos(photos);

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const approvalStatus = this.getInitialApprovalStatus(role);

    const user = await this.usersService.create({
      username: registerDto.username.toLowerCase(),
      email: registerDto.email.toLowerCase(),
      passwordHash,
      role,
      gender: registerDto.profileType,
      lookingFor,
      birthDate: registerDto.birthDate
        ? new Date(`${registerDto.birthDate}T00:00:00.000Z`)
        : undefined,
      country: registerDto.country,
      state: registerDto.state,
      city: registerDto.city,
      whatsapp: registerDto.whatsapp,
      telegram: registerDto.telegram,
      instagram: registerDto.instagram,
      appearance: {
        bodyType: registerDto.bodyType,
        ethnicity: registerDto.ethnicity,
        hairColor: registerDto.hairColor,
        eyeColor: registerDto.eyeColor,
        heightCm: registerDto.heightCm,
      },
      preferences: {
        source: registerDto.source,
        termsAccepted: registerDto.termsAccepted,
        smoke: registerDto.smoke,
        drink: registerDto.drink,
        relationship: registerDto.relationship,
        children: registerDto.children,
        education: registerDto.education,
        occupation: registerDto.occupation,
        visibleContactChannels: registerDto.visibleContactChannels,
      },
      approvalStatus,
      photos: photos.map((photo, index) => ({
        dataUrl: photo.dataUrl,
        fileName: photo.fileName,
        mimeType: photo.mimeType,
        sortOrder: index + 1,
      })),
    });

    if (approvalStatus === 'PENDING') {
      return {
        requiresApproval: true,
        user,
      };
    }

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const identifier = (
      loginDto.identifier ??
      loginDto.email ??
      loginDto.username
    )?.toLowerCase();

    if (!identifier) {
      throw new BadRequestException('Email or username is required');
    }

    if (!loginDto.password) {
      throw new BadRequestException('Password is required');
    }

    const user = identifier.includes('@')
      ? await this.usersService.findByEmail(identifier)
      : await this.usersService.findByUsername(identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      this.normalizeRole(user.role) === UserRole.SugarBaby &&
      this.normalizeApprovalStatus(user.approvalStatus) !== 'APPROVED'
    ) {
      throw new UnauthorizedException('Profile is pending manual approval');
    }

    return this.buildAuthResponse({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      gender: user.gender,
      lookingFor: user.lookingFor,
      birthDate: user.birthDate,
      country: user.country,
      state: user.state,
      city: user.city,
      whatsapp: user.whatsapp,
      telegram: user.telegram,
      instagram: user.instagram,
      approvalStatus: user.approvalStatus,
      isPremium: user.isPremium,
      reviewedAt: user.reviewedAt,
      createdAt: user.createdAt,
    });
  }

  async adminLogin(loginDto: LoginDto) {
    const authResponse = await this.login(loginDto);

    if (authResponse.user.role !== UserRole.Admin) {
      throw new UnauthorizedException('Admin access required');
    }

    return authResponse;
  }

  private buildAuthResponse(user: {
    id: string;
    username: string;
    email: string;
    role: string | null;
    gender: string | null;
    lookingFor: string | null;
    birthDate: Date | null;
    country: string | null;
    state: string | null;
    city: string | null;
    whatsapp: string | null;
    telegram: string | null;
    instagram: string | null;
    approvalStatus: string;
    isPremium: boolean;
    reviewedAt: Date | null;
    createdAt: Date | null;
  }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    });

    return {
      accessToken,
      user,
    };
  }

  private getInitialApprovalStatus(role: UserRole) {
    return role === UserRole.SugarBaby ? 'PENDING' : 'APPROVED';
  }

  private normalizeRole(role?: string | null) {
    return role?.trim().toUpperCase();
  }

  private normalizeApprovalStatus(approvalStatus?: string | null) {
    return approvalStatus?.trim().toUpperCase();
  }

  private resolveRole(answer?: string | null): UserRole | undefined {
    if (!answer) {
      return undefined;
    }

    const normalizedAnswer = answer
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, '-');

    if (
      [
        'sugar-daddy',
        'sugardaddy',
        'sugar-mommy',
        'sugarmommy',
        'daddy',
        'mommy',
      ].includes(normalizedAnswer)
    ) {
      return UserRole.SugarDaddy;
    }

    if (
      [
        'sugar-baby',
        'sugarbaby',
        'sugar-baby-woman',
        'sugar-baby-man',
        'baby',
      ].includes(normalizedAnswer)
    ) {
      return UserRole.SugarBaby;
    }

    return undefined;
  }

  private validateAdultBirthDate(birthDate?: string) {
    if (!birthDate) {
      throw new BadRequestException('Data de nascimento obrigatoria.');
    }

    const parsedBirthDate = new Date(`${birthDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      throw new BadRequestException('Data de nascimento invalida.');
    }

    const today = new Date();
    const adultThreshold = new Date(
      Date.UTC(
        today.getUTCFullYear() - 18,
        today.getUTCMonth(),
        today.getUTCDate(),
      ),
    );

    if (parsedBirthDate > adultThreshold) {
      throw new BadRequestException('E necessario ter pelo menos 18 anos.');
    }
  }
}
