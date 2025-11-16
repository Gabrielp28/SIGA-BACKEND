import { IsString, IsOptional, IsDateString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExperienciaLaboralDto {
  @ApiProperty({ description: 'ID del docente', example: 1 })
  @IsNotEmpty()
  id_docente: number;

  @ApiProperty({ description: 'Cargo ejercido', example: 'Profesor Titular' })
  @IsString()
  @MaxLength(150)
  @IsNotEmpty()
  cargo_ejercido: string;

  @ApiProperty({ description: 'Institución o empresa', example: 'Universidad Nacional' })
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  institucion_empresa: string;

  @ApiProperty({ description: 'Fecha de inicio', example: '2020-01-15' })
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @ApiProperty({ description: 'Fecha de fin', example: '2023-12-31', required: false })
  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @ApiProperty({ description: 'Descripción de funciones', required: false })
  @IsString()
  @IsOptional()
  descripcion_funciones?: string;
}

