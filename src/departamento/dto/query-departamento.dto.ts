import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryDepartamentoDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por nombre o código del departamento',
    example: 'Informática',
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
    description: 'Campo por el cual ordenar',
    example: 'nombre_departamento',
    enum: ['nombre_departamento', 'codigo_departamento', 'id_departamento'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['nombre_departamento', 'codigo_departamento', 'id_departamento'])
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
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsInt({ message: 'page debe ser un número entero válido' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsInt({ message: 'limit debe ser un número entero válido' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  @Max(100, { message: 'limit debe ser menor o igual a 100' })
  limit?: number;
}

