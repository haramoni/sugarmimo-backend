import { ConfigService } from '@nestjs/config';
export declare class ChatCryptoService {
    private readonly key;
    constructor(configService: ConfigService);
    encrypt(plainText: string): string;
    decrypt(envelope: string): string;
}
