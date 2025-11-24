import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Docente } from './docentes.entity';
import { Carrera } from './carreras.entity';
import { GrupoAsignaturaDocente } from './grupo_asignatura_docente.entity';

@Entity('Tbl_Grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id_grupo: number;

  @Column({ length: 20 })
  codigo_grupo: string;

  @Column({ length: 100, nullable: true })
  nombre_grupo: string;

  @Column({ length: 20 })
  periodo_academico: string;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'id_carrera' })
  carrera: Carrera;

  @ManyToOne(() => Docente, { nullable: true })
  @JoinColumn({ name: 'id_docente_titular' })
  docente_titular: Docente | null;

  @Column({ type: 'int', nullable: true })
  min_asignaturas: number;

  @Column({ type: 'int', nullable: true })
  max_asignaturas: number;

  @Column({ length: 15, default: 'activo' })
  estado: string;

  @OneToMany(() => GrupoAsignaturaDocente, grupoAsig => grupoAsig.grupo)
  asignaturas_docentes: GrupoAsignaturaDocente[];
}