import { IsString, IsOptional, IsInt, MaxLength, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCargoDocenteDto {
  @ApiProperty({ description: 'Nombre del cargo', example: 'Profesor Titular' })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  nombre_cargo: string;

  @ApiProperty({ description: 'Descripción del cargo', example: 'Profesor con dedicación completa', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Máximo de asignaturas permitidas', example: 5 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  max_asignaturas: number;

  @ApiProperty({ description: 'Mínimo de asignaturas requeridas', example: 2, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  min_asignaturas?: number;

  @ApiProperty({ description: 'Estado del cargo', example: 'activo', required: false })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  estado?: string;
}

