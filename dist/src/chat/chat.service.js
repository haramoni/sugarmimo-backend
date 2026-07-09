"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const UserRole = {
    SugarDaddy: 'SUGAR_DADDY',
    SugarBaby: 'SUGAR_BABY',
};
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listConversations(userId) {
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
        return conversations.map((conversation) => this.serializeConversation(conversation, userId));
    }
    async createOrFindConversation(userId, participantId) {
        if (userId === participantId) {
            throw new common_1.BadRequestException('Voce nao pode conversar consigo mesmo.');
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
            throw new common_1.NotFoundException('Usuario nao encontrado.');
        }
        if (currentUser.approvalStatus !== 'APPROVED' ||
            participant.approvalStatus !== 'APPROVED') {
            throw new common_1.ForbiddenException('Apenas perfis aprovados podem conversar.');
        }
        const isDaddyAndBaby = [currentUser.role, participant.role].includes(UserRole.SugarDaddy) &&
            [currentUser.role, participant.role].includes(UserRole.SugarBaby);
        if (!isDaddyAndBaby) {
            throw new common_1.ForbiddenException('O chat esta disponivel entre sugar daddies e sugar babies.');
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
    async listMessages(userId, conversationId) {
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
    async sendMessage(userId, conversationId, body) {
        await this.ensureParticipant(userId, conversationId);
        const trimmedBody = body.trim();
        if (!trimmedBody) {
            throw new common_1.BadRequestException('A mensagem nao pode ficar vazia.');
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
    async ensureParticipant(userId, conversationId) {
        const conversation = await this.findConversationById(conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversa nao encontrada.');
        }
        if (conversation.memberOneId !== userId &&
            conversation.memberTwoId !== userId) {
            throw new common_1.ForbiddenException('Voce nao participa desta conversa.');
        }
        return conversation;
    }
    findConversationById(conversationId) {
        return this.prisma.chatConversation.findUnique({
            where: { id: conversationId },
            select: {
                id: true,
                memberOneId: true,
                memberTwoId: true,
            },
        });
    }
    serializeConversation(conversation, userId) {
        const otherUser = conversation.memberOneId === userId
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
    userSummarySelect() {
        return {
            id: true,
            username: true,
            role: true,
            city: true,
            state: true,
            photos: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
                select: {
                    id: true,
                    dataUrl: true,
                    sortOrder: true,
                },
            },
        };
    }
    messageSelect() {
        return {
            id: true,
            conversationId: true,
            senderId: true,
            body: true,
            readAt: true,
            createdAt: true,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map