import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, ArrayMinSize, Min, ValidateIf, IsOptional } from 'class-validator';

export class CreatePlanCarreraAsignaturaDto {
  @ApiPropertyOptional({
    description: 'ID de una asignatura a agregar (para agregar una sola)',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @ValidateIf((o) => !o.id_asignaturas)
  id_asignatura?: number;

  @ApiPropertyOptional({
    description: 'Array de IDs de asignaturas a agregar (para agregar múltiples)',
    type: [Number],
    example: [1, 2, 3, 4, 5],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos una asignatura' })
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ValidateIf((o) => !o.id_asignatura)
  id_asignaturas?: number[];
}

