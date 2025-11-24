import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, MaxLength, Min } from 'class-validator';

export class UpdateGrupoAsignaturaDocenteDto {
  @ApiPropertyOptional({
    description: 'ID del docente que imparte la asignatura en el grupo',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  id_docente?: number;

  @ApiPropertyOptional({
    description: 'Estado de la asignación',
    example: 'activa',
    enum: ['activa', 'finalizada', 'cancelada'],
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

