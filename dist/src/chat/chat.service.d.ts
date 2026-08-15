import { PrismaService } from '../prisma/prisma.service';
import { ChatCryptoService } from './chat-crypto.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
export declare class ChatService {
    private readonly prisma;
    private readonly crypto;
    constructor(prisma: PrismaService, crypto: ChatCryptoService);
    listConversations(userId: string): Promise<{
        id: string;
        otherMember: {
            id: string;
            username: string;
            role: string | null;
            lastActiveAt: Date | null;
            photos: Array<{
                id: string;
                dataUrl: string;
                sortOrder: number;
            }>;
        };
        lastMessage: {
            body: string;
            id: string;
            conversationId: string;
            senderId: string;
            readAt: Date | null;
            createdAt: Date | null;
        } | null;
        unreadCount: number;
        blocked: boolean;
        updatedAt: Date | null;
    }[]>;
    openConversation(userId: string, otherUserId: string): Promise<{
        id: string;
    }>;
    getMessages(userId: string, conversationId: string, cursor?: string): Promise<{
        items: {
            body: string;
            id: string;
            conversationId: string;
            senderId: string;
            readAt: Date | null;
            createdAt: Date | null;
        }[];
        nextCursor: string | null;
        retentionDays: number;
    }>;
    sendMessage(userId: string, conversationId: string, body: string): Promise<{
        message: {
            body: string;
            id: string;
            conversationId: string;
            senderId: string;
            readAt: Date | null;
            createdAt: Date | null;
        };
        recipientId: string;
        freeMessagesRemaining: number | null;
    }>;
    getMessageAccess(userId: string): Promise<{
        canSend: boolean;
        isTrial: boolean;
        freeMessagesLimit: number | null;
        freeMessagesUsed: number | null;
        freeMessagesRemaining: number | null;
        requiresUpgrade: boolean;
    }>;
    markRead(userId: string, conversationId: string): Promise<{
        success: boolean;
        readAt: Date;
        otherUserId: string;
    }>;
    blockConversation(userId: string, conversationId: string): Promise<{
        success: boolean;
        blockedId: string;
    }>;
    createReport(userId: string, conversationId: string, dto: CreateReportDto): Promise<{
        id: string;
        status: string;
    }>;
    listReports(status?: string): Promise<{
        evidenceExpiresAt: Date;
        messages: {
            body: string;
            id: string;
            createdAt: Date | null;
            senderId: string;
        }[];
        reporter: {
            id: string;
            username: string;
            role: string | null;
        };
        reported: {
            id: string;
            username: string;
            role: string | null;
            approvalStatus: string;
            accountStatus: string;
            suspendedUntil: Date | null;
        };
        reviewedBy: {
            id: string;
            username: string;
        } | null;
        id: string;
        reviewedAt: Date | null;
        createdAt: Date | null;
        category: string;
        details: string | null;
        resolution: string | null;
        conversationId: string;
        status: string;
        reporterId: string;
        reportedId: string;
        reviewedById: string | null;
    }[]>;
    resolveReport(adminId: string, reportId: string, dto: ResolveReportDto): Promise<{
        success: boolean;
    }>;
    assertConversationMember(userId: string, conversationId: string): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        memberOneId: string;
        memberTwoId: string;
    }>;
    deleteExpiredMessages(): Promise<{
        deletedCount: number;
    }>;
    private ensureMutualLikeConversations;
    private assertCanChat;
    private assertCanSendMessage;
    private usesFreeMessageTrial;
    private retentionCutoff;
    private publicMemberSelect;
    private serializeMember;
    private serializeMessage;
}
