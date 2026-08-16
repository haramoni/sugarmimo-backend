import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EmailService } from '../auth/email.service';
import { getContactThrottleTracker } from './contact-throttle';
import { SendContactMessageDto } from './dto/send-contact-message.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @HttpCode(200)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60 * 60_000,
      getTracker: getContactThrottleTracker,
    },
  })
  async send(@Body() contactMessage: SendContactMessageDto) {
    await this.emailService.sendContactMessage({
      name: contactMessage.name.trim(),
      email: contactMessage.email.trim().toLowerCase(),
      subject: contactMessage.subject.replace(/[\r\n]+/g, ' ').trim(),
      message: contactMessage.message.trim(),
    });

    return { message: 'Mensagem enviada com sucesso.' };
  }
}
