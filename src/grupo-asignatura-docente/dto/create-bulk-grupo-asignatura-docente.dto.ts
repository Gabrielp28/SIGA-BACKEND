import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  MaxLength,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AsignaturaDocenteItemDto {
  @ApiProperty({
    description: 'ID de la asignatura que debe pertenecer al plan y carrera del grupo',
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
}

export class CreateBulkGrupoAsignaturaDocenteDto {
  @ApiProperty({
    description: 'ID del grupo. El grupo debe tener un plan y carrera asignados.',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id_grupo: number;

  @ApiProperty({
    description: 'ID del plan de estudios. Debe coincidir con el plan del grupo. Las asignaturas deben pertenecer a este plan. Útil cuando se trabaja desde el módulo de Planes.',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id_plan: number;

  @ApiProperty({
    description: 'Array de asignaturas con sus respectivos docentes. Las asignaturas deben estar disponibles en el plan del grupo para la carrera del grupo.',
    type: [AsignaturaDocenteItemDto],
    example: [
      { id_asignatura: 1, id_docente: 1 },
      { id_asignatura: 2, id_docente: 2 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos una asignatura con docente' })
  @ValidateNested({ each: true })
  @Type(() => AsignaturaDocenteItemDto)
  asignaturas_docentes: AsignaturaDocenteItemDto[];

  @ApiPropertyOptional({
    description: 'Estado de las asignaciones',
    example: 'activa',
    enum: ['activa', 'finalizada', 'cancelada'],
    default: 'activa',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  estado?: string;

  @ApiPropertyOptional({
    description: 'Observaciones sobre las asignaciones',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

