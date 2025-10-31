import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Carrera } from './carreras.entity';
import { Grupo } from './grupos.entity';
import { EvidenciaDocente } from './evidencias_docentes.entity';

@Entity('Tbl_Asignaturas')
export class Asignatura {
  @PrimaryGeneratedColumn()
  id_asignatura: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'id_carrera' })
  carrera: Carrera;

  @Column({ length: 20, unique: true })
  codigo_asignatura: string;

  @Column({ length: 200 })
  nombre_asignatura: string;

  @Column()
  creditos: number;

  @Column()
  horas_semanales: number;

  @Column({ type: 'int', nullable: true })
  semestre: number;

  @Column({ length: 15, default: 'obligatoria' })
  tipo: string;

  @Column({ length: 10, default: 'activa' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  prerequisitos: string;

  @OneToMany(() => Grupo, grupo => grupo.asignatura)
  grupos: Grupo[];

  @OneToMany(() => EvidenciaDocente, evidencia => evidencia.asignatura)
  evidencias: EvidenciaDocente[];
}