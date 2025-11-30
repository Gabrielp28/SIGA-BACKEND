import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Plan } from './planes.entity';
import { Carrera } from './carreras.entity';
import { PlanCarreraAsignatura } from './plan_carrera_asignatura.entity';

@Entity('Tbl_Plan_Carrera')
@Unique(['plan', 'carrera']) // Un plan no puede tener la misma carrera duplicada
export class PlanCarrera {
  @PrimaryGeneratedColumn()
  id_plan_carrera: number;

  @ManyToOne(() => Plan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_plan' })
  plan: Plan;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'id_carrera' })
  carrera: Carrera;

  @OneToMany(() => PlanCarreraAsignatura, planCarreraAsig => planCarreraAsig.planCarrera)
  asignaturas: PlanCarreraAsignatura[];
}

