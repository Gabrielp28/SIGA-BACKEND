
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Departamento } from './departamentos.entity';
import { Asignatura } from './asignaturas.entity';

@Entity('Tbl_Carreras')
export class Carrera {
  @PrimaryGeneratedColumn()
  id_carrera: number;

  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'id_departamento' })
  departamento: Departamento;

  @Column({ length: 200 })
  nombre_carrera: string;

  @Column({ length: 20, unique: true })
  codigo_carrera: string;

  @Column({ type: 'int', nullable: true })
  duracion_semestres: number;

  @Column({ length: 100, nullable: true })
  titulo_otorga: string;

  @Column({ length: 10, default: 'activa' })
  estado: string;

  @OneToMany(() => Asignatura, asig => asig.carrera)
  asignaturas: Asignatura[]; 
}