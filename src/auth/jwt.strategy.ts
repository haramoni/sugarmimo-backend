import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export type JwtPayload = {
  sub: string;
  email: string;
  role?: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.getOrThrow<string>('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findAuthStateById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Sessao invalida.');
    }

    if (
      user.role?.trim().toUpperCase() === 'SUGAR_BABY' &&
      user.approvalStatus?.trim().toUpperCase() !== 'APPROVED'
    ) {
      throw new UnauthorizedException('Perfil ainda nao aprovado.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
