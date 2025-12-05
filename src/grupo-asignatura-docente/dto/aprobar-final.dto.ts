import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AprobarFinalDto {
  @ApiPropertyOptional({
    description: 'Observaciones del administrador al aprobar final',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

