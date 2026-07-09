import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateActivityLogInput = {
  userId?: string | null;
  action: string;
  method: string;
  path: string;
  statusCode?: number;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: CreateActivityLogInput) {
    try {
      await this.prisma.activityLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          method: input.method,
          path: input.path,
          statusCode: input.statusCode,
          ip: input.ip,
          userAgent: input.userAgent,
          metadata: input.metadata,
        },
      });
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to record activity log: ${error.message}`
          : 'Failed to record activity log',
      );
    }
  }

  findLatest(limit = 100) {
    const safeLimit = Math.min(Math.max(limit, 1), 500);

    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
