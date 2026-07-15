"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configuredOrigins = process.env.FRONTEND_URL?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    const allowedOrigins = configuredOrigins?.length
        ? configuredOrigins
        : process.env.NODE_ENV === 'production'
            ? null
            : ['http://localhost:3000', 'http://localhost:3002'];
    if (!allowedOrigins) {
        throw new Error('FRONTEND_URL is required in production.');
    }
    app.set('trust proxy', 'loopback');
    app.use((0, helmet_1.default)());
    app.use((0, express_1.json)({ limit: '22mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '1mb' }));
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
//# sourceMappingURL=main.js.map