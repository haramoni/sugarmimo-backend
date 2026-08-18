import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { CreateReportDto } from './dto/create-report.dto';
import { SendMessageDto } from './dto/send-message.dto';
type AuthenticatedRequest = Request & {
    user: {
        id: string;
        email: string;
        role?: string | null;
    };
};
export declare class ChatController {
    private readonly chatService;
    private readonly chatGateway;
    private readonly jwtService;
    constructor(chatService: ChatService, chatGateway: ChatGateway, jwtService: JwtService);
    listConversations(request: AuthenticatedRequest): Promise<{
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
    getUnreadCount(request: AuthenticatedRequest): Promise<{
        unreadCount: number;
    }>;
    getMessageAccess(request: AuthenticatedRequest): Promise<{
        canSend: boolean;
        isTrial: boolean;
        freeMessagesLimit: number | null;
        freeMessagesUsed: number | null;
        freeMessagesRemaining: number | null;
        requiresUpgrade: boolean;
    }>;
    openConversation(request: AuthenticatedRequest, userId: string): Promise<{
        id: string;
    }>;
    getMessages(request: AuthenticatedRequest, conversationId: string, cursor?: string): Promise<{
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
    sendMessage(request: AuthenticatedRequest, conversationId: string, dto: SendMessageDto): Promise<{
        freeMessagesRemaining: number | null;
        body: string;
        id: string;
        conversationId: string;
        senderId: string;
        readAt: Date | null;
        createdAt: Date | null;
    }>;
    markRead(request: AuthenticatedRequest, conversationId: string): Promise<{
        success: boolean;
        readAt: Date;
    }>;
    blockConversation(request: AuthenticatedRequest, conversationId: string): Promise<{
        success: boolean;
    }>;
    createReport(request: AuthenticatedRequest, conversationId: string, dto: CreateReportDto): Promise<{
        id: string;
        status: string;
    }>;
    createSocketTicket(request: AuthenticatedRequest): {
        token: string;
    };
}
export {};
