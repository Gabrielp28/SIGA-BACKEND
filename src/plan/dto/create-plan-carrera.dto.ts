import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ArrayMinSize, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PlanCarreraItemDto {
  @ApiProperty({
    description: 'ID de la carrera',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  id_carrera: number;
}

export class CreatePlanCarreraDto {
  @ApiProperty({
    description: 'Array de IDs de carreras a agregar al plan',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos una carrera' })
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  id_carreras: number[];
}

