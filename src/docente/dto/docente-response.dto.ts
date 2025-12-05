import { ApiProperty } from '@nestjs/swagger';
import { Docente } from 'src/common/entities/docentes.entity';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { CargoDocente } from 'src/common/entities/cargos_docentes.entity';
import { FormacionAcademica } from 'src/common/entities/formacion_academica.entity';
import { ExperienciaLaboral } from 'src/common/entities/experiencia_laboral.entity';

class DepartamentoResumenDto {
  @ApiProperty()
  id_departamento: number;

  @ApiProperty()
  nombre_departamento: string;

  static fromEntity(departamento?: Departamento): DepartamentoResumenDto | null {
    if (!departamento) {
      return null;
    }
    const dto = new DepartamentoResumenDto();
    dto.id_departamento = departamento.id_departamento;
    dto.nombre_departamento = departamento.nombre_departamento;
    return dto;
  }
}

class CargoResumenDto {
  @ApiProperty()
  id_cargo: number;

  @ApiProperty()
  nombre_cargo: string;

  static fromEntity(cargo?: CargoDocente): CargoResumenDto | null {
    if (!cargo) {
      return null;
    }
    const dto = new CargoResumenDto();
    dto.id_cargo = cargo.id_cargo;
    dto.nombre_cargo = cargo.nombre_cargo;
    return dto;
  }
}

class FormacionResumenDto {
  @ApiProperty()
  id_formacion: number;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  institucion: string;

  @ApiProperty()
  nivel_formacion: string;

  static fromEntity(formacion: FormacionAcademica): FormacionResumenDto {
    const dto = new FormacionResumenDto();
    dto.id_formacion = formacion.id_formacion;
    dto.titulo = formacion.titulo;
    dto.institucion = formacion.institucion;
    dto.nivel_formacion = formacion.nivel_formacion;
    return dto;
  }
}

class ExperienciaResumenDto {
  @ApiProperty()
  id_experiencia: number;

  @ApiProperty()
  cargo_ejercido: string;

  @ApiProperty()
  institucion_empresa: string;

  @ApiProperty({ required: false, nullable: true })
  documento_url?: string | null;

  static fromEntity(experiencia: ExperienciaLaboral): ExperienciaResumenDto {
    const dto = new ExperienciaResumenDto();
    dto.id_experiencia = experiencia.id_experiencia;
    dto.cargo_ejercido = experiencia.cargo_ejercido;
    dto.institucion_empresa = experiencia.institucion_empresa;
    dto.documento_url = experiencia.documento_url ?? null;
    return dto;
  }
}

export class DocenteResponseDto {
  @ApiProperty()
  id_docente: number;

  @ApiProperty()
  codigo_docente: string;

  @ApiProperty()
  nombres: string;

  @ApiProperty()
  apellidos: string;

  @ApiProperty()
  identificacion: string;

  @ApiProperty({ required: false, nullable: true })
  fecha_nacimiento?: Date;

  @ApiProperty({ required: false, nullable: true })
  genero?: string;

  @ApiProperty()
  estado: string;

  @ApiProperty({ required: false, nullable: true })
  fecha_ingreso?: Date;

  @ApiProperty({ required: false, nullable: true, description: 'URL de la foto de perfil' })
  foto_perfil?: string | null;

  @ApiProperty({ type: DepartamentoResumenDto, nullable: true })
  departamento?: DepartamentoResumenDto | null;

  @ApiProperty({ type: CargoResumenDto, nullable: true })
  cargo?: CargoResumenDto | null;

  @ApiProperty({ type: [FormacionResumenDto], required: false })
  formaciones?: FormacionResumenDto[];

  @ApiProperty({ type: [ExperienciaResumenDto], required: false })
  experiencias?: ExperienciaResumenDto[];

  static fromEntity(entity: Docente): DocenteResponseDto {
    const dto = new DocenteResponseDto();
    dto.id_docente = entity.id_docente;
    dto.codigo_docente = entity.codigo_docente;
    dto.nombres = entity.nombres;
    dto.apellidos = entity.apellidos;
    dto.identificacion = entity.identificacion;
    dto.fecha_nacimiento = entity.fecha_nacimiento ?? null;
    dto.genero = entity.genero ?? null;
    dto.estado = entity.estado;
    dto.fecha_ingreso = entity.fecha_ingreso ?? null;
    dto.foto_perfil = entity.foto_perfil ?? null;
    dto.departamento = DepartamentoResumenDto.fromEntity(entity.departamento);
    dto.cargo = CargoResumenDto.fromEntity(entity.cargo);
    dto.formaciones = entity.formaciones
      ? entity.formaciones.map(FormacionResumenDto.fromEntity)
      : [];
    dto.experiencias = entity.experiencias
      ? entity.experiencias.map(ExperienciaResumenDto.fromEntity)
      : [];
    return dto;
  }

  static fromEntities(entities: Docente[]): DocenteResponseDto[] {
    return entities.map(DocenteResponseDto.fromEntity);
  }
}

