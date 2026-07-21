import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Informe um e-mail valido.' })
  @MaxLength(255)
  email: string;
}
