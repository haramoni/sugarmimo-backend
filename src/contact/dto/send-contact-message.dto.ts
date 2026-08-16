import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendContactMessageDto {
  @IsString()
  @MinLength(2, { message: 'Informe seu nome.' })
  @MaxLength(100)
  name!: string;

  @IsEmail({}, { message: 'Informe um e-mail valido.' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(3, { message: 'Informe o assunto.' })
  @MaxLength(120)
  subject!: string;

  @IsString()
  @MinLength(10, { message: 'A mensagem deve ter pelo menos 10 caracteres.' })
  @MaxLength(5000)
  message!: string;

  // Campo invisivel: bots costumam preenche-lo, pessoas nao.
  @IsOptional()
  @IsString()
  @MaxLength(0)
  website?: string;
}
