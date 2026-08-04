import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
type ChatSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, {
    userId?: string;
}>;
export declare class ChatGateway implements OnGatewayConnection {
    private readonly jwtService;
    private readonly chatService;
    server: Server;
    constructor(jwtService: JwtService, chatService: ChatService);
    handleConnection(client: ChatSocket): Promise<void>;
    joinConversation(client: ChatSocket, payload: {
        conversationId?: string;
    }): Promise<{
        ok: boolean;
    }>;
    emitNewMessage(conversationId: string, recipientId: string, message: unknown): void;
    emitRead(conversationId: string, senderId: string, readAt: Date, readerId: string): void;
    emitBlocked(conversationId: string, blockedId: string, blockerId: string): void;
    private userRoom;
    private conversationRoom;
}
export {};
