import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreatePlanCarreraDto {
  @ApiProperty({
    description: 'ID de la carrera a asignar al plan (solo una carrera por plan)',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  id_carrera: number;
}

