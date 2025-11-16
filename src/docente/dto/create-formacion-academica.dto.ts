import { IsString, IsOptional, IsInt, MaxLength, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormacionAcademicaDto {
  @ApiProperty({ description: 'ID del docente', example: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id_docente: number;

  @ApiProperty({ description: 'Nivel de formación', example: 'Pregrado' })
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  nivel_formacion: string;

  @ApiProperty({ description: 'Título obtenido', example: 'Ingeniero en Sistemas' })
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'Institución educativa', example: 'Universidad Nacional' })
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  institucion: string;

  @ApiProperty({ description: 'Año de graduación', example: 2015, required: false })
  @IsInt()
  @Min(1900)
  @IsOptional()
  año_graduacion?: number;

  @ApiProperty({ description: 'País donde se obtuvo el título', example: 'Colombia', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  pais?: string;

  @ApiProperty({ description: 'URL o referencia del documento del título', required: false })
  @IsString()
  @IsOptional()
  documento_titulo?: string;
}

