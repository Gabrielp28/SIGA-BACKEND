import { ApiProperty } from '@nestjs/swagger';

export class DepartamentoDto {
@ApiProperty({ example: 2 })
id_departamento: number;

@ApiProperty({ example: 'Departamento de Informática' })
nombre_departamento: string;
}

export class AsignaturaDto {
@ApiProperty({ example: 1 })
id_asignatura: number;

@ApiProperty({ example: 'Programación I' })
nombre_asignatura: string;

@ApiProperty({ example: 'PRG101' })
codigo_asignatura: string;
}

export class ResponseCarreraDto {
@ApiProperty({ example: 1 })
id_carrera: number;

@ApiProperty({ example: 'Ingeniería en Sistemas' })
nombre_carrera: string;

@ApiProperty({ example: 'IS-001' })
codigo_carrera: string;

@ApiProperty({ example: 8, required: false })
duracion_semestres?: number;

@ApiProperty({ example: 'Ingeniero en Sistemas', required: false })
titulo_otorga?: string;

@ApiProperty({ example: 'activa' })
estado: string;

@ApiProperty({ type: DepartamentoDto })
departamento: DepartamentoDto;

@ApiProperty({ type: [AsignaturaDto], required: false })
asignaturas?: AsignaturaDto[];
}