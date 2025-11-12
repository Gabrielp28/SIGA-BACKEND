import { IsString, IsOptional, IsInt, IsDateString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocenteDto {
  @ApiProperty({ description: 'ID del usuario asociado', example: 1, required: false })
  @IsInt()
  @IsOptional()
  id_usuario?: number;

  @ApiProperty({ description: 'ID del departamento', example: 1 })
  @IsInt()
  @IsNotEmpty()
  id_departamento: number;

  @ApiProperty({ description: 'ID del cargo docente', example: 1 })
  @IsInt()
  @IsNotEmpty()
  id_cargo: number;

  @ApiProperty({ description: 'Código único del docente', example: 'DOC-001' })
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  codigo_docente: string;

  @ApiProperty({ description: 'Nombres del docente', example: 'Juan Carlos' })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({ description: 'Apellidos del docente', example: 'Pérez García' })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty({ description: 'Número de identificación', example: '1234567890' })
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  identificacion: string;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '1980-05-15', required: false })
  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: string;

  @ApiProperty({ description: 'Género', example: 'M', required: false })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  genero?: string;

  @ApiProperty({ description: 'Estado del docente', example: 'activo', required: false })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  estado?: string;

  @ApiProperty({ description: 'Fecha de ingreso', example: '2020-01-15', required: false })
  @IsDateString()
  @IsOptional()
  fecha_ingreso?: string;
}

