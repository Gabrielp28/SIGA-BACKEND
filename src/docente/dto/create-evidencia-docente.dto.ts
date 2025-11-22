import { IsString, IsOptional, IsInt, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvidenciaDocenteDto {
  @ApiProperty({ 
    description: 'ID de la asignatura (opcional)', 
    example: 1,
    required: false
  })
  @IsInt()
  @IsOptional()
  id_asignatura?: number;

  @ApiProperty({ 
    description: 'Tipo de evidencia', 
    example: 'plan_clase',
    enum: ['plan_clase', 'evaluacion', 'actividad', 'proyecto', 'otro']
  })
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  tipo_evidencia: string;

  @ApiProperty({ description: 'Nombre de la evidencia', example: 'Plan de Clase - Semana 1' })
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  nombre_evidencia: string;

  @ApiProperty({ description: 'Descripción de la evidencia', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ 
    description: 'URL del archivo (si no se sube archivo)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  archivo_url?: string;

  @ApiProperty({ 
    description: 'Periodo académico', 
    example: '2024-1',
    required: false
  })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  periodo_academico?: string;

  @ApiProperty({ 
    description: 'Estado de la evidencia', 
    example: 'pendiente',
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  })
  @IsString()
  @MaxLength(15)
  @IsOptional()
  estado?: string;

  @ApiProperty({ description: 'Observaciones', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

