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
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
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
  @Get('matches')
  matches(@Req() request: AuthenticatedRequest, @Query('search') search = '') {
    return this.usersService.findMatchesForUser(request.user.id, search);
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
