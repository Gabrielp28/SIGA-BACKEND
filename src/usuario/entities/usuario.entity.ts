import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuario')
export class usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ unique: true })
    correo: string;

    @Column()
    contraseña: string;

    @CreateDateColumn({ name: 'fecha_registro' })
    fechaRegistro: Date;
}
