import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { AdminGuard } from './admin.guard';
import { ChatService } from '../chat/chat.service';
import { ResolveReportDto } from '../chat/dto/resolve-report.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly chatService: ChatService,
  ) {}

  @Get('pending-babies')
  findPendingBabies(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '6',
  ) {
    return this.usersService.findPendingBabies(Number(page), Number(pageSize));
  }

  @Get('waiting-babies')
  findWaitingBabies(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '6',
  ) {
    return this.usersService.findWaitingBabies(Number(page), Number(pageSize));
  }

  @Get('premium-daddies')
  findSugarDaddies() {
    return this.usersService.findSugarDaddies();
  }

  @Get('featured-babies')
  findFeaturedBabies(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '12',
    @Query('search') search?: string,
  ) {
    return this.usersService.findBabiesForAdminFeaturing(
      Number(page),
      Number(pageSize),
      search,
    );
  }

  @Get('featured-babies/:id/photos')
  findFeaturedBabyPhotos(@Param('id') id: string) {
    return this.usersService.findBabyPhotosForAdmin(id);
  }

  @Get('activity-logs')
  findActivityLogs(@Query('limit') limit = '100') {
    return this.auditService.findLatest(Number(limit));
  }

  @Get('chat-reports')
  findChatReports(@Query('status') status?: string) {
    return this.chatService.listReports(status);
  }

  @Patch('chat-reports/:id/resolve')
  resolveChatReport(
    @Req() request: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.chatService.resolveReport(request.user.id, id, dto);
  }

  @Patch('profiles/:id/approve')
  approveProfile(@Param('id') id: string) {
    return this.usersService.updateApprovalStatus(id, 'APPROVED');
  }

  @Patch('profiles/:id/reject')
  rejectProfile(@Param('id') id: string) {
    return this.usersService.updateApprovalStatus(id, 'REJECTED');
  }

  @Patch('profiles/:id/wait')
  waitProfile(@Param('id') id: string) {
    return this.usersService.updateApprovalStatus(id, 'WAITING');
  }

  @Delete('profiles/:id/photos/:photoId')
  removePendingProfilePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
  ) {
    return this.usersService.removePendingProfilePhoto(id, photoId);
  }

  @Patch('profiles/:id/premium')
  enablePremium(@Param('id') id: string) {
    return this.usersService.updatePremiumStatus(id, true);
  }

  @Patch('profiles/:id/standard')
  disablePremium(@Param('id') id: string) {
    return this.usersService.updatePremiumStatus(id, false);
  }

  @Patch('profiles/:id/premiere')
  enablePremiere(@Param('id') id: string) {
    return this.usersService.updatePremiereStatus(id, true);
  }

  @Patch('profiles/:id/regular')
  disablePremiere(@Param('id') id: string) {
    return this.usersService.updatePremiereStatus(id, false);
  }

  @Patch('profiles/:id/feature')
  featureBaby(@Param('id') id: string) {
    return this.usersService.updateAdminFeaturedStatus(id, true);
  }

  @Patch('profiles/:id/unfeature')
  unfeatureBaby(@Param('id') id: string) {
    return this.usersService.updateAdminFeaturedStatus(id, false);
  }
}
