import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Tbl_Departamentos')
export class Departamento {
  
  @PrimaryGeneratedColumn()
  id_departamento: number;

  @Column({ length: 100 })
  nombre_departamento: string;

  @Column({ length: 10, unique: true })
  codigo_departamento: string;

  @Column({ length: 10, default: 'activo' })
  estado: string;
}
