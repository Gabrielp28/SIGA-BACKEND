import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoAsignaturaDocente } from 'src/common/entities/grupo_asignatura_docente.entity';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { PlanCarrera } from 'src/common/entities/plan_carrera.entity';
import { PlanCarreraAsignatura } from 'src/common/entities/plan_carrera_asignatura.entity';
import { CreateGrupoAsignaturaDocenteDto } from './dto/create-grupo-asignatura-docente.dto';
import { CreateBulkGrupoAsignaturaDocenteDto } from './dto/create-bulk-grupo-asignatura-docente.dto';
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
    @InjectRepository(PlanCarrera)
    private readonly planCarreraRepo: Repository<PlanCarrera>,
    @InjectRepository(PlanCarreraAsignatura)
    private readonly planCarreraAsigRepo: Repository<PlanCarreraAsignatura>,
  ) {}

  async create(createDto: CreateGrupoAsignaturaDocenteDto): Promise<GrupoAsignaturaDocente> {
    // Validar que el grupo existe
    const grupo = await this.grupoRepo.findOne({
      where: { id_grupo: createDto.id_grupo },
      relations: ['plan', 'carrera'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${createDto.id_grupo} no encontrado`);
    }

    if (!grupo.plan) {
      throw new BadRequestException(
        `El grupo ${grupo.codigo_grupo} no tiene un plan asignado`,
      );
    }

    // Validar que la asignatura existe
    const asignatura = await this.asignaturaRepo.findOne({
      where: { id_asignatura: createDto.id_asignatura },
      relations: ['carrera'],
    });

    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${createDto.id_asignatura} no encontrada`);
    }

    // Validar que la asignatura pertenece al plan del grupo
    const planCarrera = await this.planCarreraRepo.findOne({
      where: {
        plan: { id_plan: grupo.plan.id_plan },
        carrera: { id_carrera: grupo.carrera.id_carrera },
      },
    });

    if (!planCarrera) {
      throw new BadRequestException(
        `No se encontró la relación plan-carrera para el plan ${grupo.plan.nombre_plan} y carrera ${grupo.carrera.nombre_carrera}`,
      );
    }

    // Validar que la asignatura pertenece a la carrera del grupo
    if (asignatura.carrera.id_carrera !== grupo.carrera.id_carrera) {
      throw new BadRequestException(
        `La asignatura ${asignatura.nombre_asignatura} no pertenece a la carrera ${grupo.carrera.nombre_carrera}`,
      );
    }

    // Validar que la asignatura está en el plan-carrera
    const planCarreraAsignatura = await this.planCarreraAsigRepo.findOne({
      where: {
        planCarrera: { id_plan_carrera: planCarrera.id_plan_carrera },
        asignatura: { id_asignatura: createDto.id_asignatura },
      },
    });

    if (!planCarreraAsignatura) {
      throw new BadRequestException(
        `La asignatura ${asignatura.nombre_asignatura} no está disponible en el plan ${grupo.plan.nombre_plan} para la carrera ${grupo.carrera.nombre_carrera}`,
      );
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

  async createBulk(
    createBulkDto: CreateBulkGrupoAsignaturaDocenteDto,
  ): Promise<{
    creadas: GrupoAsignaturaDocente[];
    errores: Array<{ asignatura: number; docente: number; error: string }>;
    total: number;
    exitosas: number;
    fallidas: number;
  }> {
    // Validar que el grupo existe
    const grupo = await this.grupoRepo.findOne({
      where: { id_grupo: createBulkDto.id_grupo },
      relations: ['plan', 'carrera'],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${createBulkDto.id_grupo} no encontrado`);
    }

    if (!grupo.plan) {
      throw new BadRequestException(
        `El grupo ${grupo.codigo_grupo} no tiene un plan asignado`,
      );
    }

    // Obtener el plan-carrera del grupo
    const planCarrera = await this.planCarreraRepo.findOne({
      where: {
        plan: { id_plan: grupo.plan.id_plan },
        carrera: { id_carrera: grupo.carrera.id_carrera },
      },
    });

    if (!planCarrera) {
      throw new BadRequestException(
        `No se encontró la relación plan-carrera para el plan ${grupo.plan.nombre_plan} y carrera ${grupo.carrera.nombre_carrera}`,
      );
    }

    // Obtener asignaturas activas actuales del grupo
    const asignaturasActivas = await this.grupoAsigDocRepo.count({
      where: {
        grupo: { id_grupo: createBulkDto.id_grupo },
        estado: 'activa',
      },
    });

    // Validar límite máximo antes de procesar
    const nuevasAsignaturas = createBulkDto.asignaturas_docentes.length;
    if (grupo.max_asignaturas && asignaturasActivas + nuevasAsignaturas > grupo.max_asignaturas) {
      throw new BadRequestException(
        `No se pueden agregar ${nuevasAsignaturas} asignaturas. El grupo tiene ${asignaturasActivas} asignaturas activas y el máximo permitido es ${grupo.max_asignaturas}`,
      );
    }

    const creadas: GrupoAsignaturaDocente[] = [];
    const errores: Array<{ asignatura: number; docente: number; error: string }> = [];

    // Validar todas las asignaturas y docentes primero
    const asignaturasMap = new Map<number, Asignatura>();
    const docentesMap = new Map<number, Docente>();
    const asignaturasIds = [
      ...new Set(createBulkDto.asignaturas_docentes.map((item) => item.id_asignatura)),
    ];
    const docentesIds = [
      ...new Set(createBulkDto.asignaturas_docentes.map((item) => item.id_docente)),
    ];

    // Cargar todas las asignaturas de una vez
    const asignaturas = await this.asignaturaRepo.find({
      where: asignaturasIds.map((id) => ({ id_asignatura: id })),
      relations: ['carrera'],
    });
    asignaturas.forEach((asig) => asignaturasMap.set(asig.id_asignatura, asig));

    // Obtener asignaturas del plan-carrera
    const asignaturasPlanCarrera = await this.planCarreraAsigRepo.find({
      where: { planCarrera: { id_plan_carrera: planCarrera.id_plan_carrera } },
      relations: ['asignatura'],
    });
    const asignaturasPlanSet = new Set(
      asignaturasPlanCarrera.map((pca) => pca.asignatura.id_asignatura),
    );

    // Cargar todos los docentes de una vez
    const docentes = await this.docenteRepo.find({
      where: docentesIds.map((id) => ({ id_docente: id })),
    });
    docentes.forEach((doc) => docentesMap.set(doc.id_docente, doc));

    // Obtener asignaturas ya existentes en el grupo
    const asignaturasExistentes = await this.grupoAsigDocRepo.find({
      where: {
        grupo: { id_grupo: createBulkDto.id_grupo },
      },
      relations: ['asignatura'],
    });
    const asignaturasExistentesSet = new Set(
      asignaturasExistentes.map((ae) => ae.asignatura.id_asignatura),
    );

    // Procesar cada asignatura-docente
    for (const item of createBulkDto.asignaturas_docentes) {
      try {
        // Validar asignatura existe
        const asignatura = asignaturasMap.get(item.id_asignatura);
        if (!asignatura) {
          errores.push({
            asignatura: item.id_asignatura,
            docente: item.id_docente,
            error: `Asignatura con ID ${item.id_asignatura} no encontrada`,
          });
          continue;
        }

        // Validar docente existe
        const docente = docentesMap.get(item.id_docente);
        if (!docente) {
          errores.push({
            asignatura: item.id_asignatura,
            docente: item.id_docente,
            error: `Docente con ID ${item.id_docente} no encontrado`,
          });
          continue;
        }

        // Validar que la asignatura pertenece a la carrera del grupo
        if (asignatura.carrera.id_carrera !== grupo.carrera.id_carrera) {
          errores.push({
            asignatura: item.id_asignatura,
            docente: item.id_docente,
            error: `La asignatura ${asignatura.nombre_asignatura} no pertenece a la carrera ${grupo.carrera.nombre_carrera}`,
          });
          continue;
        }

        // Validar que la asignatura está en el plan del grupo
        if (!asignaturasPlanSet.has(item.id_asignatura)) {
          errores.push({
            asignatura: item.id_asignatura,
            docente: item.id_docente,
            error: `La asignatura ${asignatura.nombre_asignatura} no está disponible en el plan ${grupo.plan.nombre_plan} para la carrera ${grupo.carrera.nombre_carrera}`,
          });
          continue;
        }

        // Validar que no existe ya esta asignatura en este grupo
        if (asignaturasExistentesSet.has(item.id_asignatura)) {
          errores.push({
            asignatura: item.id_asignatura,
            docente: item.id_docente,
            error: `La asignatura ${asignatura.nombre_asignatura} ya está asignada al grupo`,
          });
          continue;
        }

        // Crear la relación
        const newGrupoAsigDoc = this.grupoAsigDocRepo.create({
          grupo,
          asignatura,
          docente,
          estado: createBulkDto.estado || 'activa',
          observaciones: createBulkDto.observaciones,
        });

        const saved = await this.grupoAsigDocRepo.save(newGrupoAsigDoc);
        creadas.push(saved);
        asignaturasExistentesSet.add(item.id_asignatura); // Agregar a existentes para evitar duplicados en el mismo batch
      } catch (error) {
        errores.push({
          asignatura: item.id_asignatura,
          docente: item.id_docente,
          error: error.message || 'Error desconocido al crear la asignación',
        });
      }
    }

    return {
      creadas,
      errores,
      total: createBulkDto.asignaturas_docentes.length,
      exitosas: creadas.length,
      fallidas: errores.length,
    };
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

