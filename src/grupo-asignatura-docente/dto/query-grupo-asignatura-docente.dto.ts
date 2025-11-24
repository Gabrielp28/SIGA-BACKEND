import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryGrupoAsignaturaDocenteDto {
  @ApiPropertyOptional({ description: 'ID del grupo', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id_grupo?: number;

  @ApiPropertyOptional({ description: 'ID de la asignatura', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id_asignatura?: number;

  @ApiPropertyOptional({ description: 'ID del docente', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id_docente?: number;

  @ApiPropertyOptional({ description: 'Estado', example: 'activa' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Número de página', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Límite de resultados por página', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Campo para ordenar', example: 'fecha_asignacion' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ description: 'Dirección del ordenamiento', enum: ['ASC', 'DESC'], example: 'DESC' })
  @IsOptional()
  @IsString()
  orderDirection?: 'ASC' | 'DESC';
}

