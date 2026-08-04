import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

type ChatSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { userId?: string }
>;

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: ChatSocket) {
    const token =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : '';

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        scope: string;
      }>(token);
      if (payload.scope !== 'chat_socket') {
        throw new Error('Invalid scope');
      }
      client.data.userId = payload.sub;
      await client.join(this.userRoom(payload.sub));
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: { conversationId?: string },
  ) {
    const userId = client.data.userId;
    const conversationId = payload?.conversationId;
    if (!userId || !conversationId) {
      return { ok: false };
    }
    await this.chatService.assertConversationMember(userId, conversationId);
    await client.join(this.conversationRoom(conversationId));
    return { ok: true };
  }

  emitNewMessage(
    conversationId: string,
    recipientId: string,
    message: unknown,
  ) {
    this.server
      .to(this.conversationRoom(conversationId))
      .to(this.userRoom(recipientId))
      .emit('message:new', message);
  }

  emitRead(
    conversationId: string,
    senderId: string,
    readAt: Date,
    readerId: string,
  ) {
    this.server
      .to(this.conversationRoom(conversationId))
      .to(this.userRoom(senderId))
      .emit('messages:read', { conversationId, readAt, readerId });
  }

  emitBlocked(conversationId: string, blockedId: string, blockerId: string) {
    this.server
      .to(this.conversationRoom(conversationId))
      .to(this.userRoom(blockedId))
      .emit('conversation:blocked', { conversationId, blockerId });
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private conversationRoom(conversationId: string) {
    return `conversation:${conversationId}`;
  }
}
