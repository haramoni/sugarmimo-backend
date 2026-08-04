import { ConfigService } from '@nestjs/config';
import { ChatCryptoService } from './chat-crypto.service';

describe('ChatCryptoService', () => {
  const service = new ChatCryptoService(
    new ConfigService({
      CHAT_ENCRYPTION_KEY: 'chat-test-key-with-more-than-32-characters',
    }),
  );

  it('encrypts message content with authenticated encryption', () => {
    const encrypted = service.encrypt('mensagem privada');

    expect(encrypted).toMatch(/^v1\./);
    expect(encrypted).not.toContain('mensagem privada');
    expect(service.decrypt(encrypted)).toBe('mensagem privada');
  });

  it('does not expose invalid encrypted content', () => {
    expect(service.decrypt('v1.invalid.invalid.invalid')).toBe(
      '[Mensagem indisponível]',
    );
  });
});
