import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/common/entities/planes.entity';
import { PlanCarrera } from 'src/common/entities/plan_carrera.entity';
import { PlanCarreraAsignatura } from 'src/common/entities/plan_carrera_asignatura.entity';
import { Carrera } from 'src/common/entities/carreras.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryPlanDto } from './dto/query-plan.dto';
import { CreatePlanCarreraDto } from './dto/create-plan-carrera.dto';
import { CreatePlanCarreraAsignaturaDto } from './dto/create-plan-carrera-asignatura.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    @InjectRepository(PlanCarrera)
    private readonly planCarreraRepo: Repository<PlanCarrera>,
    @InjectRepository(PlanCarreraAsignatura)
    private readonly planCarreraAsigRepo: Repository<PlanCarreraAsignatura>,
    @InjectRepository(Carrera)
    private readonly carreraRepo: Repository<Carrera>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepo: Repository<Asignatura>,
  ) {}

  async create(createDto: CreatePlanDto): Promise<Plan> {
    // Validar que el código del plan no exista
    const planExistente = await this.planRepo.findOne({
      where: { codigo_plan: createDto.codigo_plan },
    });

    if (planExistente) {
      throw new ConflictException(
        `Ya existe un plan con el código ${createDto.codigo_plan}`,
      );
    }

    const nuevoPlan = this.planRepo.create({
      nombre_plan: createDto.nombre_plan,
      codigo_plan: createDto.codigo_plan,
      año: createDto.año,
      descripcion: createDto.descripcion,
      estado: createDto.estado || 'activo',
      fecha_inicio: createDto.fecha_inicio ? new Date(createDto.fecha_inicio) : null,
      fecha_fin: createDto.fecha_fin ? new Date(createDto.fecha_fin) : null,
    });

    return await this.planRepo.save(nuevoPlan);
  }

  async findAll(
    query?: QueryPlanDto,
  ): Promise<Plan[] | { data: Plan[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.carreras', 'carreras')
      .leftJoinAndSelect('carreras.carrera', 'carrera');

    // Búsqueda por nombre o código
    if (query?.search) {
      queryBuilder.where(
        '(plan.nombre_plan ILIKE :search OR plan.codigo_plan ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filtro por año
    if (query?.año) {
      const whereClause = query?.search ? 'andWhere' : 'where';
      queryBuilder[whereClause]('plan.año = :año', { año: query.año });
    }

    // Filtro por estado
    if (query?.estado) {
      const whereClause = query?.search || query?.año ? 'andWhere' : 'where';
      queryBuilder[whereClause]('plan.estado = :estado', { estado: query.estado });
    }

    // Ordenamiento
    const orderBy = query?.orderBy || 'año';
    const orderDirection = query?.orderDirection || 'DESC';
    queryBuilder.orderBy(`plan.${orderBy}`, orderDirection);

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

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepo.findOne({
      where: { id_plan: id },
      relations: [
        'carreras',
        'carreras.carrera',
        'carreras.asignaturas',
        'carreras.asignaturas.asignatura',
      ],
    });

    if (!plan) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }

    return plan;
  }

  async update(id: number, updateDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);

    // Validar código único si se actualiza
    if (updateDto.codigo_plan && updateDto.codigo_plan !== plan.codigo_plan) {
      const planExistente = await this.planRepo.findOne({
        where: { codigo_plan: updateDto.codigo_plan },
      });

      if (planExistente) {
        throw new ConflictException(
          `Ya existe un plan con el código ${updateDto.codigo_plan}`,
        );
      }

      plan.codigo_plan = updateDto.codigo_plan;
    }

    // Actualizar otros campos
    if (updateDto.nombre_plan !== undefined) {
      plan.nombre_plan = updateDto.nombre_plan;
    }

    if (updateDto.año !== undefined) {
      plan.año = updateDto.año;
    }

    if (updateDto.descripcion !== undefined) {
      plan.descripcion = updateDto.descripcion;
    }

    if (updateDto.estado !== undefined) {
      plan.estado = updateDto.estado;
    }

    if (updateDto.fecha_inicio !== undefined) {
      plan.fecha_inicio = updateDto.fecha_inicio ? new Date(updateDto.fecha_inicio) : null;
    }

    if (updateDto.fecha_fin !== undefined) {
      plan.fecha_fin = updateDto.fecha_fin ? new Date(updateDto.fecha_fin) : null;
    }

    return await this.planRepo.save(plan);
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findOne(id);

    // Validar que el plan no esté siendo usado por grupos
    const gruposConPlan = await this.planRepo
      .createQueryBuilder('plan')
      .leftJoin('plan.grupos', 'grupo')
      .where('plan.id_plan = :id', { id })
      .select('COUNT(grupo.id_grupo)', 'count')
      .getRawOne();

    if (gruposConPlan && parseInt(gruposConPlan.count) > 0) {
      throw new BadRequestException(
        `No se puede eliminar el plan. Está siendo usado por ${gruposConPlan.count} grupo(s)`,
      );
    }

    await this.planRepo.remove(plan);
  }

  // ========== MÉTODOS PARA CARRERAS ==========

  async agregarCarreras(idPlan: number, createDto: CreatePlanCarreraDto) {
    const plan = await this.findOne(idPlan);

    const resultados = {
      agregadas: [] as PlanCarrera[],
      errores: [] as Array<{ id_carrera: number; error: string }>,
      total: createDto.id_carreras.length,
      exitosas: 0,
      fallidas: 0,
    };

    for (const idCarrera of createDto.id_carreras) {
      try {
        // Validar que la carrera existe
        const carrera = await this.carreraRepo.findOne({
          where: { id_carrera: idCarrera },
        });

        if (!carrera) {
          resultados.errores.push({
            id_carrera: idCarrera,
            error: `Carrera con ID ${idCarrera} no encontrada`,
          });
          resultados.fallidas++;
          continue;
        }

        // Validar que no esté ya agregada
        const planCarreraExistente = await this.planCarreraRepo.findOne({
          where: {
            plan: { id_plan: idPlan },
            carrera: { id_carrera: idCarrera },
          },
        });

        if (planCarreraExistente) {
          resultados.errores.push({
            id_carrera: idCarrera,
            error: `La carrera ${carrera.nombre_carrera} ya está agregada al plan`,
          });
          resultados.fallidas++;
          continue;
        }

        // Crear la relación
        const planCarrera = this.planCarreraRepo.create({
          plan,
          carrera,
        });

        const saved = await this.planCarreraRepo.save(planCarrera);
        
        // Recargar con relaciones para la respuesta
        const planCarreraConRelaciones = await this.planCarreraRepo.findOne({
          where: { id_plan_carrera: saved.id_plan_carrera },
          relations: ['carrera', 'plan'],
        });
        
        if (!planCarreraConRelaciones) {
          throw new Error('Error al recargar la relación plan-carrera');
        }
        
        // Construir respuesta sin el array carreras del plan (es redundante)
        const respuesta = {
          id_plan_carrera: planCarreraConRelaciones.id_plan_carrera,
          plan: {
            id_plan: planCarreraConRelaciones.plan.id_plan,
            nombre_plan: planCarreraConRelaciones.plan.nombre_plan,
            codigo_plan: planCarreraConRelaciones.plan.codigo_plan,
            año: planCarreraConRelaciones.plan.año,
            descripcion: planCarreraConRelaciones.plan.descripcion,
            estado: planCarreraConRelaciones.plan.estado,
            fecha_inicio: planCarreraConRelaciones.plan.fecha_inicio,
            fecha_fin: planCarreraConRelaciones.plan.fecha_fin,
          },
          carrera: planCarreraConRelaciones.carrera,
        };
        
        resultados.agregadas.push(respuesta as any);
        resultados.exitosas++;
      } catch (error) {
        resultados.errores.push({
          id_carrera: idCarrera,
          error: error.message || 'Error desconocido',
        });
        resultados.fallidas++;
      }
    }

    return resultados;
  }

  async obtenerCarreras(idPlan: number) {
    const plan = await this.findOne(idPlan);

    return await this.planCarreraRepo.find({
      where: { plan: { id_plan: idPlan } },
      relations: ['carrera'],
      order: { id_plan_carrera: 'ASC' },
    });
  }

  async removerCarrera(idPlan: number, idPlanCarrera: number): Promise<void> {
    const plan = await this.findOne(idPlan);

    const planCarrera = await this.planCarreraRepo.findOne({
      where: {
        id_plan_carrera: idPlanCarrera,
        plan: { id_plan: idPlan },
      },
      relations: ['asignaturas'],
    });

    if (!planCarrera) {
      throw new NotFoundException(
        `No se encontró la relación plan-carrera con ID ${idPlanCarrera} para el plan ${idPlan}`,
      );
    }

    // Si tiene asignaturas, también se eliminarán por CASCADE
    await this.planCarreraRepo.remove(planCarrera);
  }

  // ========== MÉTODOS PARA ASIGNATURAS ==========

  async agregarAsignaturas(
    idPlan: number,
    idPlanCarrera: number,
    createDto: CreatePlanCarreraAsignaturaDto,
  ) {
    // Validar que el plan existe
    const plan = await this.planRepo.findOne({
      where: { id_plan: idPlan },
    });

    if (!plan) {
      throw new NotFoundException(`Plan con ID ${idPlan} no encontrado`);
    }

    // Validar que el plan-carrera existe y pertenece al plan
    const planCarrera = await this.planCarreraRepo.findOne({
      where: {
        id_plan_carrera: idPlanCarrera,
        plan: { id_plan: idPlan },
      },
      relations: ['plan', 'carrera'],
    });

    if (!planCarrera) {
      throw new NotFoundException(
        `No se encontró la relación plan-carrera con ID ${idPlanCarrera} para el plan ${idPlan}`,
      );
    }

    // Determinar si es una o múltiples asignaturas
    const idAsignaturas: number[] = createDto.id_asignaturas
      ? createDto.id_asignaturas
      : createDto.id_asignatura
        ? [createDto.id_asignatura]
        : [];

    if (idAsignaturas.length === 0) {
      throw new BadRequestException(
        'Debe proporcionar id_asignatura o id_asignaturas',
      );
    }

    const resultados: any[] = [];
    const errores: Array<{ id_asignatura: number; error: string }> = [];

    for (const idAsignatura of idAsignaturas) {
      try {
        // Validar que la asignatura existe
        const asignatura = await this.asignaturaRepo.findOne({
          where: { id_asignatura: idAsignatura },
          relations: ['carrera'],
        });

        if (!asignatura) {
          errores.push({
            id_asignatura: idAsignatura,
            error: `Asignatura con ID ${idAsignatura} no encontrada`,
          });
          continue;
        }

        // Validar que la asignatura pertenece a la carrera del plan-carrera
        if (asignatura.carrera.id_carrera !== planCarrera.carrera.id_carrera) {
          errores.push({
            id_asignatura: idAsignatura,
            error: `La asignatura ${asignatura.nombre_asignatura} no pertenece a la carrera ${planCarrera.carrera.nombre_carrera}`,
          });
          continue;
        }

        // Validar que no esté ya agregada
        const planCarreraAsigExistente = await this.planCarreraAsigRepo.findOne({
          where: {
            planCarrera: { id_plan_carrera: idPlanCarrera },
            asignatura: { id_asignatura: idAsignatura },
          },
        });

        if (planCarreraAsigExistente) {
          errores.push({
            id_asignatura: idAsignatura,
            error: `La asignatura ${asignatura.nombre_asignatura} ya está agregada al plan-carrera`,
          });
          continue;
        }

        // Crear la relación
        const planCarreraAsig = this.planCarreraAsigRepo.create({
          planCarrera,
          asignatura,
        });

        const saved = await this.planCarreraAsigRepo.save(planCarreraAsig);
        
        // Cargar la relación completa para retornar
        const savedWithRelations = await this.planCarreraAsigRepo.findOne({
          where: { id_plan_carrera_asignatura: saved.id_plan_carrera_asignatura },
          relations: ['asignatura', 'asignatura.carrera', 'planCarrera'],
        });

        if (savedWithRelations) {
          // Transformar a la estructura esperada
          const resultado = {
            id_plan_carrera_asignatura: savedWithRelations.id_plan_carrera_asignatura,
            id_plan_carrera: savedWithRelations.planCarrera?.id_plan_carrera || idPlanCarrera,
            id_asignatura: savedWithRelations.asignatura?.id_asignatura,
            asignatura: savedWithRelations.asignatura
              ? {
                  id_asignatura: savedWithRelations.asignatura.id_asignatura,
                  nombre_asignatura: savedWithRelations.asignatura.nombre_asignatura,
                  codigo_asignatura: savedWithRelations.asignatura.codigo_asignatura,
                  id_carrera: savedWithRelations.asignatura.carrera?.id_carrera,
                }
              : undefined,
          };
          resultados.push(resultado);
        }
      } catch (error: any) {
        errores.push({
          id_asignatura: idAsignatura,
          error: error.message || 'Error desconocido',
        });
      }
    }

    // Si hay errores y no se agregó ninguna, lanzar excepción
    if (errores.length > 0 && resultados.length === 0) {
      throw new BadRequestException(
        `No se pudo agregar ninguna asignatura. Errores: ${errores.map((e) => e.error).join(', ')}`,
      );
    }

    // Si es una sola asignatura, retornar el objeto directamente
    // Si son múltiples, retornar el array
    return resultados.length === 1 && !createDto.id_asignaturas
      ? resultados[0]
      : resultados;
  }

  async obtenerAsignaturas(idPlan: number, idPlanCarrera: number) {
    // Validar que el plan existe
    const plan = await this.planRepo.findOne({
      where: { id_plan: idPlan },
    });

    if (!plan) {
      throw new NotFoundException(`Plan con ID ${idPlan} no encontrado`);
    }

    // Validar que el plan-carrera existe y pertenece al plan
    const planCarrera = await this.planCarreraRepo.findOne({
      where: {
        id_plan_carrera: idPlanCarrera,
        plan: { id_plan: idPlan },
      },
    });

    if (!planCarrera) {
      throw new NotFoundException(
        `No se encontró la relación plan-carrera con ID ${idPlanCarrera} para el plan ${idPlan}`,
      );
    }

    const asignaturas = await this.planCarreraAsigRepo.find({
      where: { planCarrera: { id_plan_carrera: idPlanCarrera } },
      relations: ['asignatura', 'asignatura.carrera', 'planCarrera'],
      order: { id_plan_carrera_asignatura: 'ASC' },
    });

    // Transformar a la estructura esperada
    return asignaturas.map((pca) => ({
      id_plan_carrera_asignatura: pca.id_plan_carrera_asignatura,
      id_plan_carrera: pca.planCarrera?.id_plan_carrera || idPlanCarrera,
      id_asignatura: pca.asignatura?.id_asignatura,
      asignatura: pca.asignatura
        ? {
            id_asignatura: pca.asignatura.id_asignatura,
            nombre_asignatura: pca.asignatura.nombre_asignatura,
            codigo_asignatura: pca.asignatura.codigo_asignatura,
            id_carrera: pca.asignatura.carrera?.id_carrera,
          }
        : undefined,
    }));
  }

  async removerAsignatura(
    idPlan: number,
    idPlanCarrera: number,
    idPlanCarreraAsignatura: number,
  ): Promise<void> {
    // Validar que el plan existe
    const plan = await this.planRepo.findOne({
      where: { id_plan: idPlan },
    });

    if (!plan) {
      throw new NotFoundException(`Plan con ID ${idPlan} no encontrado`);
    }

    // Validar que el plan-carrera existe y pertenece al plan
    const planCarrera = await this.planCarreraRepo.findOne({
      where: {
        id_plan_carrera: idPlanCarrera,
        plan: { id_plan: idPlan },
      },
    });

    if (!planCarrera) {
      throw new NotFoundException(
        `No se encontró la relación plan-carrera con ID ${idPlanCarrera} para el plan ${idPlan}`,
      );
    }

    const planCarreraAsig = await this.planCarreraAsigRepo.findOne({
      where: {
        id_plan_carrera_asignatura: idPlanCarreraAsignatura,
        planCarrera: { id_plan_carrera: idPlanCarrera },
      },
    });

    if (!planCarreraAsig) {
      throw new NotFoundException(
        `No se encontró la asignatura con ID ${idPlanCarreraAsignatura} en el plan-carrera ${idPlanCarrera}`,
      );
    }

    await this.planCarreraAsigRepo.remove(planCarreraAsig);
  }

  // ========== MÉTODOS DE CONSULTA ÚTILES ==========

  async obtenerAsignaturasPorPlanYCarrera(idPlan: number, idCarrera: number) {
    const planCarrera = await this.planCarreraRepo.findOne({
      where: {
        plan: { id_plan: idPlan },
        carrera: { id_carrera: idCarrera },
      },
    });

    if (!planCarrera) {
      throw new NotFoundException(
        `No se encontró la relación plan-carrera para el plan ${idPlan} y carrera ${idCarrera}`,
      );
    }

    return await this.planCarreraAsigRepo.find({
      where: { planCarrera: { id_plan_carrera: planCarrera.id_plan_carrera } },
      relations: ['asignatura', 'asignatura.carrera'],
      order: { id_plan_carrera_asignatura: 'ASC' },
    });
  }

  /**
   * Obtiene todas las asignaturas de una carrera
   */
  async obtenerAsignaturasPorCarrera(idCarrera: number): Promise<Asignatura[]> {
    // Validar que la carrera existe
    const carrera = await this.carreraRepo.findOne({
      where: { id_carrera: idCarrera },
    });

    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${idCarrera} no encontrada`);
    }

    // Obtener todas las asignaturas de la carrera
    return await this.asignaturaRepo.find({
      where: { carrera: { id_carrera: idCarrera } },
      relations: ['carrera'],
      order: { codigo_asignatura: 'ASC' },
    });
  }

  /**
   * Obtiene el plan completo con todas sus relaciones (carreras y asignaturas)
   * en una estructura optimizada para el frontend
   */
  async obtenerPlanConDetalles(idPlan: number) {
    const plan = await this.planRepo.findOne({
      where: { id_plan: idPlan },
      relations: [
        'carreras',
        'carreras.carrera',
        'carreras.carrera.departamento',
        'carreras.asignaturas',
        'carreras.asignaturas.asignatura',
        'carreras.asignaturas.asignatura.carrera',
      ],
      order: {
        carreras: {
          carrera: {
            nombre_carrera: 'ASC',
          },
          asignaturas: {
            asignatura: {
              codigo_asignatura: 'ASC',
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan con ID ${idPlan} no encontrado`);
    }

    // Transformar a la estructura esperada
    return {
      // Datos del Plan
      id_plan: plan.id_plan,
      nombre_plan: plan.nombre_plan,
      codigo_plan: plan.codigo_plan,
      año: plan.año,
      fecha_inicio: plan.fecha_inicio,
      fecha_fin: plan.fecha_fin,
      descripcion: plan.descripcion,
      estado: plan.estado,
      // Array de carreras con sus asignaturas
      carreras: plan.carreras?.map((planCarrera) => ({
        // Datos de PlanCarrera
        id_plan_carrera: planCarrera.id_plan_carrera,
        id_plan: planCarrera.plan?.id_plan || idPlan,
        id_carrera: planCarrera.carrera?.id_carrera,
        // Relación completa de Carrera
        carrera: planCarrera.carrera
          ? {
              id_carrera: planCarrera.carrera.id_carrera,
              nombre_carrera: planCarrera.carrera.nombre_carrera,
              codigo_carrera: planCarrera.carrera.codigo_carrera,
              id_departamento: planCarrera.carrera.departamento?.id_departamento,
            }
          : null,
        // Array de asignaturas de esta carrera en el plan
        asignaturas: planCarrera.asignaturas?.map((planCarreraAsig) => ({
          // Datos de PlanCarreraAsignatura
          id_plan_carrera_asignatura: planCarreraAsig.id_plan_carrera_asignatura,
          id_plan_carrera: planCarreraAsig.planCarrera?.id_plan_carrera || planCarrera.id_plan_carrera,
          id_asignatura: planCarreraAsig.asignatura?.id_asignatura,
          // Relación completa de Asignatura
          asignatura: planCarreraAsig.asignatura
            ? {
                id_asignatura: planCarreraAsig.asignatura.id_asignatura,
                nombre_asignatura: planCarreraAsig.asignatura.nombre_asignatura,
                codigo_asignatura: planCarreraAsig.asignatura.codigo_asignatura,
                id_carrera: planCarreraAsig.asignatura.carrera?.id_carrera,
                creditos: planCarreraAsig.asignatura.creditos,
                horas_semanales: planCarreraAsig.asignatura.horas_semanales,
                semestre: planCarreraAsig.asignatura.semestre,
                tipo: planCarreraAsig.asignatura.tipo,
                estado: planCarreraAsig.asignatura.estado,
                prerequisitos: planCarreraAsig.asignatura.prerequisitos,
              }
            : null,
        })) || [],
      })) || [],
    };
  }
}

