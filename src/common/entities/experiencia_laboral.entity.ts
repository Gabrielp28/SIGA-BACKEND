import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Docente } from './docentes.entity';

@Entity('Tbl_Experiencia_Laboral')
export class ExperienciaLaboral {
  @PrimaryGeneratedColumn()
  id_experiencia: number;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: 'id_docente' })
  docente: Docente;

  @Column({ length: 150 })
  cargo_ejercido: string;

  @Column({ length: 200 })
  institucion_empresa: string;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'text', nullable: true })
  descripcion_funciones: string;
}