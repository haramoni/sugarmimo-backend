"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.UserRole = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const node_crypto_1 = require("node:crypto");
const users_service_1 = require("../users/users.service");
const profile_photo_validation_1 = require("../users/profile-photo.validation");
exports.UserRole = {
    SugarDaddy: 'SUGAR_DADDY',
    SugarBaby: 'SUGAR_BABY',
    Admin: 'ADMIN',
};
let AuthService = class AuthService {
    jwtService;
    usersService;
    constructor(jwtService, usersService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async register(registerDto) {
        if (!/^[A-Za-z0-9._-]{2,50}$/.test(registerDto.username)) {
            throw new common_1.BadRequestException('O nome de usuario deve conter apenas letras, numeros, ponto, hifen ou sublinhado.');
        }
        const lookingFor = registerDto.lookingFor ?? registerDto.interest;
        const role = this.resolveRole(registerDto.profileType ?? registerDto.role);
        if (!role) {
            throw new common_1.BadRequestException('Tipo de perfil invalido.');
        }
        if (role === exports.UserRole.SugarDaddy) {
            throw new common_1.BadRequestException('O cadastro de Sugar Daddies e Sugar Mommies esta temporariamente indisponivel.');
        }
        if (registerDto.termsAccepted !== true) {
            throw new common_1.BadRequestException('E necessario aceitar os termos de uso.');
        }
        this.validateAdultBirthDate(registerDto.birthDate);
        const photos = registerDto.profilePhotos ?? [];
        if (role === exports.UserRole.SugarBaby && photos.length === 0) {
            throw new common_1.BadRequestException('Sugar Babies precisam enviar pelo menos uma foto.');
        }
        (0, profile_photo_validation_1.validateProfilePhotos)(photos);
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const approvalStatus = this.getInitialApprovalStatus(role);
        const user = await this.usersService.create({
            username: registerDto.username.toLowerCase(),
            email: registerDto.email.toLowerCase(),
            passwordHash,
            role,
            gender: registerDto.profileType,
            lookingFor,
            birthDate: registerDto.birthDate
                ? new Date(`${registerDto.birthDate}T00:00:00.000Z`)
                : undefined,
            country: registerDto.country,
            state: registerDto.state,
            city: registerDto.city,
            whatsapp: registerDto.whatsapp,
            telegram: registerDto.telegram,
            instagram: registerDto.instagram,
            appearance: {
                bodyType: registerDto.bodyType,
                ethnicity: registerDto.ethnicity,
                hairColor: registerDto.hairColor,
                eyeColor: registerDto.eyeColor,
                heightCm: registerDto.heightCm,
            },
            preferences: {
                source: registerDto.source,
                termsAccepted: registerDto.termsAccepted,
                smoke: registerDto.smoke,
                drink: registerDto.drink,
                relationship: registerDto.relationship,
                children: registerDto.children,
                education: registerDto.education,
                occupation: registerDto.occupation,
                visibleContactChannels: registerDto.visibleContactChannels,
            },
            approvalStatus,
            photos: photos.map((photo, index) => ({
                dataUrl: photo.dataUrl,
                fileName: photo.fileName,
                mimeType: photo.mimeType,
                sortOrder: index + 1,
            })),
        });
        if (approvalStatus === 'PENDING') {
            return {
                requiresApproval: true,
                user,
            };
        }
        return this.buildAuthResponse(user);
    }
    async login(loginDto) {
        const identifier = (loginDto.identifier ??
            loginDto.email ??
            loginDto.username)?.toLowerCase();
        if (!identifier) {
            throw new common_1.BadRequestException('Email or username is required');
        }
        if (!loginDto.password) {
            throw new common_1.BadRequestException('Password is required');
        }
        const user = identifier.includes('@')
            ? await this.usersService.findByEmail(identifier)
            : await this.usersService.findByUsername(identifier);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatches = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (this.normalizeRole(user.role) === exports.UserRole.SugarBaby &&
            this.normalizeApprovalStatus(user.approvalStatus) !== 'APPROVED') {
            throw new common_1.UnauthorizedException('Profile is pending manual approval');
        }
        return this.buildAuthResponse({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            gender: user.gender,
            lookingFor: user.lookingFor,
            birthDate: user.birthDate,
            country: user.country,
            state: user.state,
            city: user.city,
            whatsapp: user.whatsapp,
            telegram: user.telegram,
            instagram: user.instagram,
            approvalStatus: user.approvalStatus,
            isPremium: user.isPremium,
            reviewedAt: user.reviewedAt,
            createdAt: user.createdAt,
        });
    }
    async adminLogin(loginDto) {
        const authResponse = await this.login(loginDto);
        if (authResponse.user.role !== exports.UserRole.Admin) {
            throw new common_1.UnauthorizedException('Admin access required');
        }
        return authResponse;
    }
    buildAuthResponse(user) {
        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
            jti: (0, node_crypto_1.randomUUID)(),
        });
        return {
            accessToken,
            user,
        };
    }
    getInitialApprovalStatus(role) {
        return role === exports.UserRole.SugarBaby ? 'PENDING' : 'APPROVED';
    }
    normalizeRole(role) {
        return role?.trim().toUpperCase();
    }
    normalizeApprovalStatus(approvalStatus) {
        return approvalStatus?.trim().toUpperCase();
    }
    resolveRole(answer) {
        if (!answer) {
            return undefined;
        }
        const normalizedAnswer = answer
            .trim()
            .toLowerCase()
            .replace(/[_\s]+/g, '-');
        if ([
            'sugar-daddy',
            'sugardaddy',
            'sugar-mommy',
            'sugarmommy',
            'daddy',
            'mommy',
        ].includes(normalizedAnswer)) {
            return exports.UserRole.SugarDaddy;
        }
        if ([
            'sugar-baby',
            'sugarbaby',
            'sugar-baby-woman',
            'sugar-baby-man',
            'baby',
        ].includes(normalizedAnswer)) {
            return exports.UserRole.SugarBaby;
        }
        return undefined;
    }
    validateAdultBirthDate(birthDate) {
        if (!birthDate) {
            throw new common_1.BadRequestException('Data de nascimento obrigatoria.');
        }
        const parsedBirthDate = new Date(`${birthDate}T00:00:00.000Z`);
        if (Number.isNaN(parsedBirthDate.getTime())) {
            throw new common_1.BadRequestException('Data de nascimento invalida.');
        }
        const today = new Date();
        const adultThreshold = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
        if (parsedBirthDate > adultThreshold) {
            throw new common_1.BadRequestException('E necessario ter pelo menos 18 anos.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map