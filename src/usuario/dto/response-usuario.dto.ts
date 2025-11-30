import { ApiProperty } from '@nestjs/swagger';

export class RolResponseDto {
  @ApiProperty({ example: 3 })
  id_rol: number;

  @ApiProperty({ example: 'docentes' })
  nombre_rol: string;

  @ApiProperty({ example: 'Rol de docente', required: false })
  descripcion?: string;

  @ApiProperty({ example: 1 })
  nivel_acceso: number;
}

export class UsuarioRolResponseDto {
  @ApiProperty({ example: 1 })
  id_usuario_rol: number;

  @ApiProperty({ example: 'activo' })
  estado: string;

  @ApiProperty({ type: RolResponseDto })
  rol: RolResponseDto;
}

export class UsuarioResponseDto {
  @ApiProperty({ example: 6 })
  id_usuario: number;

  @ApiProperty({ example: 'jon' })
  username: string;

  @ApiProperty({ example: 'john.d@example.com' })
  email: string;

  @ApiProperty({ example: 'activo' })
  estado: string;

  @ApiProperty({ example: '2025-11-18T03:56:40.796Z' })
  fecha_creacion: Date;

  @ApiProperty({ example: null, required: false })
  fecha_ultimo_acceso?: Date;

  @ApiProperty({ type: [UsuarioRolResponseDto], required: false })
  roles?: UsuarioRolResponseDto[];
}

