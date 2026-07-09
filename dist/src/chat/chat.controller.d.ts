import { Request } from 'express';
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
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    listConversations(request: AuthenticatedRequest): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        otherUser: {
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
        lastMessage: {
            id: string;
            conversationId: string;
            senderId: string;
            body: string;
            readAt: Date | null;
            createdAt: Date | null;
        };
    }[]>;
    createConversation(request: AuthenticatedRequest, createConversationDto: CreateConversationDto): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        otherUser: {
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
        lastMessage: {
            id: string;
            conversationId: string;
            senderId: string;
            body: string;
            readAt: Date | null;
            createdAt: Date | null;
        };
    }>;
    listMessages(request: AuthenticatedRequest, conversationId: string): Promise<{
        id: string;
        createdAt: Date | null;
        body: string;
        conversationId: string;
        senderId: string;
        readAt: Date | null;
    }[]>;
    sendMessage(request: AuthenticatedRequest, conversationId: string, sendMessageDto: SendMessageDto): Promise<{
        id: string;
        createdAt: Date | null;
        body: string;
        conversationId: string;
        senderId: string;
        readAt: Date | null;
    }>;
}
export {};
