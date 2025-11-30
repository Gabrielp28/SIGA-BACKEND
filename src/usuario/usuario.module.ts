import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from '../common/entities/usuarios.entity';
import { UsuarioRol } from '../common/entities/usuarios_roles.entity';
import { Rol } from '../common/entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioRol, Rol])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
