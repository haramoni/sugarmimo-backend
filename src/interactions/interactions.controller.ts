import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InteractionsService } from './interactions.service';

type AuthenticatedRequest = Request & {
  user: { id: string };
};

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post('likes/:babyId')
  likeProfile(
    @Req() request: AuthenticatedRequest,
    @Param('babyId') babyId: string,
  ) {
    return this.interactionsService.likeProfile(request.user.id, babyId);
  }

  @Post('releases/:daddyId')
  releaseContacts(
    @Req() request: AuthenticatedRequest,
    @Param('daddyId') daddyId: string,
  ) {
    return this.interactionsService.releaseContacts(request.user.id, daddyId);
  }

  @Post('baby-likes/:daddyId')
  likeDaddyAndReleaseContacts(
    @Req() request: AuthenticatedRequest,
    @Param('daddyId') daddyId: string,
  ) {
    return this.interactionsService.likeDaddyAndReleaseContacts(
      request.user.id,
      daddyId,
    );
  }

  @Get('notifications')
  notifications(@Req() request: AuthenticatedRequest) {
    return this.interactionsService.listNotifications(request.user.id);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.interactionsService.markNotificationRead(request.user.id, id);
  }
}
