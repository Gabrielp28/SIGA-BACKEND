import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Docente } from './docentes.entity';
import { Asignatura } from './asignaturas.entity';

@Entity('Tbl_Evidencias_Docentes')
export class EvidenciaDocente {
  @PrimaryGeneratedColumn()
  id_evidencia: number;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: 'id_docente' })
  docente: Docente;

  @ManyToOne(() => Asignatura, { nullable: true })
  @JoinColumn({ name: 'id_asignatura' })
  asignatura: Asignatura;

  @Column({ length: 20 })
  tipo_evidencia: string;

  @Column({ length: 200 })
  nombre_evidencia: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 500, nullable: true })
  archivo_url: string;

  @Column({ length: 20, nullable: true })
  periodo_academico: string;

  @Column({ length: 15, default: 'pendiente' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}