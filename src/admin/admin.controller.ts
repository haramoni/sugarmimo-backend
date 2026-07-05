import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('pending-babies')
  findPendingBabies() {
    return this.usersService.findPendingBabies();
  }

  @Patch('profiles/:id/approve')
  approveProfile(@Param('id') id: string) {
    return this.usersService.updateApprovalStatus(id, 'APPROVED');
  }

  @Patch('profiles/:id/reject')
  rejectProfile(@Param('id') id: string) {
    return this.usersService.updateApprovalStatus(id, 'REJECTED');
  }
}
