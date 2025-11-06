import { ApiProperty } from '@nestjs/swagger';

export class ResponseDepartamentoDto {
  @ApiProperty({ example: 1 })
  id_departamento: number;

  @ApiProperty({ example: 'Departamento de Informática' })
  nombre_departamento: string;

  @ApiProperty({ example: 'INF01' })
  codigo_departamento: string;

  @ApiProperty({ example: 'activo' })
  estado: string;
}