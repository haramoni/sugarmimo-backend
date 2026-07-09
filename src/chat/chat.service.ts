import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UserRole = {
  SugarDaddy: 'SUGAR_DADDY',
  SugarBaby: 'SUGAR_BABY',
} as const;

type UserSummary = {
  id: string;
  username: string;
  role: string | null;
  city: string | null;
  state: string | null;
  photos: Array<{
    id: string;
    dataUrl: string;
    sortOrder: number;
  }>;
};

type MessageSummary = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: Date | null;
  createdAt: Date | null;
};

type ConversationListItem = {
  id: string;
  memberOneId: string;
  memberTwoId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  memberOne: UserSummary;
  memberTwo: UserSummary;
  messages: MessageSummary[];
};

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        OR: [{ memberOneId: userId }, { memberTwoId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        memberOne: { select: this.userSummarySelect() },
        memberTwo: { select: this.userSummarySelect() },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: this.messageSelect(),
        },
      },
    });

    return conversations.map((conversation) =>
      this.serializeConversation(conversation, userId),
    );
  }

  async createOrFindConversation(userId: string, participantId: string) {
    if (userId === participantId) {
      throw new BadRequestException('Voce nao pode conversar consigo mesmo.');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: [userId, participantId] } },
      select: {
        id: true,
        role: true,
        approvalStatus: true,
      },
    });
    const currentUser = users.find((user) => user.id === userId);
    const participant = users.find((user) => user.id === participantId);

    if (!currentUser || !participant) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    if (
      currentUser.approvalStatus !== 'APPROVED' ||
      participant.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException('Apenas perfis aprovados podem conversar.');
    }

    const isDaddyAndBaby =
      [currentUser.role, participant.role].includes(UserRole.SugarDaddy) &&
      [currentUser.role, participant.role].includes(UserRole.SugarBaby);

    if (!isDaddyAndBaby) {
      throw new ForbiddenException(
        'O chat esta disponivel entre sugar daddies e sugar babies.',
      );
    }

    const [memberOneId, memberTwoId] = [userId, participantId].sort();

    const conversation = await this.prisma.chatConversation.upsert({
      where: {
        memberOneId_memberTwoId: {
          memberOneId,
          memberTwoId,
        },
      },
      create: {
        memberOneId,
        memberTwoId,
      },
      update: {},
      include: {
        memberOne: { select: this.userSummarySelect() },
        memberTwo: { select: this.userSummarySelect() },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: this.messageSelect(),
        },
      },
    });

    return this.serializeConversation(conversation, userId);
  }

  async listMessages(userId: string, conversationId: string) {
    await this.ensureParticipant(userId, conversationId);

    await this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: this.messageSelect(),
    });

    return messages;
  }

  async sendMessage(userId: string, conversationId: string, body: string) {
    await this.ensureParticipant(userId, conversationId);

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      throw new BadRequestException('A mensagem nao pode ficar vazia.');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: userId,
        body: trimmedBody,
      },
      select: this.messageSelect(),
    });

    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  private async ensureParticipant(userId: string, conversationId: string) {
    const conversation = await this.findConversationById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversa nao encontrada.');
    }

    if (
      conversation.memberOneId !== userId &&
      conversation.memberTwoId !== userId
    ) {
      throw new ForbiddenException('Voce nao participa desta conversa.');
    }

    return conversation;
  }

  private findConversationById(conversationId: string) {
    return this.prisma.chatConversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        memberOneId: true,
        memberTwoId: true,
      },
    });
  }

  private serializeConversation(
    conversation: ConversationListItem,
    userId: string,
  ) {
    const otherUser =
      conversation.memberOneId === userId
        ? conversation.memberTwo
        : conversation.memberOne;

    return {
      id: conversation.id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      otherUser,
      lastMessage: conversation.messages[0] ?? null,
    };
  }

  private userSummarySelect() {
    return {
      id: true,
      username: true,
      role: true,
      city: true,
      state: true,
      photos: {
        orderBy: { sortOrder: 'asc' as const },
        take: 1,
        select: {
          id: true,
          dataUrl: true,
          sortOrder: true,
        },
      },
    };
  }

  private messageSelect() {
    return {
      id: true,
      conversationId: true,
      senderId: true,
      body: true,
      readAt: true,
      createdAt: true,
    };
  }
}
