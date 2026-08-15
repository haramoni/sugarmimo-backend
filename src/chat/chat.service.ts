import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ChatCryptoService } from './chat-crypto.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

const RETENTION_DAYS = 60;
const MESSAGE_PAGE_SIZE = 40;
const DADDY_FREE_MESSAGE_LIMIT = 10;

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: ChatCryptoService,
  ) {}

  async listConversations(userId: string) {
    await this.ensureMutualLikeConversations(userId);

    const conversations = await this.prisma.chatConversation.findMany({
      where: { OR: [{ memberOneId: userId }, { memberTwoId: userId }] },
      orderBy: { updatedAt: 'desc' },
      include: {
        memberOne: { select: this.publicMemberSelect() },
        memberTwo: { select: this.publicMemberSelect() },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const blocks = await this.prisma.userBlock.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });
    const blockedUserIds = new Set(
      blocks.map((block) =>
        block.blockerId === userId ? block.blockedId : block.blockerId,
      ),
    );

    return Promise.all(
      conversations.map(async (conversation) => {
        const other =
          conversation.memberOneId === userId
            ? conversation.memberTwo
            : conversation.memberOne;
        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            readAt: null,
          },
        });
        const lastMessage = conversation.messages[0];

        return {
          id: conversation.id,
          otherMember: this.serializeMember(other),
          lastMessage: lastMessage
            ? {
                ...this.serializeMessage(lastMessage),
                body: this.crypto.decrypt(lastMessage.body),
              }
            : null,
          unreadCount,
          blocked: blockedUserIds.has(other.id),
          updatedAt: conversation.updatedAt,
        };
      }),
    );
  }

  async openConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestException('Conversa inválida.');
    }

    const { currentUser } = await this.assertCanChat(userId, otherUserId);
    this.assertCanSendMessage(currentUser);
    const [memberOneId, memberTwoId] = [userId, otherUserId].sort();
    const conversation = await this.prisma.chatConversation.upsert({
      where: { memberOneId_memberTwoId: { memberOneId, memberTwoId } },
      update: {},
      create: { memberOneId, memberTwoId },
    });

    return { id: conversation.id };
  }

  async getMessages(userId: string, conversationId: string, cursor?: string) {
    await this.assertConversationMember(userId, conversationId);
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: MESSAGE_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = messages.length > MESSAGE_PAGE_SIZE;
    const page = messages.slice(0, MESSAGE_PAGE_SIZE);

    return {
      items: page
        .map((message) => ({
          ...this.serializeMessage(message),
          body: this.crypto.decrypt(message.body),
        }))
        .reverse(),
      nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
      retentionDays: RETENTION_DAYS,
    };
  }

  async sendMessage(userId: string, conversationId: string, body: string) {
    const conversation = await this.assertConversationMember(
      userId,
      conversationId,
    );
    const otherUserId =
      conversation.memberOneId === userId
        ? conversation.memberTwoId
        : conversation.memberOneId;
    const { currentUser } = await this.assertCanChat(userId, otherUserId);
    this.assertCanSendMessage(currentUser);

    const normalizedBody = body.trim();
    if (!normalizedBody) {
      throw new BadRequestException('Digite uma mensagem.');
    }

    const usesFreeTrial = this.usesFreeMessageTrial(currentUser);
    const result = await this.prisma.$transaction(async (tx) => {
      if (usesFreeTrial) {
        const quota = await tx.user.updateMany({
          where: {
            id: userId,
            freeMessagesUsed: { lt: DADDY_FREE_MESSAGE_LIMIT },
          },
          data: { freeMessagesUsed: { increment: 1 } },
        });

        if (quota.count === 0) {
          throw new ForbiddenException(
            'Você já enviou suas 10 mensagens gratuitas. Faça um upgrade para Premium ou Premiere para continuar conversando.',
          );
        }
      }

      const created = await tx.chatMessage.create({
        data: {
          conversationId,
          senderId: userId,
          body: this.crypto.encrypt(normalizedBody),
        },
      });
      await tx.chatConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      const trialState = usesFreeTrial
        ? await tx.user.findUnique({
            where: { id: userId },
            select: { freeMessagesUsed: true },
          })
        : null;
      return { created, trialState };
    });

    return {
      message: {
        ...this.serializeMessage(result.created),
        body: normalizedBody,
      },
      recipientId: otherUserId,
      freeMessagesRemaining: result.trialState
        ? Math.max(
            0,
            DADDY_FREE_MESSAGE_LIMIT - result.trialState.freeMessagesUsed,
          )
        : null,
    };
  }

  async getMessageAccess(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        isPremium: true,
        isPremiere: true,
        freeMessagesUsed: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    const isTrial = this.usesFreeMessageTrial(user);
    const freeMessagesRemaining = isTrial
      ? Math.max(0, DADDY_FREE_MESSAGE_LIMIT - user.freeMessagesUsed)
      : null;

    return {
      canSend: !isTrial || Boolean(freeMessagesRemaining),
      isTrial,
      freeMessagesLimit: isTrial ? DADDY_FREE_MESSAGE_LIMIT : null,
      freeMessagesUsed: isTrial ? user.freeMessagesUsed : null,
      freeMessagesRemaining,
      requiresUpgrade: isTrial && freeMessagesRemaining === 0,
    };
  }

  async markRead(userId: string, conversationId: string) {
    const conversation = await this.assertConversationMember(
      userId,
      conversationId,
    );
    const readAt = new Date();
    await this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt },
    });

    return {
      success: true,
      readAt,
      otherUserId:
        conversation.memberOneId === userId
          ? conversation.memberTwoId
          : conversation.memberOneId,
    };
  }

  async blockConversation(userId: string, conversationId: string) {
    const conversation = await this.assertConversationMember(
      userId,
      conversationId,
    );
    const blockedId =
      conversation.memberOneId === userId
        ? conversation.memberTwoId
        : conversation.memberOneId;
    await this.prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: userId, blockedId } },
      update: {},
      create: { blockerId: userId, blockedId },
    });

    return { success: true, blockedId };
  }

  async createReport(
    userId: string,
    conversationId: string,
    dto: CreateReportDto,
  ) {
    const conversation = await this.assertConversationMember(
      userId,
      conversationId,
    );
    const reportedId =
      conversation.memberOneId === userId
        ? conversation.memberTwoId
        : conversation.memberOneId;
    const uniqueMessageIds = [...new Set(dto.messageIds)];
    const validMessages = uniqueMessageIds.length
      ? await this.prisma.chatMessage.findMany({
          where: {
            id: { in: uniqueMessageIds },
            conversationId,
            createdAt: { gte: this.retentionCutoff() },
          },
          select: { id: true, createdAt: true },
        })
      : [];

    if (validMessages.length !== uniqueMessageIds.length) {
      throw new BadRequestException(
        'Uma ou mais mensagens não estão disponíveis para denúncia.',
      );
    }

    let evidenceMessages = validMessages;
    const evidenceDates = validMessages
      .map(({ createdAt }) => createdAt?.getTime())
      .filter((value): value is number => typeof value === 'number');
    if (evidenceDates.length) {
      const contextWindowMs = 10 * 60 * 1000;
      evidenceMessages = await this.prisma.chatMessage.findMany({
        where: {
          conversationId,
          createdAt: {
            gte: new Date(Math.min(...evidenceDates) - contextWindowMs),
            lte: new Date(Math.max(...evidenceDates) + contextWindowMs),
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 30,
        select: { id: true, createdAt: true },
      });
    }

    const report = await this.prisma.$transaction(async (tx) => {
      const created = await tx.chatReport.create({
        data: {
          conversationId,
          reporterId: userId,
          reportedId,
          category: dto.category,
          details: dto.details?.trim() || null,
          messages: evidenceMessages.length
            ? { create: evidenceMessages.map(({ id }) => ({ messageId: id })) }
            : undefined,
        },
      });
      if (dto.blockUser) {
        await tx.userBlock.upsert({
          where: {
            blockerId_blockedId: { blockerId: userId, blockedId: reportedId },
          },
          update: {},
          create: { blockerId: userId, blockedId: reportedId },
        });
      }
      return created;
    });

    return { id: report.id, status: report.status };
  }

  async listReports(status?: string) {
    const normalizedStatus = status?.trim().toUpperCase();
    const reports = await this.prisma.chatReport.findMany({
      where:
        normalizedStatus && normalizedStatus !== 'ALL'
          ? { status: normalizedStatus }
          : undefined,
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      take: 200,
      include: {
        reporter: { select: { id: true, username: true, role: true } },
        reported: {
          select: {
            id: true,
            username: true,
            role: true,
            approvalStatus: true,
            accountStatus: true,
            suspendedUntil: true,
          },
        },
        reviewedBy: { select: { id: true, username: true } },
        messages: {
          include: {
            message: {
              select: {
                id: true,
                senderId: true,
                body: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    return reports.map((report) => ({
      ...report,
      evidenceExpiresAt: new Date(
        Math.min(
          ...report.messages
            .map(({ message }) => message.createdAt?.getTime())
            .filter((value): value is number => typeof value === 'number'),
          report.createdAt?.getTime() ?? Date.now(),
        ) +
          RETENTION_DAYS * 24 * 60 * 60 * 1000,
      ),
      messages: report.messages.map(({ message }) => ({
        ...message,
        body: this.crypto.decrypt(message.body),
      })),
    }));
  }

  async resolveReport(
    adminId: string,
    reportId: string,
    dto: ResolveReportDto,
  ) {
    const report = await this.prisma.chatReport.findUnique({
      where: { id: reportId },
      select: { id: true, reportedId: true },
    });
    if (!report) {
      throw new NotFoundException('Denúncia não encontrada.');
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.chatReport.update({
        where: { id: reportId },
        data: {
          status: dto.action,
          resolution: dto.resolution.trim(),
          reviewedById: adminId,
          reviewedAt: now,
        },
      });

      if (dto.action === 'SUSPENDED') {
        const days = Math.min(Math.max(dto.suspensionDays ?? 7, 1), 365);
        await tx.user.update({
          where: { id: report.reportedId },
          data: {
            accountStatus: 'SUSPENDED',
            suspendedUntil: new Date(now.getTime() + days * 86_400_000),
          },
        });
      } else if (dto.action === 'BANNED') {
        await tx.user.update({
          where: { id: report.reportedId },
          data: {
            accountStatus: 'BANNED',
            suspendedUntil: null,
            approvalStatus: 'REJECTED',
          },
        });
      }
    });

    return { success: true };
  }

  async assertConversationMember(userId: string, conversationId: string) {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ memberOneId: userId }, { memberTwoId: userId }],
      },
    });
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }
    return conversation;
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async deleteExpiredMessages() {
    const result = await this.prisma.chatMessage.deleteMany({
      where: { createdAt: { lt: this.retentionCutoff() } },
    });
    return { deletedCount: result.count };
  }

  private async ensureMutualLikeConversations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isPremium: true, isPremiere: true },
    });
    if (
      !user ||
      (user.role === 'SUGAR_DADDY' && !user.isPremium && !user.isPremiere)
    ) {
      return;
    }

    const likes = await this.prisma.profileLike.findMany({
      where: {
        daddyLikedAt: { not: null },
        babyLikedAt: { not: null },
        ...(user.role === 'SUGAR_DADDY'
          ? { daddyId: userId }
          : { babyId: userId }),
      },
      select: { daddyId: true, babyId: true },
    });
    if (!likes.length) {
      return;
    }

    await this.prisma.$transaction(
      likes.map(({ daddyId, babyId }) => {
        const [memberOneId, memberTwoId] = [daddyId, babyId].sort();
        return this.prisma.chatConversation.upsert({
          where: { memberOneId_memberTwoId: { memberOneId, memberTwoId } },
          update: {},
          create: { memberOneId, memberTwoId },
        });
      }),
    );
  }

  private async assertCanChat(userId: string, otherUserId: string) {
    const [currentUser, otherUser, block] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          approvalStatus: true,
          isPremium: true,
          isPremiere: true,
          freeMessagesUsed: true,
          accountStatus: true,
          suspendedUntil: true,
        },
      }),
      this.prisma.user.findUnique({
        where: { id: otherUserId },
        select: {
          role: true,
          approvalStatus: true,
          isPremium: true,
          isPremiere: true,
          freeMessagesUsed: true,
          accountStatus: true,
          suspendedUntil: true,
        },
      }),
      this.prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: otherUserId },
            { blockerId: otherUserId, blockedId: userId },
          ],
        },
      }),
    ]);
    if (!currentUser || !otherUser) {
      throw new NotFoundException('Perfil não encontrado.');
    }
    if (block) {
      throw new ForbiddenException('Esta conversa está bloqueada.');
    }
    const now = new Date();
    const unavailable = [currentUser, otherUser].some(
      (user) =>
        user.approvalStatus !== 'APPROVED' ||
        user.accountStatus === 'BANNED' ||
        (user.accountStatus === 'SUSPENDED' &&
          (!user.suspendedUntil || user.suspendedUntil > now)),
    );
    if (unavailable) {
      throw new ForbiddenException('Um dos perfis não está disponível.');
    }
    const roles = new Set([currentUser.role, otherUser.role]);
    if (!roles.has('SUGAR_DADDY') || !roles.has('SUGAR_BABY')) {
      throw new ForbiddenException(
        'As conversas são permitidas apenas entre Sugar Babies e Sugar Daddies.',
      );
    }

    return { currentUser, otherUser };
  }

  private assertCanSendMessage(user: {
    role: string | null;
    isPremium: boolean;
    isPremiere: boolean;
    freeMessagesUsed: number;
  }) {
    if (
      this.usesFreeMessageTrial(user) &&
      user.freeMessagesUsed >= DADDY_FREE_MESSAGE_LIMIT
    ) {
      throw new ForbiddenException(
        'Você já enviou suas 10 mensagens gratuitas. Faça um upgrade para Premium ou Premiere para continuar conversando.',
      );
    }
  }

  private usesFreeMessageTrial(user: {
    role: string | null;
    isPremium: boolean;
    isPremiere: boolean;
  }) {
    return user.role === 'SUGAR_DADDY' && !user.isPremium && !user.isPremiere;
  }

  private retentionCutoff() {
    return new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  }

  private publicMemberSelect() {
    return {
      id: true,
      username: true,
      role: true,
      lastActiveAt: true,
      photos: {
        where: { isPrivate: false },
        orderBy: { sortOrder: 'asc' as const },
        take: 1,
        select: { id: true, dataUrl: true, sortOrder: true },
      },
    };
  }

  private serializeMember(member: {
    id: string;
    username: string;
    role: string | null;
    lastActiveAt: Date | null;
    photos: Array<{ id: string; dataUrl: string; sortOrder: number }>;
  }) {
    return member;
  }

  private serializeMessage(message: {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    readAt: Date | null;
    createdAt: Date | null;
  }) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      readAt: message.readAt,
      createdAt: message.createdAt,
    };
  }
}
