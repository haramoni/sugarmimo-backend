import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { CreateReportDto } from './dto/create-report.dto';
import { SendMessageDto } from './dto/send-message.dto';

type AuthenticatedRequest = Request & {
  user: { id: string; email: string; role?: string | null };
};

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly jwtService: JwtService,
  ) {}

  @Get('conversations')
  listConversations(@Req() request: AuthenticatedRequest) {
    return this.chatService.listConversations(request.user.id);
  }

  @Post('conversations/with/:userId')
  openConversation(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return this.chatService.openConversation(request.user.id, userId);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Req() request: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.getMessages(
      request.user.id,
      conversationId,
      cursor,
    );
  }

  @Post('conversations/:id/messages')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async sendMessage(
    @Req() request: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const result = await this.chatService.sendMessage(
      request.user.id,
      conversationId,
      dto.body,
    );
    this.chatGateway.emitNewMessage(
      conversationId,
      result.recipientId,
      result.message,
    );
    return result.message;
  }

  @Patch('conversations/:id/read')
  async markRead(
    @Req() request: AuthenticatedRequest,
    @Param('id') conversationId: string,
  ) {
    const result = await this.chatService.markRead(
      request.user.id,
      conversationId,
    );
    this.chatGateway.emitRead(
      conversationId,
      result.otherUserId,
      result.readAt,
      request.user.id,
    );
    return { success: true, readAt: result.readAt };
  }

  @Post('conversations/:id/block')
  async blockConversation(
    @Req() request: AuthenticatedRequest,
    @Param('id') conversationId: string,
  ) {
    const result = await this.chatService.blockConversation(
      request.user.id,
      conversationId,
    );
    this.chatGateway.emitBlocked(
      conversationId,
      result.blockedId,
      request.user.id,
    );
    return { success: true };
  }

  @Post('conversations/:id/reports')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  async createReport(
    @Req() request: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Body() dto: CreateReportDto,
  ) {
    const result = await this.chatService.createReport(
      request.user.id,
      conversationId,
      dto,
    );
    if (dto.blockUser) {
      const conversation = await this.chatService.assertConversationMember(
        request.user.id,
        conversationId,
      );
      const blockedId =
        conversation.memberOneId === request.user.id
          ? conversation.memberTwoId
          : conversation.memberOneId;
      this.chatGateway.emitBlocked(conversationId, blockedId, request.user.id);
    }
    return result;
  }

  @Post('socket-ticket')
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  createSocketTicket(@Req() request: AuthenticatedRequest) {
    return {
      token: this.jwtService.sign(
        { sub: request.user.id, scope: 'chat_socket' },
        { expiresIn: '2m' },
      ),
    };
  }
}
