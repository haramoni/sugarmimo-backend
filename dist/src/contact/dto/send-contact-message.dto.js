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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendContactMessageDto = void 0;
const class_validator_1 = require("class-validator");
class SendContactMessageDto {
    name;
    email;
    subject;
    message;
    website;
}
exports.SendContactMessageDto = SendContactMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Informe seu nome.' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SendContactMessageDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Informe um e-mail valido.' }),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], SendContactMessageDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Informe o assunto.' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], SendContactMessageDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'A mensagem deve ter pelo menos 10 caracteres.' }),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], SendContactMessageDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(0),
    __metadata("design:type", String)
], SendContactMessageDto.prototype, "website", void 0);
//# sourceMappingURL=send-contact-message.dto.js.map