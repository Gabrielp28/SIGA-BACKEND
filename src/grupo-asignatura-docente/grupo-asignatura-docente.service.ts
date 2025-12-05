import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoAsignaturaDocente } from 'src/common/entities/grupo_asignatura_docente.entity';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { PlanCarrera } from 'src/common/entities/plan_carrera.entity';
import { PlanCarreraAsignatura } from 'src/common/entities/plan_carrera_asignatura.entity';
import { CargaDocenteVersion, EstadoVersion } from 'src/common/entities/carga_docente_version.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';
import { CreateGrupoAsignaturaDocenteDto } from './dto/create-grupo-asignatura-docente.dto';
import { CreateBulkGrupoAsignaturaDocenteDto } from './dto/create-bulk-grupo-asignatura-docente.dto';
import { UpdateGrupoAsignaturaDocenteDto } from './dto/update-grupo-asignatura-docente.dto';
import { QueryGrupoAsignaturaDocenteDto } from './dto/query-grupo-asignatura-docente.dto';
import { CrearVersionInicialDto } from './dto/crear-version-inicial.dto';
import { EnviarRevisionDto } from './dto/enviar-revision.dto';
import { RevisarCargaDto } from './dto/revisar-carga.dto';
import { AprobarFinalDto } from './dto/aprobar-final.dto';
import { RolEnum } from 'src/common/enums/roles.enum';

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
    @InjectRepository(CargaDocenteVersion)
    private readonly versionRepo: Repository<CargaDocenteVersion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
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
        `El grupo ${grupo.codigo_grupo} (ID: ${grupo.id_grupo}) no tiene un plan de estudios asignado. Por favor, actualiza el grupo usando PATCH /grupos/${grupo.id_grupo} y proporciona el campo 'id_plan' antes de asignar asignaturas.`,
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
    grupo: {
      id_grupo: number;
      codigo_grupo: string;
      nombre_grupo: string;
      plan: {
        id_plan: number;
        nombre_plan: string;
        codigo_plan: string;
      };
      carrera: {
        id_carrera: number;
        nombre_carrera: string;
        codigo_carrera: string;
      };
    };
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
        `El grupo ${grupo.codigo_grupo} (ID: ${grupo.id_grupo}) no tiene un plan de estudios asignado. Por favor, actualiza el grupo usando PATCH /grupos/${grupo.id_grupo} y proporciona el campo 'id_plan' antes de asignar asignaturas.`,
      );
    }

    // Validar que el plan proporcionado coincida con el plan del grupo
    if (createBulkDto.id_plan !== grupo.plan.id_plan) {
      throw new BadRequestException(
        `El plan proporcionado (ID: ${createBulkDto.id_plan}) no coincide con el plan del grupo (ID: ${grupo.plan.id_plan}, ${grupo.plan.nombre_plan}). El grupo debe usar asignaturas del plan ${grupo.plan.nombre_plan}.`,
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
      grupo: {
        id_grupo: grupo.id_grupo,
        codigo_grupo: grupo.codigo_grupo,
        nombre_grupo: grupo.nombre_grupo,
        plan: {
          id_plan: grupo.plan.id_plan,
          nombre_plan: grupo.plan.nombre_plan,
          codigo_plan: grupo.plan.codigo_plan,
        },
        carrera: {
          id_carrera: grupo.carrera.id_carrera,
          nombre_carrera: grupo.carrera.nombre_carrera,
          codigo_carrera: grupo.carrera.codigo_carrera,
        },
      },
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

  // ========== MÉTODOS PARA FLUJO DE APROBACIÓN Y VERSIONAMIENTO ==========

  /**
   * Crear versión inicial de carga docente (Coordinador de Carrera)
   */
  async crearVersionInicial(
    createDto: CrearVersionInicialDto,
    idUsuario: number,
  ): Promise<GrupoAsignaturaDocente> {
    // Validar que el usuario tiene rol de coordinador
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: idUsuario },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const tieneRolCoordinador = usuario.usuarioRoles?.some(
      (ur) => ur.rol?.nombre_rol === RolEnum.COORDINADOR && ur.estado === 'activo',
    );

    if (!tieneRolCoordinador) {
      throw new ForbiddenException('Solo los coordinadores de carrera pueden crear versiones iniciales');
    }

    // Validar que el grupo existe
    const grupo = await this.grupoRepo.findOne({
      where: { id_grupo: createDto.id_grupo },
      relations: ['plan', 'carrera'],
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

    // Verificar si ya existe una asignación para este grupo-asignatura
    const asignacionExistente = await this.grupoAsigDocRepo.findOne({
      where: {
        grupo: { id_grupo: createDto.id_grupo },
        asignatura: { id_asignatura: createDto.id_asignatura },
      },
    });

    let grupoAsigDoc: GrupoAsignaturaDocente;

    if (asignacionExistente) {
      // Actualizar la asignación existente
      grupoAsigDoc = asignacionExistente;
      grupoAsigDoc.docente = docente;
      grupoAsigDoc.estado = createDto.estado || 'activa';
      grupoAsigDoc.observaciones = createDto.observaciones ?? null;
      grupoAsigDoc.version_actual += 1;
    } else {
      // Crear nueva asignación
      grupoAsigDoc = this.grupoAsigDocRepo.create({
        grupo,
        asignatura,
        docente,
        estado: createDto.estado || 'activa',
        observaciones: createDto.observaciones,
        estado_aprobacion: 'borrador',
        version_actual: 1,
        fecha_creacion_inicial: new Date(),
      });
    }

    // Asignar coordinador
    grupoAsigDoc.coordinador_carrera = usuario;
    grupoAsigDoc.observaciones_coordinador = createDto.observaciones || null;

    // Guardar asignación
    const saved = await this.grupoAsigDocRepo.save(grupoAsigDoc);

    // Crear versión inicial
    const version = this.versionRepo.create({
      grupo_asignatura_docente: saved,
      version: saved.version_actual,
      estado_version: EstadoVersion.INICIAL,
      usuario_creador: usuario,
      fecha_creacion: new Date(),
      datos_version: {
        id_grupo: grupo.id_grupo,
        id_asignatura: asignatura.id_asignatura,
        id_docente: docente.id_docente,
        estado: saved.estado,
        observaciones: saved.observaciones ?? undefined,
      },
      observaciones: createDto.observaciones ?? null,
      activa: true,
    });

    // Desactivar versiones anteriores
    await this.versionRepo.update(
      {
        grupo_asignatura_docente: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
        activa: true,
      },
      { activa: false },
    );

    await this.versionRepo.save(version);

    const result = await this.grupoAsigDocRepo.findOne({
      where: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
      relations: ['grupo', 'asignatura', 'docente', 'coordinador_carrera', 'versiones'],
    });

    if (!result) {
      throw new NotFoundException('Error al recuperar la carga docente creada');
    }

    return result;
  }

  /**
   * Enviar carga docente a revisión (Coordinador de Carrera)
   */
  async enviarRevision(
    id: number,
    dto: EnviarRevisionDto,
    idUsuario: number,
  ): Promise<GrupoAsignaturaDocente> {
    const grupoAsigDoc = await this.findOne(id);

    // Validar que el usuario es el coordinador que creó la versión
    if (grupoAsigDoc.coordinador_carrera?.id_usuario !== idUsuario) {
      throw new ForbiddenException('Solo el coordinador que creó esta carga puede enviarla a revisión');
    }

    // Validar estado
    if (grupoAsigDoc.estado_aprobacion !== 'borrador') {
      throw new BadRequestException(
        `Solo se pueden enviar a revisión cargas en estado 'borrador'. Estado actual: ${grupoAsigDoc.estado_aprobacion}`,
      );
    }

    grupoAsigDoc.estado_aprobacion = 'pendiente_revision';
    if (dto.observaciones) {
      grupoAsigDoc.observaciones_coordinador = dto.observaciones;
    }

    return await this.grupoAsigDocRepo.save(grupoAsigDoc);
  }

  /**
   * Revisar carga docente (Director de Departamento)
   */
  async revisarCarga(
    id: number,
    dto: RevisarCargaDto,
    idUsuario: number,
  ): Promise<GrupoAsignaturaDocente> {
    const grupoAsigDoc = await this.grupoAsigDocRepo.findOne({
      where: { id_grupo_asignatura_docente: id },
      relations: ['grupo', 'asignatura', 'docente', 'coordinador_carrera', 'versiones'],
    });

    if (!grupoAsigDoc) {
      throw new NotFoundException(`Carga docente con ID ${id} no encontrada`);
    }

    // Validar que el usuario tiene rol de director
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: idUsuario },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const tieneRolDirector = usuario.usuarioRoles?.some(
      (ur) => ur.rol?.nombre_rol === RolEnum.DIRECTORES && ur.estado === 'activo',
    );

    if (!tieneRolDirector) {
      throw new ForbiddenException('Solo los directores de departamento pueden revisar cargas');
    }

    // Validar estado
    if (grupoAsigDoc.estado_aprobacion !== 'pendiente_revision') {
      throw new BadRequestException(
        `Solo se pueden revisar cargas en estado 'pendiente_revision'. Estado actual: ${grupoAsigDoc.estado_aprobacion}`,
      );
    }

    // Obtener versión anterior para comparar cambios
    const versionAnterior = await this.versionRepo.findOne({
      where: {
        grupo_asignatura_docente: { id_grupo_asignatura_docente: id },
        activa: true,
      },
      order: { version: 'DESC' },
    });

    const cambios: Array<{ campo: string; valor_anterior: any; valor_nuevo: any }> = [];

    // Aplicar cambios si se proporcionaron
    if (dto.cambios) {
      if (dto.cambios.id_docente && dto.cambios.id_docente !== grupoAsigDoc.docente.id_docente) {
        const nuevoDocente = await this.docenteRepo.findOne({
          where: { id_docente: dto.cambios.id_docente },
        });
        if (!nuevoDocente) {
          throw new NotFoundException(`Docente con ID ${dto.cambios.id_docente} no encontrado`);
        }
        cambios.push({
          campo: 'id_docente',
          valor_anterior: grupoAsigDoc.docente.id_docente,
          valor_nuevo: dto.cambios.id_docente,
        });
        grupoAsigDoc.docente = nuevoDocente;
      }

      if (dto.cambios.estado && dto.cambios.estado !== grupoAsigDoc.estado) {
        cambios.push({
          campo: 'estado',
          valor_anterior: grupoAsigDoc.estado,
          valor_nuevo: dto.cambios.estado,
        });
        grupoAsigDoc.estado = dto.cambios.estado;
      }

      if (dto.cambios.observaciones !== undefined) {
        cambios.push({
          campo: 'observaciones',
          valor_anterior: grupoAsigDoc.observaciones,
          valor_nuevo: dto.cambios.observaciones,
        });
        grupoAsigDoc.observaciones = dto.cambios.observaciones;
      }
    }

    // Actualizar estado según aprobación
    if (dto.aprobado) {
      grupoAsigDoc.estado_aprobacion = 'revisada';
      grupoAsigDoc.director_departamento = usuario;
      grupoAsigDoc.fecha_revision = new Date();
      grupoAsigDoc.observaciones_director = dto.observaciones || null;
    } else {
      grupoAsigDoc.estado_aprobacion = 'borrador';
      grupoAsigDoc.observaciones_director = dto.observaciones || 'Rechazada por el director';
    }

    const saved = await this.grupoAsigDocRepo.save(grupoAsigDoc);

    // Crear nueva versión si fue aprobada
    if (dto.aprobado) {
      grupoAsigDoc.version_actual += 1;
    const nuevaVersion = this.versionRepo.create({
      grupo_asignatura_docente: saved,
      version: grupoAsigDoc.version_actual,
      estado_version: EstadoVersion.REVISADA,
      usuario_creador: grupoAsigDoc.coordinador_carrera || undefined,
      usuario_revisor: usuario || undefined,
      fecha_creacion: versionAnterior?.fecha_creacion || new Date(),
      fecha_revision: new Date(),
      datos_version: {
        id_grupo: saved.grupo.id_grupo,
        id_asignatura: saved.asignatura.id_asignatura,
        id_docente: saved.docente.id_docente,
        estado: saved.estado,
        observaciones: saved.observaciones || undefined,
      },
      cambios: cambios.length > 0 ? cambios : null,
      observaciones: dto.observaciones || null,
      activa: true,
    });

      // Desactivar versiones anteriores
      await this.versionRepo.update(
        {
          grupo_asignatura_docente: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
          activa: true,
        },
        { activa: false },
      );

      await this.versionRepo.save(nuevaVersion);
      await this.grupoAsigDocRepo.save(grupoAsigDoc);
    }

    const result = await this.grupoAsigDocRepo.findOne({
      where: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
      relations: ['grupo', 'asignatura', 'docente', 'coordinador_carrera', 'director_departamento', 'versiones'],
    });

    if (!result) {
      throw new NotFoundException('Error al recuperar la carga docente revisada');
    }

    return result;
  }

  /**
   * Aprobar final (Administrador)
   */
  async aprobarFinal(
    id: number,
    dto: AprobarFinalDto,
    idUsuario: number,
  ): Promise<GrupoAsignaturaDocente> {
    const grupoAsigDoc = await this.grupoAsigDocRepo.findOne({
      where: { id_grupo_asignatura_docente: id },
      relations: ['grupo', 'asignatura', 'docente', 'coordinador_carrera', 'director_departamento', 'versiones'],
    });

    if (!grupoAsigDoc) {
      throw new NotFoundException(`Carga docente con ID ${id} no encontrada`);
    }

    // Validar que el usuario tiene rol de administrador
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: idUsuario },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const tieneRolAdmin = usuario.usuarioRoles?.some(
      (ur) => ur.rol?.nombre_rol === RolEnum.ADMINISTRADOR && ur.estado === 'activo',
    );

    if (!tieneRolAdmin) {
      throw new ForbiddenException('Solo los administradores pueden dar aprobación final');
    }

    // Validar estado
    if (grupoAsigDoc.estado_aprobacion !== 'revisada') {
      throw new BadRequestException(
        `Solo se pueden aprobar cargas en estado 'revisada'. Estado actual: ${grupoAsigDoc.estado_aprobacion}`,
      );
    }

    grupoAsigDoc.estado_aprobacion = 'aprobada';
    grupoAsigDoc.administrador = usuario;
    grupoAsigDoc.fecha_aprobacion_final = new Date();
    grupoAsigDoc.observaciones_administrador = dto.observaciones || null;

    const saved = await this.grupoAsigDocRepo.save(grupoAsigDoc);

    // Crear versión aprobada
    const versionRevisada = await this.versionRepo.findOne({
      where: {
        grupo_asignatura_docente: { id_grupo_asignatura_docente: id },
        activa: true,
      },
      order: { version: 'DESC' },
    });

    if (versionRevisada) {
      grupoAsigDoc.version_actual += 1;
      const versionAprobada = this.versionRepo.create({
        grupo_asignatura_docente: saved,
        version: grupoAsigDoc.version_actual,
        estado_version: EstadoVersion.APROBADA,
        usuario_creador: grupoAsigDoc.coordinador_carrera || undefined,
        usuario_revisor: grupoAsigDoc.director_departamento || undefined,
        usuario_aprobador: usuario || undefined,
        fecha_creacion: versionRevisada.fecha_creacion,
        fecha_revision: versionRevisada.fecha_revision,
        fecha_aprobacion: new Date(),
        datos_version: {
          id_grupo: saved.grupo.id_grupo,
          id_asignatura: saved.asignatura.id_asignatura,
          id_docente: saved.docente.id_docente,
          estado: saved.estado,
          observaciones: saved.observaciones || undefined,
        },
        cambios: versionRevisada.cambios,
        observaciones: dto.observaciones || null,
        activa: true,
      });

      // Desactivar versiones anteriores
      await this.versionRepo.update(
        {
          grupo_asignatura_docente: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
          activa: true,
        },
        { activa: false },
      );

      await this.versionRepo.save(versionAprobada);
      await this.grupoAsigDocRepo.save(grupoAsigDoc);
    }

    const result = await this.grupoAsigDocRepo.findOne({
      where: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
      relations: ['grupo', 'asignatura', 'docente', 'coordinador_carrera', 'director_departamento', 'administrador', 'versiones'],
    });

    if (!result) {
      throw new NotFoundException('Error al recuperar la carga docente aprobada');
    }

    return result;
  }

  /**
   * Obtener historial de versiones de una carga docente
   */
  async obtenerVersiones(id: number): Promise<CargaDocenteVersion[]> {
    const grupoAsigDoc = await this.findOne(id);

    return await this.versionRepo.find({
      where: {
        grupo_asignatura_docente: { id_grupo_asignatura_docente: grupoAsigDoc.id_grupo_asignatura_docente },
      },
      relations: ['usuario_creador', 'usuario_revisor', 'usuario_aprobador'],
      order: { version: 'ASC' },
    });
  }

  /**
   * Comparar dos versiones
   */
  async compararVersiones(
    id: number,
    version1: number,
    version2: number,
  ): Promise<{
    version1: CargaDocenteVersion;
    version2: CargaDocenteVersion;
    diferencias: Array<{ campo: string; valor_v1: any; valor_v2: any }>;
  }> {
    const grupoAsigDoc = await this.findOne(id);

    const v1 = await this.versionRepo.findOne({
      where: {
        grupo_asignatura_docente: { id_grupo_asignatura_docente: grupoAsigDoc.id_grupo_asignatura_docente },
        version: version1,
      },
    });

    const v2 = await this.versionRepo.findOne({
      where: {
        grupo_asignatura_docente: { id_grupo_asignatura_docente: grupoAsigDoc.id_grupo_asignatura_docente },
        version: version2,
      },
    });

    if (!v1 || !v2) {
      throw new NotFoundException('Una o ambas versiones no encontradas');
    }

    const diferencias: Array<{ campo: string; valor_v1: any; valor_v2: any }> = [];
    const datos1 = v1.datos_version;
    const datos2 = v2.datos_version;

    if (datos1 && datos2) {
      Object.keys(datos1).forEach((key) => {
        if (datos1[key] !== datos2[key]) {
          diferencias.push({
            campo: key,
            valor_v1: datos1[key],
            valor_v2: datos2[key],
          });
        }
      });
    }

    return {
      version1: v1,
      version2: v2,
      diferencias,
    };
  }

  /**
   * Restaurar a una versión anterior
   */
  async restaurarVersion(
    id: number,
    versionId: number,
    idUsuario: number,
  ): Promise<GrupoAsignaturaDocente> {
    const grupoAsigDoc = await this.findOne(id);
    const version = await this.versionRepo.findOne({
      where: {
        id_version: versionId,
        grupo_asignatura_docente: { id_grupo_asignatura_docente: grupoAsigDoc.id_grupo_asignatura_docente },
      },
      relations: ['usuario_creador'],
    });

    if (!version) {
      throw new NotFoundException(`Versión con ID ${versionId} no encontrada`);
    }

    // Validar permisos (solo coordinador o administrador)
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: idUsuario },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const tienePermiso = usuario.usuarioRoles?.some(
      (ur) =>
        (ur.rol?.nombre_rol === RolEnum.COORDINADOR || ur.rol?.nombre_rol === RolEnum.ADMINISTRADOR) &&
        ur.estado === 'activo',
    );

    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para restaurar versiones');
    }

    // Restaurar datos de la versión
    if (version.datos_version) {
      const datos = version.datos_version;

      if (datos.id_docente) {
        const docente = await this.docenteRepo.findOne({
          where: { id_docente: datos.id_docente },
        });
        if (docente) {
          grupoAsigDoc.docente = docente;
        }
      }

      if (datos.estado) {
        grupoAsigDoc.estado = datos.estado;
      }

      if (datos.observaciones !== undefined) {
        grupoAsigDoc.observaciones = datos.observaciones;
      }
    }

    // Crear nueva versión con los datos restaurados
    grupoAsigDoc.version_actual += 1;
    grupoAsigDoc.estado_aprobacion = 'borrador';

    const saved = await this.grupoAsigDocRepo.save(grupoAsigDoc);

    const nuevaVersion = this.versionRepo.create({
      grupo_asignatura_docente: saved,
      version: grupoAsigDoc.version_actual,
      estado_version: EstadoVersion.INICIAL,
      usuario_creador: usuario,
      fecha_creacion: new Date(),
      datos_version: {
        id_grupo: saved.grupo.id_grupo,
        id_asignatura: saved.asignatura.id_asignatura,
        id_docente: saved.docente.id_docente,
        estado: saved.estado,
        observaciones: saved.observaciones ?? undefined,
      },
      observaciones: `Restaurada desde versión ${version.version}`,
      activa: true,
    });

    // Desactivar versiones anteriores
    await this.versionRepo.update(
      {
        grupo_asignatura_docente: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
        activa: true,
      },
      { activa: false },
    );

    await this.versionRepo.save(nuevaVersion);

    const result = await this.grupoAsigDocRepo.findOne({
      where: { id_grupo_asignatura_docente: saved.id_grupo_asignatura_docente },
      relations: ['grupo', 'asignatura', 'docente', 'versiones'],
    });

    if (!result) {
      throw new NotFoundException('Error al recuperar la carga docente restaurada');
    }

    return result;
  }
}

