import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Asignatura } from './asignaturas.entity';
import { Docente } from './docentes.entity';
import { CargaDocente } from './carga_docentes.entity';

@Entity('Tbl_Grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id_grupo: number;

  @ManyToOne(() => Asignatura)
  @JoinColumn({ name: 'id_asignatura' })
  asignatura: Asignatura;

  @Column({ length: 20 })
  codigo_grupo: string;

  @Column({ length: 100, nullable: true })
  nombre_grupo: string;

  @Column({ length: 20 })
  periodo_academico: string;

  @ManyToOne(() => Docente, { nullable: true })
  @JoinColumn({ name: 'id_docente_titular' })
  docente_titular: Docente;

  @Column({ length: 15, default: 'activo' })
  estado: string;

  @OneToMany(() => CargaDocente, carga => carga.grupo)
  cargas: CargaDocente[];
}