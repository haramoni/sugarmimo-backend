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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const FROM = 'SugarMimo <contato.sugarmimo@sugarmimo.com>';
let EmailService = class EmailService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    ensureConfigured() {
        if (!this.configService.get('RESEND_API_KEY')?.trim()) {
            throw new common_1.ServiceUnavailableException('Adicione RESEND_API_KEY no .env do backend.');
        }
    }
    async sendNewPassword(to, password) {
        const apiKey = this.configService.get('RESEND_API_KEY')?.trim();
        this.ensureConfigured();
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM,
                to: [to],
                subject: 'Sua nova senha - SugarMimo',
                text: [
                    'Ola!',
                    '',
                    'Sua nova senha de acesso ao SugarMimo e:',
                    password,
                    '',
                    'Se voce nao solicitou esta troca, entre em contato com o suporte.',
                ].join('\n'),
            }),
        }).catch(() => null);
        if (!response?.ok) {
            throw new common_1.BadGatewayException('O Resend nao conseguiu enviar o e-mail.');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map