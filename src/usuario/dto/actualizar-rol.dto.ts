import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class ActualizarRolDto {
  @ApiPropertyOptional({
    description: 'ID del nuevo rol a asignar',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  id_rol?: number;

  @ApiPropertyOptional({
    description: 'Estado de la asignación',
    example: 'activo',
    enum: ['activo', 'inactivo'],
  })
  @IsOptional()
  @IsString()
  estado?: string;
}

