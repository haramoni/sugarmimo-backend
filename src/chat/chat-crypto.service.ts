import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

@Injectable()
export class ChatCryptoService {
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    const configuredKey = configService.get<string>('CHAT_ENCRYPTION_KEY');
    if (
      !configuredKey &&
      configService.get<string>('NODE_ENV') === 'production'
    ) {
      throw new Error('CHAT_ENCRYPTION_KEY is required in production.');
    }
    const secret =
      configuredKey ?? configService.getOrThrow<string>('JWT_SECRET');
    this.key = createHash('sha256').update(secret).digest();
  }

  encrypt(plainText: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return ['v1', iv, tag, encrypted]
      .map((part) =>
        typeof part === 'string' ? part : part.toString('base64url'),
      )
      .join('.');
  }

  decrypt(envelope: string) {
    if (!envelope.startsWith('v1.')) {
      return envelope;
    }

    const [, encodedIv, encodedTag, encodedBody] = envelope.split('.');
    if (!encodedIv || !encodedTag || !encodedBody) {
      return '[Mensagem indisponível]';
    }

    try {
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.key,
        Buffer.from(encodedIv, 'base64url'),
      );
      decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
      return Buffer.concat([
        decipher.update(Buffer.from(encodedBody, 'base64url')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      return '[Mensagem indisponível]';
    }
  }
}
