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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const chat_gateway_1 = require("./chat.gateway");
const chat_service_1 = require("./chat.service");
const create_report_dto_1 = require("./dto/create-report.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
let ChatController = class ChatController {
    chatService;
    chatGateway;
    jwtService;
    constructor(chatService, chatGateway, jwtService) {
        this.chatService = chatService;
        this.chatGateway = chatGateway;
        this.jwtService = jwtService;
    }
    listConversations(request) {
        return this.chatService.listConversations(request.user.id);
    }
    openConversation(request, userId) {
        return this.chatService.openConversation(request.user.id, userId);
    }
    getMessages(request, conversationId, cursor) {
        return this.chatService.getMessages(request.user.id, conversationId, cursor);
    }
    async sendMessage(request, conversationId, dto) {
        const result = await this.chatService.sendMessage(request.user.id, conversationId, dto.body);
        this.chatGateway.emitNewMessage(conversationId, result.recipientId, result.message);
        return result.message;
    }
    async markRead(request, conversationId) {
        const result = await this.chatService.markRead(request.user.id, conversationId);
        this.chatGateway.emitRead(conversationId, result.otherUserId, result.readAt, request.user.id);
        return { success: true, readAt: result.readAt };
    }
    async blockConversation(request, conversationId) {
        const result = await this.chatService.blockConversation(request.user.id, conversationId);
        this.chatGateway.emitBlocked(conversationId, result.blockedId, request.user.id);
        return { success: true };
    }
    async createReport(request, conversationId, dto) {
        const result = await this.chatService.createReport(request.user.id, conversationId, dto);
        if (dto.blockUser) {
            const conversation = await this.chatService.assertConversationMember(request.user.id, conversationId);
            const blockedId = conversation.memberOneId === request.user.id
                ? conversation.memberTwoId
                : conversation.memberOneId;
            this.chatGateway.emitBlocked(conversationId, blockedId, request.user.id);
        }
        return result;
    }
    createSocketTicket(request) {
        return {
            token: this.jwtService.sign({ sub: request.user.id, scope: 'chat_socket' }, { expiresIn: '2m' }),
        };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "listConversations", null);
__decorate([
    (0, common_1.Post)('conversations/with/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "openConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages'),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60_000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Patch)('conversations/:id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('conversations/:id/block'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "blockConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:id/reports'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 3_600_000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_report_dto_1.CreateReportDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createReport", null);
__decorate([
    (0, common_1.Post)('socket-ticket'),
    (0, throttler_1.Throttle)({ default: { limit: 12, ttl: 60_000 } }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createSocketTicket", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        chat_gateway_1.ChatGateway,
        jwt_1.JwtService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map