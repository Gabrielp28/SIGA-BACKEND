import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseGrupoDto {
  @ApiProperty({ example: 1 })
  id_grupo: number;

  @ApiProperty({ example: 1, description: 'ID de la asignatura' })
  id_asignatura: number;

  @ApiProperty({ example: 'GRUPO-001' })
  codigo_grupo: string;

  @ApiPropertyOptional({ example: 'Grupo Matutino A' })
  nombre_grupo?: string;

  @ApiProperty({ example: '2024-1' })
  periodo_academico: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del docente titular' })
  id_docente_titular?: number;

  @ApiProperty({ example: 'activo' })
  estado: string;
}

