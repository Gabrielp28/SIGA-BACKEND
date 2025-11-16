import { IsString, IsOptional, IsInt, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCargaDocenteDto {
  @ApiProperty({ description: 'ID del docente', example: 1 })
  @IsInt()
  @IsNotEmpty()
  id_docente: number;

  @ApiProperty({ description: 'ID del grupo', example: 1 })
  @IsInt()
  @IsNotEmpty()
  id_grupo: number;

  @ApiProperty({ 
    description: 'Tipo de vinculación', 
    example: 'titular',
    enum: ['titular', 'suplente', 'auxiliar', 'coordinador'],
    default: 'titular'
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  tipo_vinculacion?: string;

  @ApiProperty({ 
    description: 'Estado de la carga', 
    example: 'asignada',
    enum: ['asignada', 'finalizada', 'cancelada'],
    default: 'asignada'
  })
  @IsString()
  @MaxLength(15)
  @IsOptional()
  estado?: string;

  @ApiProperty({ description: 'Observaciones sobre la asignación', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

