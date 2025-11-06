import { Module } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { AsignaturasController } from './asignaturas.controller';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from 'src/common/entities/carreras.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Asignatura,Carrera])],
  controllers: [AsignaturasController],
  providers: [AsignaturasService],
})
export class AsignaturasModule {}
