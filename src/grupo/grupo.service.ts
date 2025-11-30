import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from 'src/common/entities/grupos.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { Carrera } from 'src/common/entities/carreras.entity';
import { Plan } from 'src/common/entities/planes.entity';
import { GrupoAsignaturaDocente } from 'src/common/entities/grupo_asignatura_docente.entity';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { QueryGrupoDto } from './dto/query-grupo.dto';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(Carrera)
    private readonly carreraRepo: Repository<Carrera>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    @InjectRepository(GrupoAsignaturaDocente)
    private readonly grupoAsigDocRepo: Repository<GrupoAsignaturaDocente>,
  ) {}

  async create(createDto: CreateGrupoDto): Promise<Grupo> {
    // Validar que el plan existe
    const plan = await this.planRepo.findOne({
      where: { id_plan: createDto.id_plan },
    });

    if (!plan) {
      throw new NotFoundException(`Plan con ID ${createDto.id_plan} no encontrado`);
    }

    // Validar que la carrera existe
    const carrera = await this.carreraRepo.findOne({
      where: { id_carrera: createDto.id_carrera },
    });

    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${createDto.id_carrera} no encontrada`);
    }

    // Validar que el docente titular existe (si se proporciona)
    let docenteTitular: Docente | null = null;
    if (createDto.id_docente_titular) {
      docenteTitular = await this.docenteRepo.findOne({
        where: { id_docente: createDto.id_docente_titular },
      });

      if (!docenteTitular) {
        throw new NotFoundException(`Docente con ID ${createDto.id_docente_titular} no encontrado`);
      }
    }

    // Validar min y max asignaturas
    if (createDto.min_asignaturas && createDto.max_asignaturas) {
      if (createDto.min_asignaturas > createDto.max_asignaturas) {
        throw new BadRequestException(
          'El mínimo de asignaturas no puede ser mayor que el máximo',
        );
      }
    }

    // Verificar que el código de grupo no exista en el mismo periodo
    const grupoExistente = await this.grupoRepo.findOne({
      where: {
        codigo_grupo: createDto.codigo_grupo,
        periodo_academico: createDto.periodo_academico,
      },
    });

    if (grupoExistente) {
      throw new BadRequestException(
        `Ya existe un grupo con el código ${createDto.codigo_grupo} en el periodo ${createDto.periodo_academico}`,
      );
    }

    const grupoData: Partial<Grupo> = {
      plan: plan,
      carrera: carrera,
      codigo_grupo: createDto.codigo_grupo,
      nombre_grupo: createDto.nombre_grupo,
      periodo_academico: createDto.periodo_academico,
      estado: createDto.estado || 'activo',
      min_asignaturas: createDto.min_asignaturas,
      max_asignaturas: createDto.max_asignaturas,
    };

    if (docenteTitular) {
      grupoData.docente_titular = docenteTitular;
    }

    const newGrupo = this.grupoRepo.create(grupoData);

    return await this.grupoRepo.save(newGrupo);
  }

  async findAll(
    query?: QueryGrupoDto,
  ): Promise<Grupo[] | { data: Grupo[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.grupoRepo
      .createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.plan', 'plan')
      .leftJoinAndSelect('grupo.carrera', 'carrera')
      .leftJoinAndSelect('grupo.docente_titular', 'docente_titular')
      .leftJoinAndSelect('grupo.asignaturas_docentes', 'asignaturas_docentes')
      .leftJoinAndSelect('asignaturas_docentes.asignatura', 'asignatura')
      .leftJoinAndSelect('asignaturas_docentes.docente', 'docente');

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

    // Filtro por plan
    if (query?.id_plan) {
      const whereClause = query?.search || query?.estado ? 'andWhere' : 'where';
      queryBuilder[whereClause]('plan.id_plan = :id_plan', {
        id_plan: query.id_plan,
      });
    }

    // Filtro por carrera
    if (query?.id_carrera) {
      const whereClause =
        query?.search || query?.estado || query?.id_plan ? 'andWhere' : 'where';
      queryBuilder[whereClause]('carrera.id_carrera = :id_carrera', {
        id_carrera: query.id_carrera,
      });
    }

    // Filtro por docente titular
    if (query?.id_docente_titular) {
      const whereClause =
        query?.search || query?.estado || query?.id_plan || query?.id_carrera
          ? 'andWhere'
          : 'where';
      queryBuilder[whereClause]('docente_titular.id_docente = :id_docente_titular', {
        id_docente_titular: query.id_docente_titular,
      });
    }

    // Filtro por periodo académico
    if (query?.periodo_academico) {
      const whereClause =
        query?.search || query?.estado || query?.id_carrera || query?.id_docente_titular
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
      relations: [
        'plan',
        'carrera',
        'docente_titular',
        'asignaturas_docentes',
        'asignaturas_docentes.asignatura',
        'asignaturas_docentes.docente',
      ],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }

    return grupo;
  }

  async findByCodigo(codigo: string): Promise<Grupo> {
    const grupo = await this.grupoRepo.findOne({
      where: { codigo_grupo: codigo },
      relations: [
        'plan',
        'carrera',
        'docente_titular',
        'asignaturas_docentes',
        'asignaturas_docentes.asignatura',
        'asignaturas_docentes.docente',
      ],
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con código ${codigo} no encontrado`);
    }

    return grupo;
  }

  async findByAsignatura(idAsignatura: number): Promise<Grupo[]> {
    // Buscar grupos que tengan esta asignatura a través de la tabla intermedia
    const gruposAsig = await this.grupoAsigDocRepo.find({
      where: { asignatura: { id_asignatura: idAsignatura } },
      relations: ['grupo', 'grupo.plan', 'grupo.carrera', 'grupo.docente_titular', 'asignatura', 'docente'],
    });

    // Extraer grupos únicos
    const gruposMap = new Map<number, Grupo>();
    gruposAsig.forEach((ga) => {
      if (!gruposMap.has(ga.grupo.id_grupo)) {
        gruposMap.set(ga.grupo.id_grupo, ga.grupo);
      }
    });

    return Array.from(gruposMap.values()).sort((a, b) =>
      a.codigo_grupo.localeCompare(b.codigo_grupo),
    );
  }

  async findByCarrera(idCarrera: number): Promise<Grupo[]> {
    const carrera = await this.carreraRepo.findOne({
      where: { id_carrera: idCarrera },
    });

    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${idCarrera} no encontrada`);
    }

    const grupos = await this.grupoRepo.find({
      where: { carrera: { id_carrera: idCarrera } },
      relations: [
        'plan',
        'carrera',
        'docente_titular',
        'asignaturas_docentes',
        'asignaturas_docentes.asignatura',
        'asignaturas_docentes.docente',
      ],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async findByDocente(idDocente: number): Promise<Grupo[]> {
    // Buscar grupos donde el docente es titular
    const grupos = await this.grupoRepo.find({
      where: { docente_titular: { id_docente: idDocente } },
      relations: [
        'plan',
        'carrera',
        'docente_titular',
        'asignaturas_docentes',
        'asignaturas_docentes.asignatura',
        'asignaturas_docentes.docente',
      ],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async findByPeriodo(periodo: string): Promise<Grupo[]> {
    const grupos = await this.grupoRepo.find({
      where: { periodo_academico: periodo },
      relations: [
        'plan',
        'carrera',
        'docente_titular',
        'asignaturas_docentes',
        'asignaturas_docentes.asignatura',
        'asignaturas_docentes.docente',
      ],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async findByEstado(estado: string): Promise<Grupo[]> {
    const grupos = await this.grupoRepo.find({
      where: { estado },
      relations: [
        'plan',
        'carrera',
        'docente_titular',
        'asignaturas_docentes',
        'asignaturas_docentes.asignatura',
        'asignaturas_docentes.docente',
      ],
      order: { codigo_grupo: 'ASC' },
    });

    return grupos;
  }

  async update(id: number, updateDto: UpdateGrupoDto): Promise<Grupo> {
    const grupo = await this.findOne(id);

    // Validar plan si se actualiza
    if (updateDto.id_plan) {
      const plan = await this.planRepo.findOne({
        where: { id_plan: updateDto.id_plan },
      });

      if (!plan) {
        throw new NotFoundException(`Plan con ID ${updateDto.id_plan} no encontrado`);
      }

      grupo.plan = plan;
    }

    // Validar carrera si se actualiza
    if (updateDto.id_carrera) {
      const carrera = await this.carreraRepo.findOne({
        where: { id_carrera: updateDto.id_carrera },
      });

      if (!carrera) {
        throw new NotFoundException(`Carrera con ID ${updateDto.id_carrera} no encontrada`);
      }

      grupo.carrera = carrera;
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
          throw new NotFoundException(
            `Docente con ID ${updateDto.id_docente_titular} no encontrado`,
          );
        }

        grupo.docente_titular = docente;
      }
    }

    // Validar min y max asignaturas
    if (updateDto.min_asignaturas !== undefined || updateDto.max_asignaturas !== undefined) {
      const minAsig = updateDto.min_asignaturas ?? grupo.min_asignaturas;
      const maxAsig = updateDto.max_asignaturas ?? grupo.max_asignaturas;

      if (minAsig && maxAsig && minAsig > maxAsig) {
        throw new BadRequestException(
          'El mínimo de asignaturas no puede ser mayor que el máximo',
        );
      }

      // Validar que el nuevo mínimo no sea mayor que las asignaturas actuales
      if (minAsig) {
        const asignaturasActivas = await this.grupoAsigDocRepo.count({
          where: {
            grupo: { id_grupo: id },
            estado: 'activa',
          },
        });

        if (asignaturasActivas < minAsig) {
          throw new BadRequestException(
            `No se puede establecer un mínimo de ${minAsig} asignaturas. El grupo actualmente tiene ${asignaturasActivas} asignaturas activas`,
          );
        }
      }

      // Validar que el nuevo máximo no sea menor que las asignaturas actuales
      if (maxAsig) {
        const asignaturasActivas = await this.grupoAsigDocRepo.count({
          where: {
            grupo: { id_grupo: id },
            estado: 'activa',
          },
        });

        if (asignaturasActivas > maxAsig) {
          throw new BadRequestException(
            `No se puede establecer un máximo de ${maxAsig} asignaturas. El grupo actualmente tiene ${asignaturasActivas} asignaturas activas`,
          );
        }
      }

      if (updateDto.min_asignaturas !== undefined) {
        grupo.min_asignaturas = updateDto.min_asignaturas;
      }
      if (updateDto.max_asignaturas !== undefined) {
        grupo.max_asignaturas = updateDto.max_asignaturas;
      }
    }

    // Verificar código único si se actualiza
    if (updateDto.codigo_grupo) {
      const periodo = updateDto.periodo_academico || grupo.periodo_academico;

      const grupoExistente = await this.grupoRepo.findOne({
        where: {
          codigo_grupo: updateDto.codigo_grupo,
          periodo_academico: periodo,
        },
      });

      if (grupoExistente && grupoExistente.id_grupo !== id) {
        throw new BadRequestException(
          `Ya existe un grupo con el código ${updateDto.codigo_grupo} en el periodo ${periodo}`,
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
