import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ArrayMinSize, Min } from 'class-validator';

export class CreatePlanCarreraAsignaturaDto {
  @ApiProperty({
    description: 'ID del plan-carrera',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  id_plan_carrera: number;

  @ApiProperty({
    description: 'Array de IDs de asignaturas a agregar al plan-carrera',
    type: [Number],
    example: [1, 2, 3, 4, 5],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos una asignatura' })
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  id_asignaturas: number[];
}

