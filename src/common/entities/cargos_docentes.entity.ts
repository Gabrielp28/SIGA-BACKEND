import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Tbl_Cargos_Docentes')
export class CargoDocente {
  @PrimaryGeneratedColumn()
  id_cargo: number;

  @Column({ length: 100 })
  nombre_cargo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int' })
  max_asignaturas: number;

  @Column({ type: 'int', default: 0 })
  min_asignaturas: number;

  @Column({ length: 10, default: 'activo' })
  estado: string;
}