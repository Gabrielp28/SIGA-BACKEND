import { Module } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { GrupoController } from './grupo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { Carrera } from 'src/common/entities/carreras.entity';
import { Plan } from 'src/common/entities/planes.entity';
import { GrupoAsignaturaDocente } from 'src/common/entities/grupo_asignatura_docente.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo, Docente, Carrera, Plan, GrupoAsignaturaDocente, Asignatura])],
  controllers: [GrupoController],
  providers: [GrupoService],
  exports: [GrupoService],
})
export class GrupoModule {}

