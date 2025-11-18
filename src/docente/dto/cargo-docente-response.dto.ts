import { ApiProperty } from '@nestjs/swagger';
import { CargoDocente } from 'src/common/entities/cargos_docentes.entity';

export class CargoDocenteResponseDto {
  @ApiProperty()
  id_cargo: number;

  @ApiProperty()
  nombre_cargo: string;

  @ApiProperty({ required: false, nullable: true })
  descripcion?: string;

  @ApiProperty()
  max_asignaturas: number;

  @ApiProperty()
  min_asignaturas: number;

  @ApiProperty()
  estado: string;

  static fromEntity(entity: CargoDocente): CargoDocenteResponseDto {
    const dto = new CargoDocenteResponseDto();
    dto.id_cargo = entity.id_cargo;
    dto.nombre_cargo = entity.nombre_cargo;
    dto.descripcion = entity.descripcion ?? null;
    dto.max_asignaturas = entity.max_asignaturas;
    dto.min_asignaturas = entity.min_asignaturas;
    dto.estado = entity.estado;
    return dto;
  }

  static fromEntities(entities: CargoDocente[]): CargoDocenteResponseDto[] {
    return entities.map(CargoDocenteResponseDto.fromEntity);
  }
}

