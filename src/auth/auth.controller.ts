import {
  Body,
  Controller,
  GoneException,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
  @HttpCode(200)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('availability')
  availability(
    @Query('username') username = '',
    @Query('email') email = '',
  ) {
    return this.usersService.checkAvailability(username, email);
  }

  @Post('/admin/login')
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
  @Get('matches')
  matches() {
    throw new GoneException('A busca de perfis esta desativada nesta versao.');
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches/:identifier')
  matchProfile() {
    throw new GoneException('Perfis publicos estao desativados nesta versao.');
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
