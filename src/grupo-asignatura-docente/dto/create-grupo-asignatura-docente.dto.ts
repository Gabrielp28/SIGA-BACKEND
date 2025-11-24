import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateGrupoAsignaturaDocenteDto {
  @ApiProperty({
    description: 'ID del grupo',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id_grupo: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id_asignatura: number;

  @ApiProperty({
    description: 'ID del docente que imparte la asignatura en el grupo',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id_docente: number;

  @ApiPropertyOptional({
    description: 'Estado de la asignación',
    example: 'activa',
    enum: ['activa', 'finalizada', 'cancelada'],
    default: 'activa',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  estado?: string;

  @ApiPropertyOptional({
    description: 'Observaciones sobre la asignación',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

