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

  async sendContactMessage({
    name,
    email,
    subject,
    message,
  }: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
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
        to: ['contato@sugarmimo.com'],
        reply_to: email,
        subject: `[Contato SugarMimo] ${subject}`,
        text: [
          `Nome: ${name}`,
          `E-mail: ${email}`,
          `Assunto: ${subject}`,
          '',
          message,
        ].join('\n'),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      throw new BadGatewayException('O Resend nao conseguiu enviar o e-mail.');
    }
  }

  async sendNewDaddyRegistration({
    id,
    username,
    email,
    profileType,
    lookingFor,
    birthDate,
    country,
    state,
    city,
    whatsapp,
    telegram,
    instagram,
    occupation,
    source,
    referralUsername,
    createdAt,
  }: {
    id: string;
    username: string;
    email: string;
    profileType?: string;
    lookingFor?: string;
    birthDate?: string;
    country?: string;
    state?: string;
    city?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    occupation?: string;
    source?: string;
    referralUsername?: string;
    createdAt?: Date | null;
  }) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();

    this.ensureConfigured();

    const value = (input?: string | null) => input?.trim() || 'Nao informado';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: ['contato@sugarmimo.com'],
        subject: `Novo Daddy cadastrado: @${username}`,
        text: [
          'Um novo Daddy entrou no site SugarMimo.',
          '',
          `ID: ${id}`,
          `Usuario: @${username}`,
          `E-mail: ${email}`,
          `Tipo de perfil: ${value(profileType)}`,
          `Procura por: ${value(lookingFor)}`,
          `Data de nascimento: ${value(birthDate)}`,
          `Pais: ${value(country)}`,
          `Estado: ${value(state)}`,
          `Cidade: ${value(city)}`,
          `WhatsApp: ${value(whatsapp)}`,
          `Telegram: ${value(telegram)}`,
          `Instagram: ${value(instagram)}`,
          `Ocupacao: ${value(occupation)}`,
          `Como conheceu a SugarMimo: ${value(source)}`,
          `Indicacao: ${value(referralUsername)}`,
          `Cadastro realizado em: ${createdAt?.toISOString() ?? new Date().toISOString()}`,
        ].join('\n'),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      throw new BadGatewayException('O Resend nao conseguiu enviar o e-mail.');
    }
  }
}
