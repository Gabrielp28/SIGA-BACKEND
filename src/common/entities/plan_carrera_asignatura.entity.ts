import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { PlanCarrera } from './plan_carrera.entity';
import { Asignatura } from './asignaturas.entity';

@Entity('Tbl_Plan_Carrera_Asignatura')
@Unique(['planCarrera', 'asignatura']) // Una asignatura no puede estar duplicada en el mismo plan-carrera
export class PlanCarreraAsignatura {
  @PrimaryGeneratedColumn()
  id_plan_carrera_asignatura: number;

  @ManyToOne(() => PlanCarrera, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_plan_carrera' })
  planCarrera: PlanCarrera;

  @ManyToOne(() => Asignatura)
  @JoinColumn({ name: 'id_asignatura' })
  asignatura: Asignatura;
}

