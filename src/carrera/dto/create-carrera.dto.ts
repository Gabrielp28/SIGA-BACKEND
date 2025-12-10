import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCarreraDto {
@ApiProperty({ description: 'Nombre de la carrera', example: 'Ingeniería en Sistemas' })
@IsString()
@MaxLength(200)
nombre_carrera: string;

@ApiProperty({ description: 'Código único de la carrera', example: 'IS-001' })
@IsString()
@MaxLength(20)
codigo_carrera: string;

@ApiProperty({ description: 'Duración en semestres', example: 8, required: false })
@IsInt()
@IsOptional()
duracion_semestres?: number;

@ApiProperty({ description: 'Título otorgado', example: 'Ingeniero en Sistemas', required: false })
@IsString()
@MaxLength(100)
@IsOptional()
titulo_otorga?: string;

@ApiProperty({ description: 'Estado de la carrera', example: 'activa', required: false })
@IsString()
@IsOptional()
estado?: string;

@ApiProperty({ description: 'ID del departamento', example: 2 })
@IsInt()
id_departamento: number;

@ApiProperty({ description: 'ID del coordinador de carrera (usuario con rol Coordinador de carrera)', example: 1, required: false })
@IsInt()
@IsOptional()
id_coordinador?: number;
}
