import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from 'src/common/entities/docentes.entity';
import { CargoDocente } from 'src/common/entities/cargos_docentes.entity';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { QueryDocenteDto } from './dto/query-docente.dto';
import { CreateCargoDocenteDto } from './dto/create-cargo-docente.dto';
import { UpdateCargoDocenteDto } from './dto/update-cargo-docente.dto';

@Injectable()
export class DocenteService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(CargoDocente)
    private readonly cargoDocenteRepo: Repository<CargoDocente>,
    @InjectRepository(Departamento)
    private readonly departamentoRepo: Repository<Departamento>,
  ) {}

    // ========== MÉTODOS PARA DOCENTES ==========

  async create(createDto: CreateDocenteDto): Promise<Docente> {
    const { codigo_docente, identificacion, id_departamento, id_cargo } = createDto;

    // Validar código único
    const existeCodigo = await this.docenteRepo.findOne({
      where: { codigo_docente },
    });
    if (existeCodigo) {
      throw new BadRequestException(
        `El código de docente '${codigo_docente}' ya está registrado`,
      );
    }

    // Validar identificación única
    const existeIdentificacion = await this.docenteRepo.findOne({
      where: { identificacion },
    });
    if (existeIdentificacion) {
      throw new BadRequestException(
        `La identificación '${identificacion}' ya está registrada`,
      );
    }

    // Validar departamento
    const departamento = await this.departamentoRepo.findOne({
      where: { id_departamento },
    });
    if (!departamento) {
      throw new NotFoundException(
        `Departamento con ID ${id_departamento} no encontrado`,
      );
    }

    // Validar cargo docente
    const cargo = await this.cargoDocenteRepo.findOne({
      where: { id_cargo },
    });
    if (!cargo) {
      throw new NotFoundException(
        `Cargo docente con ID ${id_cargo} no encontrado`,
      );
    }

    // Crear nuevo docente
    const newDocente = this.docenteRepo.create({
      ...createDto,
      departamento,
      cargo,
      estado: createDto.estado || 'activo',
    });

    return await this.docenteRepo.save(newDocente);
  }

  async findAll(query?: QueryDocenteDto): Promise<Docente[] | { data: Docente[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.docenteRepo.createQueryBuilder('docente')
      .leftJoinAndSelect('docente.departamento', 'departamento')
      .leftJoinAndSelect('docente.cargo', 'cargo');

        // Búsqueda por nombre, apellido, código o identificación
        if (query?.search) {
            queryBuilder.where(
                '(docente.nombres ILIKE :search OR docente.apellidos ILIKE :search OR docente.codigo_docente ILIKE :search OR docente.identificacion ILIKE :search)',
                { search: `%${query.search}%` },
            );
        }

        // Filtro por estado
        if (query?.estado) {
            if (query?.search) {
                queryBuilder.andWhere('docente.estado = :estado', { estado: query.estado });
            } else {
                queryBuilder.where('docente.estado = :estado', { estado: query.estado });
            }
        }

        // Filtro por departamento
        if (query?.id_departamento) {
            const condition = query?.search || query?.estado ? 'andWhere' : 'where';
            queryBuilder[condition]('docente.id_departamento = :id_departamento', {
                id_departamento: query.id_departamento,
            });
        }

        // Filtro por cargo
        if (query?.id_cargo) {
            const condition = query?.search || query?.estado || query?.id_departamento ? 'andWhere' : 'where';
            queryBuilder[condition]('docente.id_cargo = :id_cargo', {
                id_cargo: query.id_cargo,
            });
        }

        // Ordenamiento
        const orderBy = query?.orderBy || 'nombres';
        const orderDirection = query?.orderDirection || 'ASC';
        queryBuilder.orderBy(`docente.${orderBy}`, orderDirection);

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

  async findOne(id: number): Promise<Docente> {
    const docente = await this.docenteRepo.findOne({
      where: { id_docente: id },
      relations: ['departamento', 'cargo'],
    });

    if (!docente) {
      throw new NotFoundException(`Docente con ID ${id} no encontrado`);
    }

    return docente;
  }

  async findByCodigo(codigo: string): Promise<Docente> {
    const docente = await this.docenteRepo.findOne({
      where: { codigo_docente: codigo },
      relations: ['departamento', 'cargo'],
    });

    if (!docente) {
      throw new NotFoundException(`Docente con código ${codigo} no encontrado`);
    }

    return docente;
  }

    async findByEstado(estado: string): Promise<Docente[]> {
        return await this.docenteRepo.find({
            where: { estado },
            relations: ['departamento', 'cargo'],
            order: { nombres: 'ASC' },
        });
    }

    async update(id: number, updateDto: UpdateDocenteDto): Promise<Docente> {
        const docente = await this.findOne(id);

        // Validar código único si se cambia
        if (updateDto.codigo_docente && updateDto.codigo_docente !== docente.codigo_docente) {
            const duplicado = await this.docenteRepo.findOne({
                where: { codigo_docente: updateDto.codigo_docente },
            });
            if (duplicado) {
                throw new BadRequestException(
                    `El código '${updateDto.codigo_docente}' ya está en uso`,
                );
            }
        }

        // Validar identificación única si se cambia
        if (updateDto.identificacion && updateDto.identificacion !== docente.identificacion) {
            const duplicado = await this.docenteRepo.findOne({
                where: { identificacion: updateDto.identificacion },
            });
            if (duplicado) {
                throw new BadRequestException(
                    `La identificación '${updateDto.identificacion}' ya está en uso`,
                );
            }
        }

        // Validar departamento si se actualiza
        if (updateDto.id_departamento) {
            const departamento = await this.departamentoRepo.findOne({
                where: { id_departamento: updateDto.id_departamento },
            });
            if (!departamento) {
                throw new NotFoundException(
                    `Departamento con ID ${updateDto.id_departamento} no encontrado`,
                );
            }
            docente.departamento = departamento;
        }

        // Validar cargo si se actualiza
        if (updateDto.id_cargo) {
            const cargo = await this.cargoDocenteRepo.findOne({
                where: { id_cargo: updateDto.id_cargo },
            });
            if (!cargo) {
                throw new NotFoundException(
                    `Cargo docente con ID ${updateDto.id_cargo} no encontrado`,
                );
            }
            docente.cargo = cargo;
        }

        Object.assign(docente, {
            ...updateDto,
            id_departamento: undefined,
            id_cargo: undefined,
        });

        return await this.docenteRepo.save(docente);
    }

    async remove(id: number): Promise<void> {
        const docente = await this.findOne(id);
        await this.docenteRepo.remove(docente);
    }

    // ========== MÉTODOS PARA CARGOS DOCENTES ==========

    async createCargo(createDto: CreateCargoDocenteDto): Promise<CargoDocente> {
        const { nombre_cargo } = createDto;

        // Validar nombre único
        const existe = await this.cargoDocenteRepo.findOne({
            where: { nombre_cargo },
        });
        if (existe) {
            throw new BadRequestException(
                `El cargo '${nombre_cargo}' ya está registrado`,
            );
        }

        const newCargo = this.cargoDocenteRepo.create({
            ...createDto,
            estado: createDto.estado || 'activo',
            min_asignaturas: createDto.min_asignaturas || 0,
        });

        return await this.cargoDocenteRepo.save(newCargo);
    }

    async findAllCargos(): Promise<CargoDocente[]> {
        return await this.cargoDocenteRepo.find({
            order: { nombre_cargo: 'ASC' },
        });
    }

    async findOneCargo(id: number): Promise<CargoDocente> {
        const cargo = await this.cargoDocenteRepo.findOne({
            where: { id_cargo: id },
        });

        if (!cargo) {
            throw new NotFoundException(`Cargo docente con ID ${id} no encontrado`);
        }

        return cargo;
    }

    async updateCargo(id: number, updateDto: UpdateCargoDocenteDto): Promise<CargoDocente> {
        const cargo = await this.findOneCargo(id);

        // Validar nombre único si se cambia
        if (updateDto.nombre_cargo && updateDto.nombre_cargo !== cargo.nombre_cargo) {
            const duplicado = await this.cargoDocenteRepo.findOne({
                where: { nombre_cargo: updateDto.nombre_cargo },
            });
            if (duplicado) {
                throw new BadRequestException(
                    `El cargo '${updateDto.nombre_cargo}' ya está en uso`,
                );
            }
        }

        Object.assign(cargo, updateDto);
        return await this.cargoDocenteRepo.save(cargo);
    }

    async removeCargo(id: number): Promise<void> {
        const cargo = await this.findOneCargo(id);

        // Verificar si hay docentes usando este cargo
        const docentesConCargo = await this.docenteRepo
            .createQueryBuilder('docente')
            .where('docente.id_cargo = :id', { id })
            .getCount();

        if (docentesConCargo > 0) {
            throw new BadRequestException(
                `No se puede eliminar el cargo porque hay ${docentesConCargo} docente(s) asignado(s)`,
            );
        }

        await this.cargoDocenteRepo.remove(cargo);
    }
}

