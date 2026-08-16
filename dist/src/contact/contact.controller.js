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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const email_service_1 = require("../auth/email.service");
const contact_throttle_1 = require("./contact-throttle");
const send_contact_message_dto_1 = require("./dto/send-contact-message.dto");
let ContactController = class ContactController {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async send(contactMessage) {
        await this.emailService.sendContactMessage({
            name: contactMessage.name.trim(),
            email: contactMessage.email.trim().toLowerCase(),
            subject: contactMessage.subject.replace(/[\r\n]+/g, ' ').trim(),
            message: contactMessage.message.trim(),
        });
        return { message: 'Mensagem enviada com sucesso.' };
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({
        default: {
            limit: 5,
            ttl: 60 * 60_000,
            getTracker: contact_throttle_1.getContactThrottleTracker,
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_contact_message_dto_1.SendContactMessageDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "send", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)('contact'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map