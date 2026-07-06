import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare const UserRole: {
    readonly SugarDaddy: "SUGAR_DADDY";
    readonly SugarBaby: "SUGAR_BABY";
    readonly Admin: "ADMIN";
};
export declare class AuthService {
    private readonly jwtService;
    private readonly usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: string | null;
            gender: string | null;
            lookingFor: string | null;
            birthDate: Date | null;
            country: string | null;
            state: string | null;
            city: string | null;
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
            approvalStatus: string;
            reviewedAt: Date | null;
            createdAt: Date | null;
        };
    } | {
        requiresApproval: boolean;
        accessToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: string | null;
            gender: string | null;
            lookingFor: string | null;
            birthDate: Date | null;
            country: string | null;
            state: string | null;
            city: string | null;
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
            approvalStatus: string;
            reviewedAt: Date | null;
            createdAt: Date | null;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: string | null;
            gender: string | null;
            lookingFor: string | null;
            birthDate: Date | null;
            country: string | null;
            state: string | null;
            city: string | null;
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
            approvalStatus: string;
            reviewedAt: Date | null;
            createdAt: Date | null;
        };
    }>;
    adminLogin(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: string | null;
            gender: string | null;
            lookingFor: string | null;
            birthDate: Date | null;
            country: string | null;
            state: string | null;
            city: string | null;
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
            approvalStatus: string;
            reviewedAt: Date | null;
            createdAt: Date | null;
        };
    }>;
    private buildAuthResponse;
    private getInitialApprovalStatus;
    private resolveRole;
}
