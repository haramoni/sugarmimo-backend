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
exports.ChatCryptoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
let ChatCryptoService = class ChatCryptoService {
    key;
    constructor(configService) {
        const configuredKey = configService.get('CHAT_ENCRYPTION_KEY');
        if (!configuredKey &&
            configService.get('NODE_ENV') === 'production') {
            throw new Error('CHAT_ENCRYPTION_KEY is required in production.');
        }
        const secret = configuredKey ?? configService.getOrThrow('JWT_SECRET');
        this.key = (0, node_crypto_1.createHash)('sha256').update(secret).digest();
    }
    encrypt(plainText) {
        const iv = (0, node_crypto_1.randomBytes)(12);
        const cipher = (0, node_crypto_1.createCipheriv)('aes-256-gcm', this.key, iv);
        const encrypted = Buffer.concat([
            cipher.update(plainText, 'utf8'),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();
        return ['v1', iv, tag, encrypted]
            .map((part) => typeof part === 'string' ? part : part.toString('base64url'))
            .join('.');
    }
    decrypt(envelope) {
        if (!envelope.startsWith('v1.')) {
            return envelope;
        }
        const [, encodedIv, encodedTag, encodedBody] = envelope.split('.');
        if (!encodedIv || !encodedTag || !encodedBody) {
            return '[Mensagem indisponível]';
        }
        try {
            const decipher = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', this.key, Buffer.from(encodedIv, 'base64url'));
            decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
            return Buffer.concat([
                decipher.update(Buffer.from(encodedBody, 'base64url')),
                decipher.final(),
            ]).toString('utf8');
        }
        catch {
            return '[Mensagem indisponível]';
        }
    }
};
exports.ChatCryptoService = ChatCryptoService;
exports.ChatCryptoService = ChatCryptoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChatCryptoService);
//# sourceMappingURL=chat-crypto.service.js.map