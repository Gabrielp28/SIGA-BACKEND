import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional, IsObject } from 'class-validator';

export class RevisarCargaDto {
  @ApiProperty({
    description: 'Indica si la revisión fue aprobada o rechazada',
    example: true,
  })
  @IsBoolean()
  aprobado: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones del director de departamento',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Cambios realizados durante la revisión (opcional)',
    example: {
      id_docente: 2,
      estado: 'activa',
    },
  })
  @IsOptional()
  @IsObject()
  cambios?: Record<string, any>;
}

