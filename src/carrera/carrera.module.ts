import { Module } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from 'src/common/entities/carreras.entity';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';
import { UsuarioRol } from 'src/common/entities/usuarios_roles.entity';
import { Rol } from 'src/common/entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera, Departamento, Usuario, UsuarioRol, Rol])],
  controllers: [CarreraController],
  providers: [CarreraService],
})
export class CarreraModule {}
