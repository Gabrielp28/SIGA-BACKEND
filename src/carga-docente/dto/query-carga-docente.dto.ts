import { IsOptional, IsInt, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryCargaDocenteDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de docente', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idDocente?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de grupo', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idGrupo?: number;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de vinculación', example: 'titular' })
  @IsOptional()
  @IsString()
  tipo_vinculacion?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado', example: 'asignada' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Número de página', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Límite de resultados por página', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

