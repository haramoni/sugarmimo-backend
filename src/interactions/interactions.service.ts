import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UserRole = {
  SugarDaddy: 'SUGAR_DADDY',
  SugarBaby: 'SUGAR_BABY',
} as const;

const NotificationType = {
  LikeReceived: 'LIKE_RECEIVED',
  ContactsReleased: 'CONTACTS_RELEASED',
  BabyLikeAndRelease: 'BABY_LIKE_AND_RELEASE',
} as const;

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  async likeProfile(daddyId: string, babyId: string) {
    if (daddyId === babyId) {
      throw new BadRequestException('Voce nao pode curtir o proprio perfil.');
    }

    const [daddy, baby] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: daddyId },
        select: {
          id: true,
          role: true,
          approvalStatus: true,
          isPremium: true,
        },
      }),
      this.prisma.user.findUnique({
        where: { id: babyId },
        select: { id: true, role: true, approvalStatus: true },
      }),
    ]);

    if (!daddy || !baby) {
      throw new NotFoundException('Perfil nao encontrado.');
    }

    if (
      daddy.role !== UserRole.SugarDaddy ||
      daddy.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException('Apenas Sugar Daddies ativos podem curtir.');
    }

    if (!daddy.isPremium) {
      throw new ForbiddenException(
        'Apenas Sugar Daddies Premium podem dar likes.',
      );
    }

    if (
      baby.role !== UserRole.SugarBaby ||
      baby.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException(
        'Apenas Sugar Babies aprovadas podem receber likes.',
      );
    }

    const existingLike = await this.prisma.profileLike.findUnique({
      where: { daddyId_babyId: { daddyId, babyId } },
    });

    if (existingLike?.daddyLikedAt) {
      return this.serializeLike(existingLike);
    }

    const profileLike = await this.prisma.$transaction(async (tx) => {
      const createdLike = existingLike
        ? await tx.profileLike.update({
            where: { id: existingLike.id },
            data: { daddyLikedAt: new Date() },
          })
        : await tx.profileLike.create({
            data: { daddyId, babyId, daddyLikedAt: new Date() },
          });

      await tx.notification.create({
        data: {
          recipientId: babyId,
          actorId: daddyId,
          profileLikeId: createdLike.id,
          type: NotificationType.LikeReceived,
        },
      });

      return createdLike;
    });

    return this.serializeLike(profileLike);
  }

  async releaseContacts(babyId: string, daddyId: string) {
    const [baby, daddy] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: babyId },
        select: {
          id: true,
          role: true,
          approvalStatus: true,
          preferences: { select: { preferences: true } },
        },
      }),
      this.prisma.user.findUnique({
        where: { id: daddyId },
        select: {
          id: true,
          username: true,
          role: true,
          approvalStatus: true,
          isPremium: true,
        },
      }),
    ]);

    if (!baby || !daddy) {
      throw new NotFoundException('Perfil nao encontrado.');
    }

    if (
      baby.role !== UserRole.SugarBaby ||
      baby.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException(
        'Apenas Sugar Babies aprovadas podem liberar contatos.',
      );
    }

    if (
      daddy.role !== UserRole.SugarDaddy ||
      daddy.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException('O Sugar Daddy precisa estar ativo.');
    }

    if (!daddy.isPremium) {
      throw new ForbiddenException(
        'Apenas Sugar Daddies Premium podem receber contatos.',
      );
    }

    const profileLike = await this.prisma.profileLike.findUnique({
      where: { daddyId_babyId: { daddyId, babyId } },
    });

    if (!profileLike?.daddyLikedAt) {
      throw new ForbiddenException(
        'O Sugar Daddy precisa curtir o perfil primeiro.',
      );
    }

    if (profileLike.contactsReleasedAt) {
      return this.serializeLike(profileLike);
    }

    const storedPreferences = baby.preferences?.preferences;
    const currentPreferences =
      storedPreferences &&
      typeof storedPreferences === 'object' &&
      !Array.isArray(storedPreferences)
        ? storedPreferences
        : {};
    const currentViewers = Array.isArray(
      currentPreferences.contactViewerUsernames,
    )
      ? currentPreferences.contactViewerUsernames
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim().toLowerCase())
      : [];
    const contactViewerUsernames = Array.from(
      new Set([...currentViewers, daddy.username.toLowerCase()]),
    ).slice(0, 50);

    const releasedLike = await this.prisma.$transaction(async (tx) => {
      const updatedLike = await tx.profileLike.update({
        where: { id: profileLike.id },
        data: { contactsReleasedAt: new Date() },
      });

      await tx.userPreference.upsert({
        where: { userId: babyId },
        update: {
          preferences: {
            ...currentPreferences,
            contactViewerUsernames,
          },
        },
        create: {
          userId: babyId,
          preferences: { contactViewerUsernames },
        },
      });

      await tx.notification.create({
        data: {
          recipientId: daddyId,
          actorId: babyId,
          profileLikeId: profileLike.id,
          type: NotificationType.ContactsReleased,
        },
      });

      return updatedLike;
    });

    return this.serializeLike(releasedLike);
  }

  async likeDaddyAndReleaseContacts(babyId: string, daddyId: string) {
    const [baby, daddy] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: babyId },
        select: {
          id: true,
          role: true,
          approvalStatus: true,
          preferences: { select: { preferences: true } },
        },
      }),
      this.prisma.user.findUnique({
        where: { id: daddyId },
        select: {
          id: true,
          username: true,
          role: true,
          approvalStatus: true,
          isPremium: true,
        },
      }),
    ]);

    if (!baby || !daddy) {
      throw new NotFoundException('Perfil nao encontrado.');
    }

    if (
      baby.role !== UserRole.SugarBaby ||
      baby.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException(
        'Apenas Sugar Babies aprovadas podem curtir e liberar contatos.',
      );
    }

    if (
      daddy.role !== UserRole.SugarDaddy ||
      daddy.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException('O Sugar Daddy precisa estar ativo.');
    }

    if (!daddy.isPremium) {
      throw new ForbiddenException(
        'Apenas Sugar Daddies Premium podem receber likes.',
      );
    }

    const existingLike = await this.prisma.profileLike.findUnique({
      where: { daddyId_babyId: { daddyId, babyId } },
    });

    if (existingLike?.babyLikedAt && existingLike.contactsReleasedAt) {
      return this.serializeLike(existingLike);
    }

    const storedPreferences = baby.preferences?.preferences;
    const currentPreferences =
      storedPreferences &&
      typeof storedPreferences === 'object' &&
      !Array.isArray(storedPreferences)
        ? storedPreferences
        : {};
    const currentViewers = Array.isArray(
      currentPreferences.contactViewerUsernames,
    )
      ? currentPreferences.contactViewerUsernames
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim().toLowerCase())
      : [];
    const contactViewerUsernames = Array.from(
      new Set([...currentViewers, daddy.username.toLowerCase()]),
    ).slice(0, 50);
    const now = new Date();

    const profileLike = await this.prisma.$transaction(async (tx) => {
      const updatedLike = existingLike
        ? await tx.profileLike.update({
            where: { id: existingLike.id },
            data: {
              babyLikedAt: existingLike.babyLikedAt ?? now,
              contactsReleasedAt: existingLike.contactsReleasedAt ?? now,
            },
          })
        : await tx.profileLike.create({
            data: {
              daddyId,
              babyId,
              babyLikedAt: now,
              contactsReleasedAt: now,
            },
          });

      await tx.userPreference.upsert({
        where: { userId: babyId },
        update: {
          preferences: {
            ...currentPreferences,
            contactViewerUsernames,
          },
        },
        create: {
          userId: babyId,
          preferences: { contactViewerUsernames },
        },
      });

      if (!existingLike?.babyLikedAt) {
        await tx.notification.create({
          data: {
            recipientId: daddyId,
            actorId: babyId,
            profileLikeId: updatedLike.id,
            type: NotificationType.BabyLikeAndRelease,
          },
        });
      }

      return updatedLike;
    });

    return this.serializeLike(profileLike);
  }

  async listNotifications(userId: string) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          type: true,
          readAt: true,
          createdAt: true,
          actor: {
            select: {
              id: true,
              username: true,
              role: true,
              city: true,
              state: true,
              photos: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
                select: { id: true, dataUrl: true, sortOrder: true },
              },
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: { recipientId: userId, readAt: null },
      }),
    ]);

    return { items, unreadCount };
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { readAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notificacao nao encontrada.');
    }

    return { success: true };
  }

  private serializeLike(profileLike: {
    id: string;
    createdAt: Date | null;
    daddyLikedAt: Date | null;
    babyLikedAt: Date | null;
    contactsReleasedAt: Date | null;
  }) {
    return {
      id: profileLike.id,
      liked: Boolean(profileLike.daddyLikedAt),
      daddyLiked: Boolean(profileLike.daddyLikedAt),
      daddyLikedAt: profileLike.daddyLikedAt,
      babyLiked: Boolean(profileLike.babyLikedAt),
      babyLikedAt: profileLike.babyLikedAt,
      createdAt: profileLike.createdAt,
      contactsReleased: Boolean(profileLike.contactsReleasedAt),
      contactsReleasedAt: profileLike.contactsReleasedAt,
    };
  }
}
