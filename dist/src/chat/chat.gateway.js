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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    jwtService;
    chatService;
    server;
    constructor(jwtService, chatService) {
        this.jwtService = jwtService;
        this.chatService = chatService;
    }
    async handleConnection(client) {
        const token = typeof client.handshake.auth?.token === 'string'
            ? client.handshake.auth.token
            : '';
        try {
            const payload = await this.jwtService.verifyAsync(token);
            if (payload.scope !== 'chat_socket') {
                throw new Error('Invalid scope');
            }
            client.data.userId = payload.sub;
            await client.join(this.userRoom(payload.sub));
        }
        catch {
            client.disconnect(true);
        }
    }
    async joinConversation(client, payload) {
        const userId = client.data.userId;
        const conversationId = payload?.conversationId;
        if (!userId || !conversationId) {
            return { ok: false };
        }
        await this.chatService.assertConversationMember(userId, conversationId);
        await client.join(this.conversationRoom(conversationId));
        return { ok: true };
    }
    emitNewMessage(conversationId, recipientId, message) {
        this.server
            .to(this.conversationRoom(conversationId))
            .to(this.userRoom(recipientId))
            .emit('message:new', message);
    }
    emitRead(conversationId, senderId, readAt, readerId) {
        this.server
            .to(this.conversationRoom(conversationId))
            .to(this.userRoom(senderId))
            .emit('messages:read', { conversationId, readAt, readerId });
    }
    emitBlocked(conversationId, blockedId, blockerId) {
        this.server
            .to(this.conversationRoom(conversationId))
            .to(this.userRoom(blockedId))
            .emit('conversation:blocked', { conversationId, blockerId });
    }
    userRoom(userId) {
        return `user:${userId}`;
    }
    conversationRoom(conversationId) {
        return `conversation:${conversationId}`;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinConversation", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: { origin: true, credentials: true },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map