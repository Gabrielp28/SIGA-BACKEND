import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AsignarRolDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario al que se le asignará el rol'
  })
  @IsNumber()
  id_usuario: number;

  @ApiProperty({
    example: 1,
    description: 'ID del rol a asignar'
  })
  @IsNumber()
  id_rol: number;

  @ApiProperty({
    example: 'activo',
    required: false,
    description: 'Estado de la asignación (activo/inactivo)',
    default: 'activo'
  })
  @IsString()
  @IsOptional()
  estado?: string;
}

