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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const profile_photo_validation_1 = require("./profile-photo.validation");
const UserRole = {
    SugarDaddy: 'SUGAR_DADDY',
    SugarBaby: 'SUGAR_BABY',
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }
    updatePasswordHash(id, passwordHash) {
        return this.prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
    }
    findCredentialsById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                passwordHash: true,
            },
        });
    }
    findAuthStateById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                approvalStatus: true,
            },
        });
    }
    async checkAvailability(username, email) {
        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();
        const existingUsers = await this.prisma.user.findMany({
            where: {
                OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
            },
            select: {
                username: true,
                email: true,
            },
        });
        const usedUsernames = new Set(existingUsers.map((user) => user.username));
        const usedEmails = new Set(existingUsers.map((user) => user.email));
        return {
            usernameAvailable: !usedUsernames.has(normalizedUsername),
            emailAvailable: !usedEmails.has(normalizedEmail),
        };
    }
    findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                gender: true,
                lookingFor: true,
                birthDate: true,
                country: true,
                state: true,
                city: true,
                whatsapp: true,
                telegram: true,
                instagram: true,
                approvalStatus: true,
                isPremium: true,
                reviewedAt: true,
                createdAt: true,
                photos: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        dataUrl: true,
                        fileName: true,
                        mimeType: true,
                        sortOrder: true,
                        isPrivate: true,
                    },
                },
                appearance: {
                    select: {
                        bodyType: true,
                        ethnicity: true,
                        hairColor: true,
                        eyeColor: true,
                        heightCm: true,
                    },
                },
                preferences: {
                    select: {
                        preferences: true,
                        introductionPhrase: true,
                        aboutMe: true,
                        lookingFor: true,
                    },
                },
            },
        });
    }
    async create(data) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email or username already registered');
        }
        const { appearance, preferences, photos, ...userData } = data;
        const approvalStatus = userData.role === UserRole.SugarBaby
            ? 'PENDING'
            : userData.approvalStatus;
        const hasAppearance = appearance &&
            Object.values(appearance).some((value) => value !== undefined && value !== '');
        const filteredPreferences = Object.fromEntries(Object.entries(preferences ?? {}).filter(([, value]) => value !== undefined && value !== ''));
        const hasPreferences = Object.keys(filteredPreferences).length > 0;
        return this.prisma.user.create({
            data: {
                ...userData,
                approvalStatus,
                appearance: hasAppearance
                    ? {
                        create: appearance,
                    }
                    : undefined,
                preferences: hasPreferences
                    ? {
                        create: {
                            preferences: filteredPreferences,
                        },
                    }
                    : undefined,
                photos: photos
                    ? {
                        create: photos,
                    }
                    : undefined,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                gender: true,
                lookingFor: true,
                birthDate: true,
                country: true,
                state: true,
                city: true,
                whatsapp: true,
                telegram: true,
                instagram: true,
                approvalStatus: true,
                isPremium: true,
                reviewedAt: true,
                createdAt: true,
                photos: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        dataUrl: true,
                        fileName: true,
                        mimeType: true,
                        sortOrder: true,
                    },
                },
            },
        });
    }
    findPendingBabies() {
        return this.prisma.user.findMany({
            where: {
                role: 'SUGAR_BABY',
                approvalStatus: 'PENDING',
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                gender: true,
                lookingFor: true,
                birthDate: true,
                country: true,
                state: true,
                city: true,
                whatsapp: true,
                telegram: true,
                instagram: true,
                approvalStatus: true,
                createdAt: true,
                photos: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        dataUrl: true,
                        fileName: true,
                        mimeType: true,
                        sortOrder: true,
                    },
                },
            },
        });
    }
    findSugarDaddies() {
        return this.prisma.user.findMany({
            where: {
                role: UserRole.SugarDaddy,
                approvalStatus: 'APPROVED',
            },
            orderBy: [{ isPremium: 'desc' }, { createdAt: 'desc' }],
            select: {
                id: true,
                username: true,
                email: true,
                city: true,
                state: true,
                isPremium: true,
                createdAt: true,
            },
        });
    }
    async updatePremiumStatus(id, isPremium) {
        const profile = await this.prisma.user.findUnique({
            where: { id },
            select: { role: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Perfil nao encontrado.');
        }
        if (profile.role !== UserRole.SugarDaddy) {
            throw new common_1.BadRequestException('O plano Premium se aplica apenas a Sugar Daddies.');
        }
        return this.prisma.user.update({
            where: { id },
            data: { isPremium },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isPremium: true,
            },
        });
    }
    async updateApprovalStatus(id, approvalStatus) {
        const profile = await this.prisma.user.findUnique({
            where: { id },
            select: { role: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Perfil nao encontrado.');
        }
        if (profile.role !== UserRole.SugarBaby) {
            throw new common_1.BadRequestException('A aprovacao manual se aplica apenas a Sugar Babies.');
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                approvalStatus,
                reviewedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                approvalStatus: true,
                isPremium: true,
                reviewedAt: true,
            },
        });
    }
    async findMatchesForUser(viewerId, search, page = 1, limit = 9) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true, username: true, approvalStatus: true },
        });
        const targetRole = this.resolveMatchRole(viewer?.role);
        const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
        const safeLimit = Number.isFinite(limit)
            ? Math.min(30, Math.max(3, Math.floor(limit)))
            : 9;
        if (!targetRole || viewer?.approvalStatus !== 'APPROVED') {
            return {
                items: [],
                page: safePage,
                pageSize: safeLimit,
                total: 0,
                totalPages: 0,
                hasMore: false,
            };
        }
        const normalizedSearch = search?.trim();
        const where = {
            id: { not: viewerId },
            role: targetRole,
            approvalStatus: 'APPROVED',
            ...(normalizedSearch
                ? {
                    OR: [
                        { username: { contains: normalizedSearch } },
                        { city: { contains: normalizedSearch } },
                        { state: { contains: normalizedSearch } },
                    ],
                }
                : {}),
        };
        const [matches, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: [{ lastActiveAt: 'desc' }, { createdAt: 'desc' }],
                skip: (safePage - 1) * safeLimit,
                take: safeLimit + 1,
                select: this.publicProfileListSelect(),
            }),
            this.prisma.user.count({ where }),
        ]);
        const hasMore = matches.length > safeLimit;
        return {
            items: matches
                .slice(0, safeLimit)
                .map((match) => this.sanitizePublicProfile(match, viewer.username)),
            page: safePage,
            pageSize: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
            hasMore,
        };
    }
    async findBoostedProfilesForUser(viewerId, page = 1, limit = 6) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true, username: true, approvalStatus: true },
        });
        const targetRole = this.resolveMatchRole(viewer?.role);
        const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
        const safeLimit = Number.isFinite(limit)
            ? Math.min(18, Math.max(3, Math.floor(limit)))
            : 6;
        if (!targetRole || viewer?.approvalStatus !== 'APPROVED') {
            return {
                items: [],
                page: safePage,
                pageSize: safeLimit,
                total: 0,
                totalPages: 0,
                hasMore: false,
            };
        }
        const where = {
            id: { not: viewerId },
            role: targetRole,
            approvalStatus: 'APPROVED',
            boostedUntil: { gt: new Date() },
        };
        const [profiles, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: [{ boostedUntil: 'desc' }, { lastActiveAt: 'desc' }],
                skip: (safePage - 1) * safeLimit,
                take: safeLimit + 1,
                select: this.publicProfileListSelect(),
            }),
            this.prisma.user.count({ where }),
        ]);
        const hasMore = profiles.length > safeLimit;
        return {
            items: profiles
                .slice(0, safeLimit)
                .map((profile) => this.sanitizePublicProfile(profile, viewer.username)),
            page: safePage,
            pageSize: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
            hasMore,
        };
    }
    async findMatchPhotoForUser(viewerId, photoId) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true, username: true, approvalStatus: true },
        });
        const targetRole = this.resolveMatchRole(viewer?.role);
        if (!targetRole || viewer?.approvalStatus !== 'APPROVED') {
            return null;
        }
        const photo = await this.prisma.userPhoto.findFirst({
            where: {
                id: photoId,
                user: {
                    role: targetRole,
                    approvalStatus: 'APPROVED',
                },
            },
            select: {
                id: true,
                dataUrl: true,
                mimeType: true,
                isPrivate: true,
                user: {
                    select: {
                        preferences: { select: { preferences: true } },
                    },
                },
            },
        });
        if (!photo) {
            return null;
        }
        const preferences = photo.user.preferences?.preferences;
        const privatePhotoViewerUsernames = preferences &&
            typeof preferences === 'object' &&
            'privatePhotoViewerUsernames' in preferences &&
            Array.isArray(preferences.privatePhotoViewerUsernames)
            ? preferences.privatePhotoViewerUsernames
            : [];
        if (photo.isPrivate &&
            !privatePhotoViewerUsernames.includes(viewer?.username?.toLowerCase())) {
            return null;
        }
        return {
            id: photo.id,
            dataUrl: photo.dataUrl,
            mimeType: photo.mimeType,
        };
    }
    async findActiveDaddySuggestions(viewerId, search) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true, approvalStatus: true },
        });
        if (viewer?.role !== UserRole.SugarBaby ||
            viewer.approvalStatus !== 'APPROVED') {
            throw new common_1.ForbiddenException('A selecao de contatos esta disponivel para Sugar Babies aprovadas.');
        }
        const normalizedSearch = search?.trim().replace(/^@+/, '').slice(0, 50);
        return this.prisma.user.findMany({
            where: {
                role: UserRole.SugarDaddy,
                approvalStatus: 'APPROVED',
                ...(normalizedSearch
                    ? { username: { contains: normalizedSearch.toLowerCase() } }
                    : {}),
            },
            orderBy: { username: 'asc' },
            take: 8,
            select: {
                id: true,
                username: true,
                city: true,
                state: true,
            },
        });
    }
    async findPrivatePhotoViewerSuggestions(viewerId, search) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true, approvalStatus: true },
        });
        const targetRole = this.resolveMatchRole(viewer?.role);
        if (!targetRole || viewer?.approvalStatus !== 'APPROVED') {
            throw new common_1.ForbiddenException('Perfil sem acesso a esta selecao.');
        }
        const normalizedSearch = search?.trim().replace(/^@+/, '').slice(0, 50);
        return this.prisma.user.findMany({
            where: {
                id: { not: viewerId },
                role: targetRole,
                approvalStatus: 'APPROVED',
                ...(normalizedSearch
                    ? { username: { contains: normalizedSearch.toLowerCase() } }
                    : {}),
            },
            orderBy: { username: 'asc' },
            take: 8,
            select: { id: true, username: true, city: true, state: true },
        });
    }
    async touchPresence(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() },
            select: { id: true },
        });
        return { online: true };
    }
    async findMatchProfileForUser(viewerId, identifier) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true, username: true, approvalStatus: true },
        });
        const targetRole = this.resolveMatchRole(viewer?.role);
        if (!targetRole ||
            viewer?.approvalStatus !== 'APPROVED' ||
            !viewer.username) {
            return null;
        }
        const normalizedIdentifier = identifier.trim().replace(/^@+/, '');
        const profile = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { id: normalizedIdentifier },
                    { username: normalizedIdentifier.toLowerCase() },
                ],
                role: targetRole,
                approvalStatus: 'APPROVED',
            },
            select: this.publicProfileSelect(),
        });
        if (!profile) {
            return null;
        }
        const daddyId = viewer.role === UserRole.SugarDaddy ? viewerId : profile.id;
        const babyId = viewer.role === UserRole.SugarBaby ? viewerId : profile.id;
        const profileLike = await this.prisma.profileLike.findUnique({
            where: { daddyId_babyId: { daddyId, babyId } },
            select: {
                id: true,
                createdAt: true,
                daddyLikedAt: true,
                babyLikedAt: true,
                contactsReleasedAt: true,
            },
        });
        return {
            ...this.sanitizePublicProfile(profile, viewer.username),
            interaction: {
                liked: viewer.role === UserRole.SugarDaddy
                    ? Boolean(profileLike?.daddyLikedAt)
                    : Boolean(profileLike?.babyLikedAt),
                likeId: profileLike?.id ?? null,
                likedAt: viewer.role === UserRole.SugarDaddy
                    ? (profileLike?.daddyLikedAt ?? null)
                    : (profileLike?.babyLikedAt ?? null),
                daddyLiked: Boolean(profileLike?.daddyLikedAt),
                daddyLikedAt: profileLike?.daddyLikedAt ?? null,
                babyLiked: Boolean(profileLike?.babyLikedAt),
                babyLikedAt: profileLike?.babyLikedAt ?? null,
                contactsReleased: Boolean(profileLike?.contactsReleasedAt),
                contactsReleasedAt: profileLike?.contactsReleasedAt ?? null,
            },
        };
    }
    async updateProfile(id, data) {
        const currentUser = await this.findById(id);
        if (!currentUser) {
            return null;
        }
        const activeContactViewerUsernames = data.contactViewerUsernames === undefined
            ? undefined
            : await this.filterActiveDaddyUsernames(data.contactViewerUsernames);
        const activePrivatePhotoViewerUsernames = data.privatePhotoViewerUsernames === undefined
            ? undefined
            : await this.filterActiveMatchUsernames(currentUser.role, data.privatePhotoViewerUsernames);
        const selectedPreferences = {
            lookingFor: data.lookingFor,
            bodyType: data.bodyType,
            ethnicity: data.ethnicity,
            hairColor: data.hairColor,
            eyeColor: data.eyeColor,
            smoke: data.smoke,
            drink: data.drink,
            relationship: data.relationship,
            children: data.children,
            education: data.education,
            occupation: data.occupation,
            customInterests: data.customInterests,
            visibleContactChannels: data.visibleContactChannels,
            contactViewerUsernames: activeContactViewerUsernames,
            privatePhotoViewerUsernames: activePrivatePhotoViewerUsernames,
        };
        const preferences = Object.fromEntries(Object.entries(selectedPreferences).filter(([key, value]) => value !== undefined &&
            (key === 'customInterests' ||
                key === 'visibleContactChannels' ||
                key === 'contactViewerUsernames' ||
                key === 'privatePhotoViewerUsernames' ||
                (Array.isArray(value) ? value.length > 0 : value !== ''))));
        const slugs = Object.fromEntries(Object.entries(preferences).map(([key, value]) => [
            key,
            Array.isArray(value)
                ? value.map((item) => this.toSlug(String(item)))
                : this.toSlug(String(value)),
        ]));
        const hasAppearance = [
            data.bodyType,
            data.ethnicity,
            data.hairColor,
            data.eyeColor,
            data.heightCm,
        ].some((value) => value !== undefined && value !== '');
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    username: data.username?.toLowerCase(),
                    lookingFor: data.lookingFor,
                    birthDate: data.birthDate
                        ? new Date(`${data.birthDate}T00:00:00.000Z`)
                        : undefined,
                    country: data.country,
                    state: data.state,
                    city: data.city,
                    whatsapp: data.whatsapp,
                    telegram: data.telegram,
                    instagram: data.instagram,
                },
            });
            if (hasAppearance) {
                await tx.userAppearance.upsert({
                    where: { userId: id },
                    update: {
                        bodyType: data.bodyType,
                        ethnicity: data.ethnicity,
                        hairColor: data.hairColor,
                        eyeColor: data.eyeColor,
                        heightCm: data.heightCm,
                    },
                    create: {
                        userId: id,
                        bodyType: data.bodyType,
                        ethnicity: data.ethnicity,
                        hairColor: data.hairColor,
                        eyeColor: data.eyeColor,
                        heightCm: data.heightCm,
                    },
                });
            }
            await tx.userPreference.upsert({
                where: { userId: id },
                update: {
                    preferences: {
                        ...currentUser.preferences?.preferences,
                        ...preferences,
                        slugs,
                    },
                    introductionPhrase: data.introductionPhrase,
                    aboutMe: data.aboutMe,
                    lookingFor: data.lookingForText,
                },
                create: {
                    userId: id,
                    preferences: {
                        ...preferences,
                        slugs,
                    },
                    introductionPhrase: data.introductionPhrase,
                    aboutMe: data.aboutMe,
                    lookingFor: data.lookingForText,
                },
            });
            if (data.profilePhotos) {
                const publicPhotos = data.profilePhotos.filter((photo) => !photo.isPrivate);
                const privatePhotos = data.profilePhotos.filter((photo) => photo.isPrivate);
                if (publicPhotos.length > 6 || privatePhotos.length > 6) {
                    throw new common_1.BadRequestException('Voce pode manter no maximo 6 fotos publicas e 6 privadas.');
                }
                if (currentUser.role === UserRole.SugarBaby &&
                    publicPhotos.length === 0) {
                    throw new common_1.BadRequestException('Sugar Babies precisam manter pelo menos uma foto.');
                }
                (0, profile_photo_validation_1.validateProfilePhotos)(data.profilePhotos);
                await tx.userPhoto.deleteMany({ where: { userId: id } });
                if (data.profilePhotos.length > 0) {
                    await tx.userPhoto.createMany({
                        data: data.profilePhotos.map((photo, index) => ({
                            userId: id,
                            dataUrl: photo.dataUrl,
                            fileName: photo.fileName,
                            mimeType: photo.mimeType,
                            sortOrder: photo.sortOrder ?? index + 1,
                            isPrivate: Boolean(photo.isPrivate),
                        })),
                    });
                }
            }
        });
        return this.findById(id);
    }
    toSlug(value) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    resolveMatchRole(viewerRole) {
        if (viewerRole === UserRole.SugarBaby) {
            return UserRole.SugarDaddy;
        }
        if (viewerRole === UserRole.SugarDaddy) {
            return UserRole.SugarBaby;
        }
        return null;
    }
    publicProfileSelect() {
        return {
            id: true,
            username: true,
            role: true,
            gender: true,
            lookingFor: true,
            birthDate: true,
            country: true,
            state: true,
            city: true,
            whatsapp: true,
            telegram: true,
            instagram: true,
            isPremium: true,
            boostedUntil: true,
            createdAt: true,
            lastActiveAt: true,
            photos: {
                orderBy: { sortOrder: 'asc' },
                select: {
                    id: true,
                    dataUrl: true,
                    fileName: true,
                    mimeType: true,
                    sortOrder: true,
                    isPrivate: true,
                },
            },
            appearance: {
                select: {
                    bodyType: true,
                    ethnicity: true,
                    hairColor: true,
                    eyeColor: true,
                    heightCm: true,
                },
            },
            preferences: {
                select: {
                    preferences: true,
                    introductionPhrase: true,
                    aboutMe: true,
                    lookingFor: true,
                },
            },
        };
    }
    publicProfileListSelect() {
        const profileSelect = this.publicProfileSelect();
        return {
            ...profileSelect,
            photos: {
                where: { isPrivate: false },
                orderBy: profileSelect.photos.orderBy,
                take: 1,
                select: {
                    id: true,
                    fileName: true,
                    mimeType: true,
                    sortOrder: true,
                    isPrivate: true,
                },
            },
        };
    }
    normalizeContactViewerUsernames(value) {
        if (!Array.isArray(value)) {
            return undefined;
        }
        return Array.from(new Set(value
            .map((username) => username.trim().replace(/^@+/, '').toLowerCase())
            .filter(Boolean))).slice(0, 50);
    }
    async filterActiveDaddyUsernames(value) {
        const normalizedUsernames = this.normalizeContactViewerUsernames(value) ?? [];
        if (normalizedUsernames.length === 0) {
            return [];
        }
        const activeDaddies = await this.prisma.user.findMany({
            where: {
                username: { in: normalizedUsernames },
                role: UserRole.SugarDaddy,
                approvalStatus: 'APPROVED',
            },
            select: { username: true },
        });
        const activeUsernames = new Set(activeDaddies.map((profile) => profile.username.toLowerCase()));
        return normalizedUsernames.filter((username) => activeUsernames.has(username));
    }
    async filterActiveMatchUsernames(viewerRole, value) {
        const normalizedUsernames = this.normalizeContactViewerUsernames(value) ?? [];
        const targetRole = this.resolveMatchRole(viewerRole);
        if (!targetRole || normalizedUsernames.length === 0) {
            return [];
        }
        const activeProfiles = await this.prisma.user.findMany({
            where: {
                username: { in: normalizedUsernames },
                role: targetRole,
                approvalStatus: 'APPROVED',
            },
            select: { username: true },
        });
        const activeUsernames = new Set(activeProfiles.map((profile) => profile.username.toLowerCase()));
        return normalizedUsernames.filter((username) => activeUsernames.has(username));
    }
    sanitizePublicProfile(profile, viewerUsername) {
        const preferences = profile.preferences?.preferences;
        const visibleContactChannels = preferences &&
            typeof preferences === 'object' &&
            'visibleContactChannels' in preferences &&
            Array.isArray(preferences.visibleContactChannels)
            ? preferences.visibleContactChannels.slice(0, 1)
            : [];
        const contactViewerUsernames = preferences &&
            typeof preferences === 'object' &&
            'contactViewerUsernames' in preferences &&
            Array.isArray(preferences.contactViewerUsernames)
            ? preferences.contactViewerUsernames
            : [];
        const canViewContacts = viewerUsername &&
            contactViewerUsernames.includes(viewerUsername.trim().toLowerCase());
        const privatePhotoViewerUsernames = preferences &&
            typeof preferences === 'object' &&
            'privatePhotoViewerUsernames' in preferences &&
            Array.isArray(preferences.privatePhotoViewerUsernames)
            ? preferences.privatePhotoViewerUsernames
            : [];
        const canViewPrivatePhotos = Boolean(viewerUsername &&
            privatePhotoViewerUsernames.includes(viewerUsername.trim().toLowerCase()));
        return {
            ...profile,
            photos: Array.isArray(profile.photos)
                ? profile.photos.filter((photo) => !photo.isPrivate || canViewPrivatePhotos)
                : profile.photos,
            canViewPrivatePhotos,
            isOnline: this.isOnline(profile.lastActiveAt),
            whatsapp: canViewContacts && visibleContactChannels.includes('whatsapp')
                ? profile.whatsapp
                : null,
            telegram: canViewContacts && visibleContactChannels.includes('telegram')
                ? profile.telegram
                : null,
            instagram: canViewContacts && visibleContactChannels.includes('instagram')
                ? profile.instagram
                : null,
        };
    }
    isOnline(lastActiveAt) {
        return Boolean(lastActiveAt && Date.now() - lastActiveAt.getTime() <= 2 * 60_000);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map