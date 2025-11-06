import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { QueryDepartamentoDto } from './dto/query-departamento.dto';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepo: Repository<Departamento>,
  ) {}

  async create(createDto: CreateDepartamentoDto): Promise<Departamento> {
    const newDepto = this.departamentoRepo.create({
      ...createDto,
      estado: createDto.estado || 'activo',
    });
    return await this.departamentoRepo.save(newDepto);
  }

  async findAll(query?: QueryDepartamentoDto): Promise<Departamento[] | { data: Departamento[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.departamentoRepo.createQueryBuilder('departamento');

    // Búsqueda por nombre o código
    if (query?.search) {
      queryBuilder.where(
        '(departamento.nombre_departamento ILIKE :search OR departamento.codigo_departamento ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filtro por estado
    if (query?.estado) {
      if (query?.search) {
        queryBuilder.andWhere('departamento.estado = :estado', { estado: query.estado });
      } else {
        queryBuilder.where('departamento.estado = :estado', { estado: query.estado });
      }
    }

    // Ordenamiento
    const orderBy = query?.orderBy || 'nombre_departamento';
    const orderDirection = query?.orderDirection || 'ASC';
    queryBuilder.orderBy(`departamento.${orderBy}`, orderDirection);

    // Paginación
    if (query?.page && query?.limit) {
      const page = query.page;
      const limit = query.limit;
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
      };
    }

    // Sin paginación, retornar todos
    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Departamento> {
    const departamento = await this.departamentoRepo.findOne({
      where: { id_departamento: id },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    return departamento;
  }

  async findByCodigo(codigo: string): Promise<Departamento> {
    const departamento = await this.departamentoRepo.findOne({
      where: { codigo_departamento: codigo },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con código ${codigo} no encontrado`);
    }

    return departamento;
  }

  async findByEstado(estado: string): Promise<Departamento[]> {
    return await this.departamentoRepo.find({
      where: { estado },
      order: { nombre_departamento: 'ASC' },
    });
  }

  async update(id: number, updateDto: UpdateDepartamentoDto): Promise<Departamento> {
    const departamento = await this.findOne(id);
    Object.assign(departamento, updateDto);
    return await this.departamentoRepo.save(departamento);
  }

  async remove(id: number): Promise<void> {
    const departamento = await this.findOne(id);
    await this.departamentoRepo.remove(departamento);
  }

}