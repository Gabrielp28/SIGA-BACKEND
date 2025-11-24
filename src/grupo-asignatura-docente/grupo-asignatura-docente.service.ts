import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoAsignaturaDocente } from 'src/common/entities/grupo_asignatura_docente.entity';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { CreateGrupoAsignaturaDocenteDto } from './dto/create-grupo-asignatura-docente.dto';
import { UpdateGrupoAsignaturaDocenteDto } from './dto/update-grupo-asignatura-docente.dto';
import { QueryGrupoAsignaturaDocenteDto } from './dto/query-grupo-asignatura-docente.dto';

@Injectable()
export class GrupoAsignaturaDocenteService {
  constructor(
    @InjectRepository(GrupoAsignaturaDocente)
    private readonly grupoAsigDocRepo: Repository<GrupoAsignaturaDocente>,
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepo: Repository<Asignatura>,
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
  ) {}

  async create(createDto: CreateGrupoAsignaturaDocenteDto): Promise<GrupoAsignaturaDocente> {
    // Validar que el grupo existe
    const grupo = await this.grupoRepo.findOne({
      where: { id_grupo: createDto.id_grupo },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${createDto.id_grupo} no encontrado`);
    }

    // Validar que la asignatura existe
    const asignatura = await this.asignaturaRepo.findOne({
      where: { id_asignatura: createDto.id_asignatura },
    });

    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${createDto.id_asignatura} no encontrada`);
    }

    // Validar que el docente existe
    const docente = await this.docenteRepo.findOne({
      where: { id_docente: createDto.id_docente },
    });

    if (!docente) {
      throw new NotFoundException(`Docente con ID ${createDto.id_docente} no encontrado`);
    }

    // Validar que no existe ya esta asignatura en este grupo
    const asignaturaExistente = await this.grupoAsigDocRepo.findOne({
      where: {
        grupo: { id_grupo: createDto.id_grupo },
        asignatura: { id_asignatura: createDto.id_asignatura },
      },
      relations: ['grupo', 'asignatura'],
    });

    if (asignaturaExistente) {
      throw new BadRequestException(
        `La asignatura ${asignatura.nombre_asignatura} ya está asignada al grupo ${grupo.codigo_grupo}`,
      );
    }

    // Validar límites de asignaturas del grupo
    const asignaturasActivas = await this.grupoAsigDocRepo.count({
      where: {
        grupo: { id_grupo: createDto.id_grupo },
        estado: 'activa',
      },
    });

    if (grupo.max_asignaturas && asignaturasActivas >= grupo.max_asignaturas) {
      throw new BadRequestException(
        `El grupo ya alcanzó el máximo de ${grupo.max_asignaturas} asignaturas permitidas`,
      );
    }

    const newGrupoAsigDoc = this.grupoAsigDocRepo.create({
      grupo,
      asignatura,
      docente,
      estado: createDto.estado || 'activa',
      observaciones: createDto.observaciones,
    });

    return await this.grupoAsigDocRepo.save(newGrupoAsigDoc);
  }

