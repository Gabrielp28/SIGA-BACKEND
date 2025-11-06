import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateDepartamentoDto {
  @ApiProperty({
    example: 'Departamento de Informática',
    description: 'Nombre del departamento'
  })
  @IsString()
  @MaxLength(100)
  nombre_departamento: string;

  @ApiProperty({
    example: 'INF01',
    description: 'Código único del departamento'
  })
  @IsString()
  @MaxLength(10)
  codigo_departamento: string;

  @ApiProperty({
    example: 'activo',
    required: false,
    description: 'Estado del departamento (activo/inactivo)'
  })
  @IsString()
  @IsOptional()
  estado?: string;
}