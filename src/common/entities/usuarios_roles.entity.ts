import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column
} from 'typeorm';
import { Usuario } from './usuarios.entity';
import { Rol } from './roles.entity';

@Entity('Tbl_Usuario_Roles')
export class UsuarioRol {
  @PrimaryGeneratedColumn()
  id_usuario_rol: number;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ name: 'id_rol' })
  id_rol: number;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @Column({ length: 10, default: 'activo' })
  estado: string;
}