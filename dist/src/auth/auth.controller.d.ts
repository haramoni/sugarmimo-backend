import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
type AuthenticatedRequest = Request & {
    user: {
        id: string;
        email: string;
        role?: string | null;
    };
};
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
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
    availability(username?: string, email?: string): Promise<{
        usernameAvailable: boolean;
        emailAvailable: boolean;
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
    me(request: AuthenticatedRequest): import("@prisma/client").Prisma.Prisma__UserClient<{
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
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
        approvalStatus: string;
        reviewedAt: Date | null;
        createdAt: Date | null;
        appearance: {
            bodyType: string | null;
            ethnicity: string | null;
            hairColor: string | null;
            eyeColor: string | null;
            heightCm: number | null;
        } | null;
        preferences: {
            lookingFor: string | null;
            preferences: import("@prisma/client/runtime/client").JsonValue;
            introductionPhrase: string | null;
            aboutMe: string | null;
        } | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
        }[];
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    matches(request: AuthenticatedRequest, search?: string): Promise<({
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
        id: string;
        username: string;
        role: string | null;
        gender: string | null;
        lookingFor: string | null;
        birthDate: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        createdAt: Date | null;
        appearance: {
            bodyType: string | null;
            ethnicity: string | null;
            hairColor: string | null;
            eyeColor: string | null;
            heightCm: number | null;
        } | null;
        preferences: {
            lookingFor: string | null;
            preferences: import("@prisma/client/runtime/client").JsonValue;
            introductionPhrase: string | null;
            aboutMe: string | null;
        } | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
        }[];
    } & {
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
    })[]>;
    matchProfile(request: AuthenticatedRequest, identifier: string): Promise<{
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
        id: string;
        username: string;
        role: string | null;
        gender: string | null;
        lookingFor: string | null;
        birthDate: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        createdAt: Date | null;
        appearance: {
            bodyType: string | null;
            ethnicity: string | null;
            hairColor: string | null;
            eyeColor: string | null;
            heightCm: number | null;
        } | null;
        preferences: {
            lookingFor: string | null;
            preferences: import("@prisma/client/runtime/client").JsonValue;
            introductionPhrase: string | null;
            aboutMe: string | null;
        } | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
        }[];
    } & {
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
    }>;
    updateMe(request: AuthenticatedRequest, updateProfileDto: UpdateProfileDto): Promise<{
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
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
        approvalStatus: string;
        reviewedAt: Date | null;
        createdAt: Date | null;
        appearance: {
            bodyType: string | null;
            ethnicity: string | null;
            hairColor: string | null;
            eyeColor: string | null;
            heightCm: number | null;
        } | null;
        preferences: {
            lookingFor: string | null;
            preferences: import("@prisma/client/runtime/client").JsonValue;
            introductionPhrase: string | null;
            aboutMe: string | null;
        } | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
        }[];
    } | null>;
}
export {};
