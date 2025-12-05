import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoAsignaturaDocenteService } from './grupo-asignatura-docente.service';
import { GrupoAsignaturaDocenteController } from './grupo-asignatura-docente.controller';
import { GrupoAsignaturaDocente } from 'src/common/entities/grupo_asignatura_docente.entity';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { PlanCarrera } from 'src/common/entities/plan_carrera.entity';
import { PlanCarreraAsignatura } from 'src/common/entities/plan_carrera_asignatura.entity';
import { CargaDocenteVersion } from 'src/common/entities/carga_docente_version.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GrupoAsignaturaDocente,
      Grupo,
      Asignatura,
      Docente,
      PlanCarrera,
      PlanCarreraAsignatura,
      CargaDocenteVersion,
      Usuario,
    ]),
  ],
  controllers: [GrupoAsignaturaDocenteController],
  providers: [GrupoAsignaturaDocenteService],
  exports: [GrupoAsignaturaDocenteService],
})
export class GrupoAsignaturaDocenteModule {}

