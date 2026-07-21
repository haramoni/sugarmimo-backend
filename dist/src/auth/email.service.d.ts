import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    constructor(configService: ConfigService);
    ensureConfigured(): void;
    sendNewPassword(to: string, password: string): Promise<void>;
}
