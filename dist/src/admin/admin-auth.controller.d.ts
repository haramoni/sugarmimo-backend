import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
export declare class AdminAuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: string | null;
            gender: string | null;
            lookingFor: string | null;
            relationshipIntent: string;
            birthDate: Date | null;
            country: string | null;
            state: string | null;
            city: string | null;
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
            approvalStatus: string;
            isPremium: boolean;
            isPremiere: boolean;
            privacyPolicyVersion: string | null;
            privacyPolicyAcceptedAt: Date | null;
            reviewedAt: Date | null;
            createdAt: Date | null;
        };
    }>;
}
