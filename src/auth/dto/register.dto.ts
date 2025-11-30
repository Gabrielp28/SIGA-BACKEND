import { IsNotEmpty, IsString, IsEmail, MinLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'johndoe',
  })
  @IsNotEmpty({ message: 'El username es requerido' })
  @IsString({ message: 'El username debe ser un string' })
  username: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un string' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'ID del rol a asignar al usuario',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  @IsNumber({}, { message: 'El ID del rol debe ser un número' })
  @Min(1, { message: 'El ID del rol debe ser mayor a 0' })
  id_rol: number;
}

