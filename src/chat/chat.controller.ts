import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    role?: string | null;
  };
};

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  listConversations(@Req() request: AuthenticatedRequest) {
    return this.chatService.listConversations(request.user.id);
  }

  @Post('conversations')
  createConversation(
    @Req() request: AuthenticatedRequest,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.createOrFindConversation(
      request.user.id,
      createConversationDto.participantId,
    );
  }

  @Get('conversations/:conversationId/messages')
  listMessages(
    @Req() request: AuthenticatedRequest,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.listMessages(request.user.id, conversationId);
  }

  @Post('conversations/:conversationId/messages')
  sendMessage(
    @Req() request: AuthenticatedRequest,
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      request.user.id,
      conversationId,
      sendMessageDto.body,
    );
  }
}
