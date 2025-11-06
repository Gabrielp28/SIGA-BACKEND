import { Module } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from 'src/common/entities/carreras.entity';
import { Departamento } from 'src/common/entities/departamentos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera,Departamento])],
  controllers: [CarreraController],
  providers: [CarreraService],
})
export class CarreraModule {}
