import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { Plan } from 'src/common/entities/planes.entity';
import { PlanCarrera } from 'src/common/entities/plan_carrera.entity';
import { PlanCarreraAsignatura } from 'src/common/entities/plan_carrera_asignatura.entity';
import { Carrera } from 'src/common/entities/carreras.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      PlanCarrera,
      PlanCarreraAsignatura,
      Carrera,
      Asignatura,
    ]),
  ],
  controllers: [PlanController],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}

