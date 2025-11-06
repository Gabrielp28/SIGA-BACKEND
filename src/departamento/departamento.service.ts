import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepo: Repository<Departamento>,
  ) {}

  create(createDto: CreateDepartamentoDto) {
    const newDepto = this.departamentoRepo.create(createDto);
    return this.departamentoRepo.save(newDepto);
  }

  findAll() {
    return this.departamentoRepo.find();
  } 

}