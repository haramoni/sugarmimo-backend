import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// O Resend aceita qualquer endereco do dominio verificado. Ele nao precisa
// ser uma caixa de entrada real, pois este endereco serve apenas para envio.
const FROM = 'SugarMimo <contato.sugarmimo@sugarmimo.com>';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  ensureConfigured() {
    if (!this.configService.get<string>('RESEND_API_KEY')?.trim()) {
      throw new ServiceUnavailableException(
        'Adicione RESEND_API_KEY no .env do backend.',
      );
    }
  }

  async sendNewPassword(to: string, password: string) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();

    this.ensureConfigured();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: 'Sua nova senha - SugarMimo',
        text: [
          'Ola!',
          '',
          'Sua nova senha de acesso ao SugarMimo e:',
          password,
          '',
          'Se voce nao solicitou esta troca, entre em contato com o suporte.',
        ].join('\n'),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      throw new BadGatewayException('O Resend nao conseguiu enviar o e-mail.');
    }
  }
}
