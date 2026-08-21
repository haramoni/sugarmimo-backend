import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { getLoginThrottleTracker } from './login-throttle';
import { getRegistrationThrottleTracker } from './registration-throttle';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSearchLocationDto } from './dto/update-search-location.dto';
import { AcceptPrivacyPolicyDto } from './dto/accept-privacy-policy.dto';
import { CURRENT_PRIVACY_POLICY_VERSION } from './privacy-policy';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    role?: string | null;
  };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60 * 60_000,
      getTracker: getRegistrationThrottleTracker,
    },
  })
  @HttpCode(200)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({
    default: {
      limit: 10,
      ttl: 15 * 60_000,
      getTracker: getLoginThrottleTracker,
    },
  })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @Throttle({
    default: {
      limit: 3,
      ttl: 60 * 60_000,
      getTracker: getLoginThrottleTracker,
    },
  })
  @HttpCode(200)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Get('availability')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  availability(@Query('username') username = '', @Query('email') email = '') {
    return this.usersService.checkAvailability(username, email);
  }

  @Post('/admin/login')
  @Throttle({
    default: {
      limit: 5,
      ttl: 15 * 60_000,
      getTracker: getLoginThrottleTracker,
    },
  })
  @HttpCode(200)
  adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.usersService.findById(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  @HttpCode(200)
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      request.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('presence')
  @HttpCode(200)
  presence(@Req() request: AuthenticatedRequest) {
    return this.usersService.touchPresence(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('privacy-policy/accept')
  @HttpCode(200)
  acceptPrivacyPolicy(
    @Req() request: AuthenticatedRequest,
    @Body() acceptance: AcceptPrivacyPolicyDto,
  ) {
    if (acceptance.version !== CURRENT_PRIVACY_POLICY_VERSION) {
      throw new BadRequestException(
        'A versao informada nao corresponde a Politica de Privacidade atual.',
      );
    }

    return this.usersService.acceptPrivacyPolicy(
      request.user.id,
      CURRENT_PRIVACY_POLICY_VERSION,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('search-location')
  @Throttle({ default: { limit: 12, ttl: 60 * 60_000 } })
  updateSearchLocation(
    @Req() request: AuthenticatedRequest,
    @Body() location: UpdateSearchLocationDto,
  ) {
    return this.usersService.updateSearchLocation(
      request.user.id,
      location.latitude,
      location.longitude,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('boosts')
  boosts(
    @Req() request: AuthenticatedRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '6',
  ) {
    return this.usersService.findBoostedProfilesForUser(
      request.user.id,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches')
  matches(
    @Req() request: AuthenticatedRequest,
    @Query('search') search = '',
    @Query('page') page = '1',
    @Query('limit') limit = '9',
    @Query('minAge') minAge = '',
    @Query('maxAge') maxAge = '',
    @Query('gender') gender = '',
    @Query('latitude') latitude = '',
    @Query('longitude') longitude = '',
    @Query('relationshipMode') relationshipMode = '',
  ) {
    return this.usersService.findMatchesForUser(
      request.user.id,
      search,
      Number(page),
      Number(limit),
      minAge ? Number(minAge) : undefined,
      maxAge ? Number(maxAge) : undefined,
      gender,
      latitude ? Number(latitude) : undefined,
      longitude ? Number(longitude) : undefined,
      relationshipMode,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('match-photos/:photoId')
  async matchPhoto(
    @Req() request: AuthenticatedRequest,
    @Param('photoId') photoId: string,
    @Query('variant') variant: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const photo = await this.usersService.findMatchPhotoForUser(
      request.user.id,
      photoId,
      variant,
    );

    if (!photo) {
      throw new NotFoundException('Foto nao encontrada.');
    }

    const match =
      typeof photo.dataUrl === 'string'
        ? photo.dataUrl.match(/^data:([^;]+);base64,(.+)$/s)
        : null;

    if (!match) {
      throw new NotFoundException('Foto nao encontrada.');
    }

    const buffer = Buffer.from(match[2], 'base64');
    const contentType =
      photo.mimeType || match[1] || 'application/octet-stream';

    response.setHeader(
      'Cache-Control',
      variant === 'card'
        ? 'private, max-age=31536000, immutable'
        : 'private, max-age=3600',
    );
    response.setHeader('ETag', `"${photo.id}-${variant ?? 'original'}"`);

    return new StreamableFile(buffer, {
      type: contentType,
      length: buffer.byteLength,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('contact-viewers')
  contactViewers(
    @Req() request: AuthenticatedRequest,
    @Query('search') search = '',
  ) {
    return this.usersService.findActiveDaddySuggestions(
      request.user.id,
      search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('private-photo-viewers')
  privatePhotoViewers(
    @Req() request: AuthenticatedRequest,
    @Query('search') search = '',
  ) {
    return this.usersService.findPrivatePhotoViewerSuggestions(
      request.user.id,
      search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches/:identifier')
  async matchProfile(
    @Req() request: AuthenticatedRequest,
    @Param('identifier') identifier: string,
  ) {
    const profile = await this.usersService.findMatchProfileForUser(
      request.user.id,
      identifier,
    );

    if (!profile) {
      throw new NotFoundException('Perfil nao encontrado.');
    }

    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(request.user.id, updateProfileDto);
  }
}
