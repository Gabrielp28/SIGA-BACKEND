import { Module } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { GrupoController } from './grupo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { Docente } from 'src/common/entities/docentes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo, Asignatura, Docente])],
  controllers: [GrupoController],
  providers: [GrupoService],
  exports: [GrupoService],
})
export class GrupoModule {}

