import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Get('pending-babies')
  findPendingBabies() {
    return this.usersService.findPendingBabies();
  }

  @Get('activity-logs')
  findActivityLogs(@Query('limit') limit = '100') {
    return this.auditService.findLatest(Number(limit));
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
