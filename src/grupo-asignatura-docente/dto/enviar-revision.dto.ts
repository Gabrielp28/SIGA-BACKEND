import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class EnviarRevisionDto {
  @ApiPropertyOptional({
    description: 'Observaciones del coordinador al enviar a revisión',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

