import { Module } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from 'src/common/entities/docentes.entity';
import { CargoDocente } from 'src/common/entities/cargos_docentes.entity';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Docente, CargoDocente, Departamento, Usuario]),
  ],
  controllers: [DocenteController],
  providers: [DocenteService],
  exports: [DocenteService],
})
export class DocenteModule {}

