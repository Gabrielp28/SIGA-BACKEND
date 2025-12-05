import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { GrupoAsignaturaDocente } from './grupo_asignatura_docente.entity';
import { Usuario } from './usuarios.entity';

export enum EstadoVersion {
  INICIAL = 'inicial',
  REVISADA = 'revisada',
  APROBADA = 'aprobada',
}

@Entity('Tbl_Carga_Docente_Version')
@Index(['grupo_asignatura_docente', 'version'])
export class CargaDocenteVersion {
  @PrimaryGeneratedColumn()
  id_version: number;

  @ManyToOne(() => GrupoAsignaturaDocente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_grupo_asignatura_docente' })
  grupo_asignatura_docente: GrupoAsignaturaDocente;

  @Column({ type: 'int' })
  version: number; // 1, 2, 3, etc.

  @Column({
    type: 'varchar',
    length: 50,
    default: EstadoVersion.INICIAL,
  })
  estado_version: EstadoVersion; // 'inicial', 'revisada', 'aprobada'

  // Usuarios involucrados
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario_creador' })
  usuario_creador: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario_revisor' })
  usuario_revisor: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario_aprobador' })
  usuario_aprobador: Usuario | null;

  // Fechas del flujo
  @CreateDateColumn()
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_revision: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_aprobacion: Date | null;

  // Datos de la versión (snapshot de los datos en ese momento)
  @Column({ type: 'jsonb', nullable: true })
  datos_version: {
    id_grupo: number;
    id_asignatura: number;
    id_docente: number;
    estado: string;
    observaciones?: string;
  };

  // Cambios respecto a versión anterior
  @Column({ type: 'jsonb', nullable: true })
  cambios: Array<{
    campo: string;
    valor_anterior: any;
    valor_nuevo: any;
  }> | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'boolean', default: false })
  activa: boolean; // Indica si esta es la versión activa actual
}

