import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Usuario } from './usuarios.entity';
import { Departamento } from './departamentos.entity';
import { CargoDocente } from './cargos_docentes.entity';
import { CargaDocente } from './carga_docentes.entity';
import { FormacionAcademica } from './formacion_academica.entity';
import { ExperienciaLaboral } from './experiencia_laboral.entity';
import { EvidenciaDocente } from './evidencias_docentes.entity';
import { Grupo } from './grupos.entity';
@Entity('Tbl_Docentes')
export class Docente {
  @PrimaryGeneratedColumn()
  id_docente: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'id_departamento' })
  departamento: Departamento;

  @ManyToOne(() => CargoDocente)
  @JoinColumn({ name: 'id_cargo' })
  cargo: CargoDocente;

  @Column({ length: 20, unique: true })
  codigo_docente: string;

  @Column({ length: 100 })
  nombres: string;

  @Column({ length: 100 })
  apellidos: string;

  @Column({ length: 20, unique: true })
  identificacion: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ length: 10, nullable: true })
  genero: string;

  @Column({ length: 10, default: 'activo' })
  estado: string;

  @Column({ type: 'date', nullable: true })
  fecha_ingreso: Date;

  @OneToMany(() => CargaDocente, carga => carga.docente)
  cargas: CargaDocente[];

  @OneToMany(() => Grupo, grupo => grupo.docente_titular)
  grupos: Grupo[];

  @OneToMany(() => FormacionAcademica, formacion => formacion.docente)
  formaciones: FormacionAcademica[];

  @OneToMany(() => ExperienciaLaboral, experiencia => experiencia.docente)
  experiencias: ExperienciaLaboral[];

  @OneToMany(() => EvidenciaDocente, evidencia => evidencia.docente)
  evidencias: EvidenciaDocente[];
}