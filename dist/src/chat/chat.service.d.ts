import { PrismaService } from '../prisma/prisma.service';
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
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listConversations(userId: string): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        otherUser: UserSummary;
        lastMessage: MessageSummary;
    }[]>;
    createOrFindConversation(userId: string, participantId: string): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        otherUser: UserSummary;
        lastMessage: MessageSummary;
    }>;
    listMessages(userId: string, conversationId: string): Promise<{
        id: string;
        createdAt: Date | null;
        body: string;
        conversationId: string;
        senderId: string;
        readAt: Date | null;
    }[]>;
    sendMessage(userId: string, conversationId: string, body: string): Promise<{
        id: string;
        createdAt: Date | null;
        body: string;
        conversationId: string;
        senderId: string;
        readAt: Date | null;
    }>;
    private ensureParticipant;
    private findConversationById;
    private serializeConversation;
    private userSummarySelect;
    private messageSelect;
}
export {};
