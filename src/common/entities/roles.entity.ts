import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Tbl_Roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id_rol: number;

  @Column({ length: 50 })
  nombre_rol: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int', default: 1 })
  nivel_acceso: number;
}