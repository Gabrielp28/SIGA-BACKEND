import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryDocenteDto {
  @ApiProperty({ description: 'Búsqueda por nombre, apellido, código o identificación', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filtrar por estado', example: 'activo', required: false })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({ description: 'Filtrar por departamento', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  id_departamento?: number;

  @ApiProperty({ description: 'Filtrar por cargo', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  id_cargo?: number;

  @ApiProperty({ description: 'Campo para ordenar', example: 'nombres', required: false })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiProperty({ description: 'Dirección del ordenamiento', enum: ['ASC', 'DESC'], required: false })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  orderDirection?: 'ASC' | 'DESC';

  @ApiProperty({ description: 'Número de página', example: 1, required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: 'Límite de resultados por página', example: 10, required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

