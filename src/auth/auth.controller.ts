import {
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
  @Throttle({ default: { limit: 5, ttl: 60 * 60_000 } })
  @HttpCode(200)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 15 * 60_000 } })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('availability')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  availability(@Query('username') username = '', @Query('email') email = '') {
    return this.usersService.checkAvailability(username, email);
  }

  @Post('/admin/login')
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
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
  @Post('presence')
  @HttpCode(200)
  presence(@Req() request: AuthenticatedRequest) {
    return this.usersService.touchPresence(request.user.id);
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
  ) {
    return this.usersService.findMatchesForUser(
      request.user.id,
      search,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('match-photos/:photoId')
  async matchPhoto(
    @Req() request: AuthenticatedRequest,
    @Param('photoId') photoId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const photo = await this.usersService.findMatchPhotoForUser(
      request.user.id,
      photoId,
    );

    if (!photo) {
      throw new NotFoundException('Foto nao encontrada.');
    }

    const match = photo.dataUrl.match(/^data:([^;]+);base64,(.+)$/s);

    if (!match) {
      throw new NotFoundException('Foto nao encontrada.');
    }

    const buffer = Buffer.from(match[2], 'base64');
    response.setHeader('Cache-Control', 'private, max-age=3600, immutable');

    return new StreamableFile(buffer, {
      type: photo.mimeType || match[1] || 'application/octet-stream',
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
