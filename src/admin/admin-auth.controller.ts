import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';

@Controller('admin')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }
}
