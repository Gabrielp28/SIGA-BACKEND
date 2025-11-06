import { ApiProperty } from '@nestjs/swagger';

export class AsignaturaResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único de la asignatura' })
  id_asignatura: number;

  @ApiProperty({ example: 1, description: 'ID de la carrera a la que pertenece' })
  id_carrera: number;

  @ApiProperty({ example: 'MAT101', description: 'Código de la asignatura' })
  codigo_asignatura: string;

  @ApiProperty({ example: 'Matemática Básica', description: 'Nombre de la asignatura' })
  nombre_asignatura: string;

  @ApiProperty({ example: 4, description: 'Número de créditos asignados' })
  creditos: number;

  @ApiProperty({ example: 5, description: 'Horas semanales de clase' })
  horas_semanales: number;

  @ApiProperty({ example: 1, description: 'Semestre donde se imparte', nullable: true })
  semestre?: number;

  @ApiProperty({ example: 'obligatoria', description: 'Tipo de asignatura' })
  tipo: string;

  @ApiProperty({ example: 'activa', description: 'Estado actual de la asignatura' })
  estado: string;

  @ApiProperty({ example: 'NINGUNO', description: 'Prerequisitos de la asignatura', nullable: true })
  prerequisitos?: string;

  constructor(asignatura: any) {
    this.id_asignatura = asignatura.id_asignatura;
    this.id_carrera = asignatura.carrera?.id_carrera ?? asignatura.id_carrera;
    this.codigo_asignatura = asignatura.codigo_asignatura;
    this.nombre_asignatura = asignatura.nombre_asignatura;
    this.creditos = asignatura.creditos;
    this.horas_semanales = asignatura.horas_semanales;
    this.semestre = asignatura.semestre;
    this.tipo = asignatura.tipo;
    this.estado = asignatura.estado;
    this.prerequisitos = asignatura.prerequisitos;
  }
}
