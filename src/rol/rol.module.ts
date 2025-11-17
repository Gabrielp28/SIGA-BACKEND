import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from 'src/common/entities/roles.entity';
import { UsuarioRol } from 'src/common/entities/usuarios_roles.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { RolSeedService } from './rol-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, UsuarioRol, Usuario])],
  controllers: [RolController],
  providers: [RolService, RolSeedService],
  exports: [RolService],
})
export class RolModule {}

