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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const audit_service_1 = require("../audit/audit.service");
const users_service_1 = require("../users/users.service");
const admin_guard_1 = require("./admin.guard");
const chat_service_1 = require("../chat/chat.service");
const resolve_report_dto_1 = require("../chat/dto/resolve-report.dto");
let AdminController = class AdminController {
    usersService;
    auditService;
    chatService;
    constructor(usersService, auditService, chatService) {
        this.usersService = usersService;
        this.auditService = auditService;
        this.chatService = chatService;
    }
    findPendingBabies(page = '1', pageSize = '6') {
        return this.usersService.findPendingBabies(Number(page), Number(pageSize));
    }
    findSugarDaddies() {
        return this.usersService.findSugarDaddies();
    }
    findActivityLogs(limit = '100') {
        return this.auditService.findLatest(Number(limit));
    }
    findChatReports(status) {
        return this.chatService.listReports(status);
    }
    resolveChatReport(request, id, dto) {
        return this.chatService.resolveReport(request.user.id, id, dto);
    }
    approveProfile(id) {
        return this.usersService.updateApprovalStatus(id, 'APPROVED');
    }
    rejectProfile(id) {
        return this.usersService.updateApprovalStatus(id, 'REJECTED');
    }
    enablePremium(id) {
        return this.usersService.updatePremiumStatus(id, true);
    }
    disablePremium(id) {
        return this.usersService.updatePremiumStatus(id, false);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('pending-babies'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findPendingBabies", null);
__decorate([
    (0, common_1.Get)('premium-daddies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findSugarDaddies", null);
__decorate([
    (0, common_1.Get)('activity-logs'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findActivityLogs", null);
__decorate([
    (0, common_1.Get)('chat-reports'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findChatReports", null);
__decorate([
    (0, common_1.Patch)('chat-reports/:id/resolve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, resolve_report_dto_1.ResolveReportDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "resolveChatReport", null);
__decorate([
    (0, common_1.Patch)('profiles/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveProfile", null);
__decorate([
    (0, common_1.Patch)('profiles/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectProfile", null);
__decorate([
    (0, common_1.Patch)('profiles/:id/premium'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "enablePremium", null);
__decorate([
    (0, common_1.Patch)('profiles/:id/standard'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "disablePremium", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        audit_service_1.AuditService,
        chat_service_1.ChatService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map