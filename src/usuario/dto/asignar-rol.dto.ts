import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AsignarRolDto {
  @ApiProperty({
    description: 'ID del rol a asignar',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  id_rol: number;

  @ApiPropertyOptional({
    description: 'Estado de la asignación',
    example: 'activo',
    enum: ['activo', 'inactivo'],
    default: 'activo',
  })
  @IsOptional()
  @IsString()
  estado?: string;
}

