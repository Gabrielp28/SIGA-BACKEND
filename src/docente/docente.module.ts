import { Module } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';
import { CargoDocenteController } from './cargo-docente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from 'src/common/entities/docentes.entity';
import { CargoDocente } from 'src/common/entities/cargos_docentes.entity';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { FormacionAcademica } from 'src/common/entities/formacion_academica.entity';
import { ExperienciaLaboral } from 'src/common/entities/experiencia_laboral.entity';
import { EvidenciaDocente } from 'src/common/entities/evidencias_docentes.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { StorageModule } from 'src/storage/storage.module';
import { EvidenciasDocenteService } from './evidencias-docente.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Docente,
      CargoDocente,
      Departamento,
      FormacionAcademica,
      ExperienciaLaboral,
      EvidenciaDocente,
      Asignatura,
    ]),
    StorageModule,
  ],
  controllers: [DocenteController, CargoDocenteController],
  providers: [DocenteService, EvidenciasDocenteService],
  exports: [DocenteService, EvidenciasDocenteService],
})
export class DocenteModule {}

