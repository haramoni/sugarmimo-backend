import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    constructor(configService: ConfigService);
    ensureConfigured(): void;
    sendNewPassword(to: string, password: string): Promise<void>;
    sendContactMessage({ name, email, subject, message, }: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<void>;
    sendNewDaddyRegistration({ id, username, email, profileType, lookingFor, birthDate, country, state, city, whatsapp, telegram, instagram, occupation, source, referralUsername, createdAt, }: {
        id: string;
        username: string;
        email: string;
        profileType?: string;
        lookingFor?: string;
        birthDate?: string;
        country?: string;
        state?: string;
        city?: string;
        whatsapp?: string;
        telegram?: string;
        instagram?: string;
        occupation?: string;
        source?: string;
        referralUsername?: string;
        createdAt?: Date | null;
    }): Promise<void>;
}
