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
exports.InteractionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const interactions_service_1 = require("./interactions.service");
let InteractionsController = class InteractionsController {
    interactionsService;
    constructor(interactionsService) {
        this.interactionsService = interactionsService;
    }
    likeProfile(request, babyId) {
        return this.interactionsService.likeProfile(request.user.id, babyId);
    }
    releaseContacts(request, daddyId) {
        return this.interactionsService.releaseContacts(request.user.id, daddyId);
    }
    likeDaddyAndReleaseContacts(request, daddyId) {
        return this.interactionsService.likeDaddyAndReleaseContacts(request.user.id, daddyId);
    }
    notifications(request) {
        return this.interactionsService.listNotifications(request.user.id);
    }
    markNotificationRead(request, id) {
        return this.interactionsService.markNotificationRead(request.user.id, id);
    }
};
exports.InteractionsController = InteractionsController;
__decorate([
    (0, common_1.Post)('likes/:babyId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('babyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InteractionsController.prototype, "likeProfile", null);
__decorate([
    (0, common_1.Post)('releases/:daddyId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('daddyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InteractionsController.prototype, "releaseContacts", null);
__decorate([
    (0, common_1.Post)('baby-likes/:daddyId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('daddyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InteractionsController.prototype, "likeDaddyAndReleaseContacts", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InteractionsController.prototype, "notifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InteractionsController.prototype, "markNotificationRead", null);
exports.InteractionsController = InteractionsController = __decorate([
    (0, common_1.Controller)('interactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [interactions_service_1.InteractionsService])
], InteractionsController);
//# sourceMappingURL=interactions.controller.js.map