  async findAll(
    query?: QueryGrupoAsignaturaDocenteDto,
  ): Promise<
    | GrupoAsignaturaDocente[]
    | { data: GrupoAsignaturaDocente[]; total: number; page: number; limit: number }
  > {
    const queryBuilder = this.grupoAsigDocRepo
      .createQueryBuilder('grupoAsig')
      .leftJoinAndSelect('grupoAsig.grupo', 'grupo')
      .leftJoinAndSelect('grupoAsig.asignatura', 'asignatura')
      .leftJoinAndSelect('grupoAsig.docente', 'docente');

    // Filtros
    if (query?.id_grupo) {
      queryBuilder.where('grupo.id_grupo = :id_grupo', { id_grupo: query.id_grupo });
    }

    if (query?.id_asignatura) {
      const whereClause = query?.id_grupo ? 'andWhere' : 'where';
      queryBuilder[whereClause]('asignatura.id_asignatura = :id_asignatura', {
        id_asignatura: query.id_asignatura,
      });
    }

    if (query?.id_docente) {
      const whereClause = query?.id_grupo || query?.id_asignatura ? 'andWhere' : 'where';
      queryBuilder[whereClause]('docente.id_docente = :id_docente', {
        id_docente: query.id_docente,
      });
    }

    if (query?.estado) {
      const whereClause =
        query?.id_grupo || query?.id_asignatura || query?.id_docente ? 'andWhere' : 'where';
      queryBuilder[whereClause]('grupoAsig.estado = :estado', { estado: query.estado });
    }

    // Ordenamiento
    const orderBy = query?.orderBy || 'fecha_asignacion';
    const orderDirection = query?.orderDirection || 'DESC';
    queryBuilder.orderBy(`grupoAsig.${orderBy}`, orderDirection);

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

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<GrupoAsignaturaDocente> {
    const grupoAsig = await this.grupoAsigDocRepo.findOne({
      where: { id_grupo_asignatura_docente: id },
      relations: ['grupo', 'asignatura', 'docente'],
    });

    if (!grupoAsig) {
      throw new NotFoundException(
        `GrupoAsignaturaDocente con ID ${id} no encontrado`,
      );
    }

    return grupoAsig;
  }

  async findByGrupo(idGrupo: number): Promise<GrupoAsignaturaDocente[]> {
    const grupo = await this.grupoRepo.findOne({ where: { id_grupo: idGrupo } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${idGrupo} no encontrado`);
    }

    return await this.grupoAsigDocRepo.find({
      where: { grupo: { id_grupo: idGrupo } },
      relations: ['grupo', 'asignatura', 'docente'],
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async findByAsignatura(idAsignatura: number): Promise<GrupoAsignaturaDocente[]> {
    const asignatura = await this.asignaturaRepo.findOne({
      where: { id_asignatura: idAsignatura },
    });
    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${idAsignatura} no encontrada`);
    }

    return await this.grupoAsigDocRepo.find({
      where: { asignatura: { id_asignatura: idAsignatura } },
      relations: ['grupo', 'asignatura', 'docente'],
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async findByDocente(idDocente: number): Promise<GrupoAsignaturaDocente[]> {
    const docente = await this.docenteRepo.findOne({ where: { id_docente: idDocente } });
    if (!docente) {
      throw new NotFoundException(`Docente con ID ${idDocente} no encontrado`);
    }

    return await this.grupoAsigDocRepo.find({
      where: { docente: { id_docente: idDocente } },
      relations: ['grupo', 'asignatura', 'docente'],
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async update(
    id: number,
    updateDto: UpdateGrupoAsignaturaDocenteDto,
  ): Promise<GrupoAsignaturaDocente> {
    const grupoAsig = await this.findOne(id);

    // Validar docente si se actualiza
    if (updateDto.id_docente) {
      const docente = await this.docenteRepo.findOne({
        where: { id_docente: updateDto.id_docente },
      });

      if (!docente) {
        throw new NotFoundException(`Docente con ID ${updateDto.id_docente} no encontrado`);
      }

      grupoAsig.docente = docente;
    }

    // Actualizar otros campos
    if (updateDto.estado !== undefined) {
      grupoAsig.estado = updateDto.estado;
    }

    if (updateDto.observaciones !== undefined) {
      grupoAsig.observaciones = updateDto.observaciones;
    }

    return await this.grupoAsigDocRepo.save(grupoAsig);
  }

  async remove(id: number): Promise<void> {
    const grupoAsig = await this.findOne(id);
    const grupo = grupoAsig.grupo;

    // Validar mínimo de asignaturas antes de eliminar
    const asignaturasActivas = await this.grupoAsigDocRepo.count({
      where: {
        grupo: { id_grupo: grupo.id_grupo },
        estado: 'activa',
      },
    });

    if (grupo.min_asignaturas && asignaturasActivas <= grupo.min_asignaturas) {
      throw new BadRequestException(
        `No se puede eliminar la asignatura. El grupo debe tener al menos ${grupo.min_asignaturas} asignaturas activas`,
      );
    }

    await this.grupoAsigDocRepo.remove(grupoAsig);
  }

  async countAsignaturasByGrupo(idGrupo: number, estado?: string): Promise<number> {
    const where: any = { grupo: { id_grupo: idGrupo } };
    if (estado) {
      where.estado = estado;
    }

    return await this.grupoAsigDocRepo.count({ where });
  }
}

