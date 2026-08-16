import { EmailService } from '../auth/email.service';
import { SendContactMessageDto } from './dto/send-contact-message.dto';
export declare class ContactController {
    private readonly emailService;
    constructor(emailService: EmailService);
    send(contactMessage: SendContactMessageDto): Promise<{
        message: string;
    }>;
}
