import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index
} from 'typeorm';
import { Grupo } from './grupos.entity';
import { Asignatura } from './asignaturas.entity';
import { Docente } from './docentes.entity';

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
  observaciones: string;
}

