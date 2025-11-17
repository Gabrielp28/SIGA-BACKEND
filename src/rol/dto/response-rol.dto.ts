import { ApiProperty } from '@nestjs/swagger';

export class ResponseRolDto {
  @ApiProperty({ example: 1 })
  id_rol: number;

  @ApiProperty({ example: 'Administrador' })
  nombre_rol: string;

  @ApiProperty({ example: 'Rol con acceso completo al sistema', required: false })
  descripcion?: string;

  @ApiProperty({ example: 1 })
  nivel_acceso: number;
}

export class ResponseAsignarRolDto {
  @ApiProperty({ example: 1 })
  id_usuario_rol: number;

  @ApiProperty({ example: 1 })
  id_usuario: number;

  @ApiProperty({ example: 1 })
  id_rol: number;

  @ApiProperty({ example: 'activo' })
  estado: string;

  @ApiProperty({ type: ResponseRolDto })
  rol: ResponseRolDto;
}

