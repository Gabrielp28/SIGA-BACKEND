import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { PlanCarrera } from './plan_carrera.entity';
import { Grupo } from './grupos.entity';

@Entity('Tbl_Planes')
export class Plan {
  @PrimaryGeneratedColumn()
  id_plan: number;

  @Column({ length: 100 })
  nombre_plan: string;

  @Column({ length: 20, unique: true })
  codigo_plan: string;

  @Column({ type: 'int' })
  año: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 10, default: 'activo' })
  estado: string;

  @Column({ type: 'date', nullable: true })
  fecha_inicio: Date | null;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date | null;

  @OneToMany(() => PlanCarrera, planCarrera => planCarrera.plan)
  carreras: PlanCarrera[];

  @OneToMany(() => Grupo, grupo => grupo.plan)
  grupos: Grupo[];
}

