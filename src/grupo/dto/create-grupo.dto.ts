import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MaxLength, Min, Max } from 'class-validator';

export class CreateGrupoDto {
  @ApiProperty({
    description: 'Código único del grupo',
    example: 'GRUPO-001',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  codigo_grupo: string;

  @ApiPropertyOptional({
    description: 'Nombre del grupo',
    example: 'Grupo Matutino A',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre_grupo?: string;

  @ApiProperty({
    description: 'Periodo académico del grupo',
    example: '2024-1',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  periodo_academico: string;

  @ApiProperty({
    description: 'ID del plan de estudios',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id_plan: number;

  @ApiProperty({
    description: 'ID de la carrera a la que pertenece el grupo',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id_carrera: number;

  @ApiPropertyOptional({
    description: 'ID del docente titular (coordinador) del grupo',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  id_docente_titular?: number;

  @ApiPropertyOptional({
    description: 'Número mínimo de asignaturas requeridas en el grupo',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  min_asignaturas?: number;

  @ApiPropertyOptional({
    description: 'Número máximo de asignaturas permitidas en el grupo',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_asignaturas?: number;

  @ApiPropertyOptional({
    description: 'Estado del grupo',
    example: 'activo',
    enum: ['activo', 'inactivo'],
    default: 'activo',
  })
  @IsOptional()
  @IsString()
  estado?: string;
}

