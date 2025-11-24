import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryGrupoDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por código o nombre del grupo',
    example: 'GRUPO-001',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    example: 'activo',
    enum: ['activo', 'inactivo'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['activo', 'inactivo'])
  estado?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de carrera',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_carrera?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de docente titular (coordinador)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_docente_titular?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por periodo académico',
    example: '2024-1',
  })
  @IsOptional()
  @IsString()
  periodo_academico?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'codigo_grupo',
    enum: ['codigo_grupo', 'nombre_grupo', 'periodo_academico', 'id_grupo'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['codigo_grupo', 'nombre_grupo', 'periodo_academico', 'id_grupo'])
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Número de página (para paginación)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

