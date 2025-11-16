import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargaDocenteService } from './carga-docente.service';
import { CargaDocenteController } from './carga-docente.controller';
import { CargaDocente } from 'src/common/entities/carga_docentes.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { Grupo } from 'src/common/entities/grupos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CargaDocente, Docente, Grupo])],
  controllers: [CargaDocenteController],
  providers: [CargaDocenteService],
  exports: [CargaDocenteService],
})
export class CargaDocenteModule {}

