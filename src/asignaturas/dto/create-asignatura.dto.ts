import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateAsignaturaDto {
  @ApiProperty({
    description: 'ID de la carrera a la que pertenece la asignatura',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id_carrera: number;

  @ApiProperty({
    description: 'Código único de la asignatura',
    example: 'MAT101',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  codigo_asignatura: string;

  @ApiProperty({
    description: 'Nombre completo de la asignatura',
    example: 'Matemática Básica',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nombre_asignatura: string;

  @ApiProperty({
    description: 'Cantidad de créditos que otorga la asignatura',
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber()
  creditos: number;

  @ApiProperty({
    description: 'Número de horas semanales de clase',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  horas_semanales: number;

  @ApiPropertyOptional({
    description: 'Semestre en el que se imparte la asignatura',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  semestre?: number;

  @ApiPropertyOptional({
    description: 'Tipo de asignatura (obligatoria, optativa, etc.)',
    example: 'obligatoria',
    maxLength: 15,
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Estado de la asignatura (activa, inactiva, etc.)',
    example: 'activa',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  estado?: string;

  @ApiPropertyOptional({
    description: 'Lista de prerequisitos en formato texto',
    example: 'NINGUNO',
  })
  @IsOptional()
  @IsString()
  prerequisitos?: string;
}

