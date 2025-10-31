import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Docente } from './docentes.entity';
import { Grupo } from './grupos.entity';

@Entity('Tbl_Carga_Docente')
export class CargaDocente {
  @PrimaryGeneratedColumn()
  id_carga: number;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: 'id_docente' })
  docente: Docente;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'id_grupo' })
  grupo: Grupo;

  @Column({ default: 'titular' })
  tipo_vinculacion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_asignacion: Date;

  @Column({ length: 15, default: 'asignada' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}