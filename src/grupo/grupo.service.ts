import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { QueryGrupoDto } from './dto/query-grupo.dto';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepo: Repository<Asignatura>,
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
  ) {}

  async create(createDto: CreateGrupoDto): Promise<Grupo> {
    // Validar que la asignatura existe
    const asignatura = await this.asignaturaRepo.findOne({
      where: { id_asignatura: createDto.id_asignatura },
    });

    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${createDto.id_asignatura} no encontrada`);
    }

    // Validar que el docente existe (si se proporciona)
    let docenteTitular: Docente | null = null;
    if (createDto.id_docente_titular) {
      docenteTitular = await this.docenteRepo.findOne({
        where: { id_docente: createDto.id_docente_titular },
      });

      if (!docenteTitular) {
        throw new NotFoundException(`Docente con ID ${createDto.id_docente_titular} no encontrado`);
      }
    }

    // Verificar que el código de grupo no exista en el mismo periodo y asignatura
    const grupoExistente = await this.grupoRepo.findOne({
      where: {
        codigo_grupo: createDto.codigo_grupo,
        periodo_academico: createDto.periodo_academico,
        asignatura: { id_asignatura: createDto.id_asignatura },
      },
      relations: ['asignatura'],
    });

    if (grupoExistente) {
      throw new BadRequestException(
        `Ya existe un grupo con el código ${createDto.codigo_grupo} para la asignatura ${createDto.id_asignatura} en el periodo ${createDto.periodo_academico}`,
      );
    }

    const grupoData: Partial<Grupo> = {
      asignatura: asignatura,
      codigo_grupo: createDto.codigo_grupo,
      nombre_grupo: createDto.nombre_grupo,
      periodo_academico: createDto.periodo_academico,
      estado: createDto.estado || 'activo',
    };

    if (docenteTitular) {
      grupoData.docente_titular = docenteTitular;
    }

    const newGrupo = this.grupoRepo.create(grupoData);

    return await this.grupoRepo.save(newGrupo);
  }

  async findAll(query?: QueryGrupoDto): Promise<Grupo[] | { data: Grupo[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.grupoRepo.createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.asignatura', 'asignatura')
      .leftJoinAndSelect('grupo.docente_titular', 'docente_titular');

    // Búsqueda por código o nombre
    if (query?.search) {
      queryBuilder.where(
        '(grupo.codigo_grupo ILIKE :search OR grupo.nombre_grupo ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filtro por estado
    if (query?.estado) {
      if (query?.search) {
        queryBuilder.andWhere('grupo.estado = :estado', { estado: query.estado });
      } else {
        queryBuilder.where('grupo.estado = :estado', { estado: query.estado });
      }
    }

    // Filtro por asignatura
    if (query?.id_asignatura) {
      const whereClause = query?.search || query?.estado ? 'andWhere' : 'where';
      queryBuilder[whereClause]('asignatura.id_asignatura = :id_asignatura', {
        id_asignatura: query.id_asignatura,
      });
    }

    // Filtro por docente titular
    if (query?.id_docente_titular) {
      const whereClause = query?.search || query?.estado || query?.id_asignatura ? 'andWhere' : 'where';
      queryBuilder[whereClause]('docente_titular.id_docente = :id_docente_titular', {
        id_docente_titular: query.id_docente_titular,
      });
    }

    // Filtro por periodo académico
    if (query?.periodo_academico) {
      const whereClause =
        query?.search || query?.estado || query?.id_asignatura || query?.id_docente_titular
          ? 'andWhere'
          : 'where';
      queryBuilder[whereClause]('grupo.periodo_academico = :periodo_academico', {
        periodo_academico: query.periodo_academico,
      });
    }

    // Ordenamiento
    const orderBy = query?.orderBy || 'codigo_grupo';
    const orderDirection = query?.orderDirection || 'ASC';
    queryBuilder.orderBy(`grupo.${orderBy}`, orderDirection);

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

  async findOne(id: number): Promise<Grupo> {
    const grupo = await this.grupoRepo.findOne({
      where: { id_grupo: id },
      relations: ['asignatura', 'docente_titular'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }

    return grupo;
  }

  async findByCodigo(codigo: string): Promise<Grupo> {
    const grupo = await this.grupoRepo.findOne({
      where: { codigo_grupo: codigo },
      relations: ['asignatura', 'docente_titular'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con código ${codigo} no encontrado`);
    }

    return grupo;
  }

  async findByAsignatura(idAsignatura: number): Promise<Grupo[]> {
    const grupos = await this.grupoRepo.find({
      where: { asignatura: { id_asignatura: idAsignatura } },
      relations: ['asignatura', 'docente_titular'],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async findByDocente(idDocente: number): Promise<Grupo[]> {
    const grupos = await this.grupoRepo.find({
      where: { docente_titular: { id_docente: idDocente } },
      relations: ['asignatura', 'docente_titular'],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async findByPeriodo(periodo: string): Promise<Grupo[]> {
    const grupos = await this.grupoRepo.find({
      where: { periodo_academico: periodo },
      relations: ['asignatura', 'docente_titular'],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async findByEstado(estado: string): Promise<Grupo[]> {
    const grupos = await this.grupoRepo.find({
      where: { estado },
      relations: ['asignatura', 'docente_titular'],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async update(id: number, updateDto: UpdateGrupoDto): Promise<Grupo> {
    const grupo = await this.findOne(id);

    // Validar asignatura si se actualiza
    if (updateDto.id_asignatura) {
      const asignatura = await this.asignaturaRepo.findOne({
        where: { id_asignatura: updateDto.id_asignatura },
      });

      if (!asignatura) {
        throw new NotFoundException(`Asignatura con ID ${updateDto.id_asignatura} no encontrada`);
      }

      grupo.asignatura = asignatura;
    }

    // Validar docente si se actualiza
    if (updateDto.id_docente_titular !== undefined) {
      if (updateDto.id_docente_titular === null) {
        grupo.docente_titular = null;
      } else {
        const docente = await this.docenteRepo.findOne({
          where: { id_docente: updateDto.id_docente_titular },
        });

        if (!docente) {
          throw new NotFoundException(`Docente con ID ${updateDto.id_docente_titular} no encontrado`);
        }

        grupo.docente_titular = docente;
      }
    }

    // Verificar código único si se actualiza
    if (updateDto.codigo_grupo) {
      const periodo = updateDto.periodo_academico || grupo.periodo_academico;
      const idAsignatura = updateDto.id_asignatura || grupo.asignatura.id_asignatura;

      const grupoExistente = await this.grupoRepo.findOne({
        where: {
          codigo_grupo: updateDto.codigo_grupo,
          periodo_academico: periodo,
          asignatura: { id_asignatura: idAsignatura },
        },
        relations: ['asignatura'],
      });

      if (grupoExistente && grupoExistente.id_grupo !== id) {
        throw new BadRequestException(
          `Ya existe un grupo con el código ${updateDto.codigo_grupo} para la asignatura ${idAsignatura} en el periodo ${periodo}`,
        );
      }

      grupo.codigo_grupo = updateDto.codigo_grupo;
    }

    // Actualizar otros campos
    if (updateDto.nombre_grupo !== undefined) {
      grupo.nombre_grupo = updateDto.nombre_grupo;
    }

    if (updateDto.periodo_academico !== undefined) {
      grupo.periodo_academico = updateDto.periodo_academico;
    }

    if (updateDto.estado !== undefined) {
      grupo.estado = updateDto.estado;
    }

    return await this.grupoRepo.save(grupo);
  }

  async remove(id: number): Promise<void> {
    const grupo = await this.findOne(id);
    await this.grupoRepo.remove(grupo);
  }
}

