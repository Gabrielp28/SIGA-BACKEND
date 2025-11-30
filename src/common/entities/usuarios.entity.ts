import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UsuarioRol } from './usuarios_roles.entity';

@Entity('Tbl_Usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  email: string;

  @Column({
    length: 10,
    default: 'activo'
  })
  estado: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_ultimo_acceso: Date;

  @OneToMany(() => UsuarioRol, usuarioRol => usuarioRol.usuario)
  usuarioRoles: UsuarioRol[];
}