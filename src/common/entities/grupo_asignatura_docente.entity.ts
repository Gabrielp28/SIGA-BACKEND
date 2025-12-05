import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  OneToMany,
} from 'typeorm';
import { Grupo } from './grupos.entity';
import { Asignatura } from './asignaturas.entity';
import { Docente } from './docentes.entity';
import { Usuario } from './usuarios.entity';
import { CargaDocenteVersion } from './carga_docente_version.entity';

@Entity('Tbl_Grupo_Asignatura_Docente')
@Unique(['grupo', 'asignatura']) // Un grupo no puede tener la misma asignatura duplicada
@Index(['grupo', 'docente']) // Índice para búsquedas rápidas
export class GrupoAsignaturaDocente {
  @PrimaryGeneratedColumn()
  id_grupo_asignatura_docente: number;

  @ManyToOne(() => Grupo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_grupo' })
  grupo: Grupo;

  @ManyToOne(() => Asignatura)
  @JoinColumn({ name: 'id_asignatura' })
  asignatura: Asignatura;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: 'id_docente' })
  docente: Docente;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_asignacion: Date;

  @Column({ length: 15, default: 'activa' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // Campos de aprobación
  @Column({
    type: 'varchar',
    length: 50,
    default: 'borrador',
  })
  estado_aprobacion: string; // 'borrador', 'pendiente_revision', 'revisada', 'pendiente_aprobacion', 'aprobada', 'rechazada'

  // Tracking de usuarios
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_coordinador_carrera' })
  coordinador_carrera: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_director_departamento' })
  director_departamento: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_administrador' })
  administrador: Usuario | null;

  // Fechas del flujo
  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion_inicial: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_revision: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_aprobacion_final: Date | null;

  // Observaciones por rol
  @Column({ type: 'text', nullable: true })
  observaciones_coordinador: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones_director: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones_administrador: string | null;

  // Versión actual
  @Column({ type: 'int', default: 1 })
  version_actual: number;

  // Relación con versiones
  @OneToMany(() => CargaDocenteVersion, version => version.grupo_asignatura_docente)
  versiones: CargaDocenteVersion[];
}

