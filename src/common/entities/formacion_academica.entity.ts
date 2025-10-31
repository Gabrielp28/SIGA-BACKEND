import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Docente } from './docentes.entity';

@Entity('Tbl_Formacion_Academica')
export class FormacionAcademica {
  @PrimaryGeneratedColumn()
  id_formacion: number;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: 'id_docente' })
  docente: Docente;

  @Column({ length: 20 })
  nivel_formacion: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ length: 200 })
  institucion: string;

  @Column({ type: 'int', nullable: true })
  año_graduacion: number;

  @Column({ length: 100, nullable: true })
  pais: string;

  @Column({ nullable: true })
  documento_titulo: string;
}