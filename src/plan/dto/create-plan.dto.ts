import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({
    description: 'Nombre del plan',
    example: 'Plan de Estudios 2016',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nombre_plan: string;

  @ApiProperty({
    description: 'Código único del plan',
    example: 'PLAN-2016',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  codigo_plan: string;

  @ApiProperty({
    description: 'Año del plan',
    example: 2016,
    minimum: 1900,
    maximum: 2100,
  })
  @IsNumber()
  @Min(1900)
  año: number;

  @ApiPropertyOptional({
    description: 'Descripción del plan',
    example: 'Plan de estudios actualizado para el año 2016',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Estado del plan',
    example: 'activo',
    enum: ['activo', 'inactivo', 'vigente', 'obsoleto'],
    default: 'activo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  estado?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del plan',
    example: '2016-01-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del plan',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}

