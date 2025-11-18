import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CargaDocente } from 'src/common/entities/carga_docentes.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { Grupo } from 'src/common/entities/grupos.entity';
import { CreateCargaDocenteDto } from './dto/create-carga-docente.dto';
import { UpdateCargaDocenteDto } from './dto/update-carga-docente.dto';
import { QueryCargaDocenteDto } from './dto/query-carga-docente.dto';

@Injectable()
export class CargaDocenteService {
  constructor(
    @InjectRepository(CargaDocente)
    private readonly cargaDocenteRepo: Repository<CargaDocente>,
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
  ) {}

  async create(createDto: CreateCargaDocenteDto): Promise<CargaDocente> {
    const { id_docente, id_grupo } = createDto;

    const docente = await this.docenteRepo.findOne({ where: { id_docente } });
    if (!docente) {
      throw new NotFoundException(`Docente con ID ${id_docente} no encontrado`);
    }

    const grupo = await this.grupoRepo.findOne({ where: { id_grupo } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id_grupo} no encontrado`);
    }

    const cargaExistente = await this.cargaDocenteRepo.findOne({
      where: {
        docente: { id_docente },
        grupo: { id_grupo },
        estado: 'asignada',
      },
      relations: ['docente', 'grupo'],
    });

    if (cargaExistente) {
      throw new BadRequestException(
        `El docente ya tiene una carga activa asignada a este grupo`,
      );
    }

    const tiposValidos = ['titular', 'suplente', 'auxiliar', 'coordinador'];
    const tipoVinculacion = createDto.tipo_vinculacion || 'titular';
    if (!tiposValidos.includes(tipoVinculacion)) {
      throw new BadRequestException(
        `Tipo de vinculación inválido. Valores permitidos: ${tiposValidos.join(', ')}`,
      );
    }

    const estadosValidos = ['asignada', 'finalizada', 'cancelada'];
    const estado = createDto.estado || 'asignada';
    if (!estadosValidos.includes(estado)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`,
      );
    }

    const newCarga = this.cargaDocenteRepo.create({
      docente,
      grupo,
      tipo_vinculacion: tipoVinculacion,
      estado: estado,
      observaciones: createDto.observaciones,
    });

    return await this.cargaDocenteRepo.save(newCarga);
  }

  async findAll(
    query?: QueryCargaDocenteDto,
  ): Promise<
    | CargaDocente[]
    | { data: CargaDocente[]; total: number; page: number; limit: number }
  > {
    const queryBuilder = this.cargaDocenteRepo
      .createQueryBuilder('carga')
      .leftJoinAndSelect('carga.docente', 'docente')
      .leftJoinAndSelect('carga.grupo', 'grupo')
      .leftJoinAndSelect('grupo.asignatura', 'asignatura')
      .leftJoinAndSelect('asignatura.carrera', 'carrera');

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (query?.idDocente) {
      conditions.push('carga.id_docente = :idDocente');
      parameters.idDocente = query.idDocente;
    }

    if (query?.idGrupo) {
      conditions.push('carga.id_grupo = :idGrupo');
      parameters.idGrupo = query.idGrupo;
    }

    if (query?.tipo_vinculacion) {
      conditions.push('carga.tipo_vinculacion = :tipo_vinculacion');
      parameters.tipo_vinculacion = query.tipo_vinculacion;
    }

    if (query?.estado) {
      conditions.push('carga.estado = :estado');
      parameters.estado = query.estado;
    }

    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), parameters);
    }

    queryBuilder.orderBy('carga.fecha_asignacion', 'DESC');

    if (query?.page && query?.limit) {
      const page = Math.max(1, query.page);
      const limit = Math.min(100, Math.max(1, query.limit));
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();
      return { data, total, page, limit };
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<CargaDocente> {
    const carga = await this.cargaDocenteRepo.findOne({
      where: { id_carga: id },
      relations: [
        'docente',
        'grupo',
        'grupo.asignatura',
        'grupo.asignatura.carrera',
      ],
    });

    if (!carga) {
      throw new NotFoundException(`Carga docente con ID ${id} no encontrada`);
    }

    return carga;
  }

  async update(
    id: number,
    updateDto: UpdateCargaDocenteDto,
  ): Promise<CargaDocente> {
    const carga = await this.findOne(id);

    if (updateDto.id_docente) {
      const docente = await this.docenteRepo.findOne({
        where: { id_docente: updateDto.id_docente },
      });
      if (!docente) {
        throw new NotFoundException(
          `Docente con ID ${updateDto.id_docente} no encontrado`,
        );
      }
      carga.docente = docente;
    }

    if (updateDto.id_grupo) {
      const grupo = await this.grupoRepo.findOne({
        where: { id_grupo: updateDto.id_grupo },
      });
      if (!grupo) {
        throw new NotFoundException(
          `Grupo con ID ${updateDto.id_grupo} no encontrado`,
        );
      }
      carga.grupo = grupo;
    }

    Object.assign(carga, {
      ...updateDto,
      id_docente: undefined,
      id_grupo: undefined,
    });

    return await this.cargaDocenteRepo.save(carga);
  }

  async remove(id: number): Promise<void> {
    const carga = await this.findOne(id);
    await this.cargaDocenteRepo.remove(carga);
  }

  async getCargasByDocente(idDocente: number): Promise<CargaDocente[]> {
    const docente = await this.docenteRepo.findOne({
      where: { id_docente: idDocente },
    });
    if (!docente) {
      throw new NotFoundException(`Docente con ID ${idDocente} no encontrado`);
    }

    const result = await this.findAll({ idDocente });
    return Array.isArray(result) ? result : result.data;
  }

  async getDocentesByGrupo(idGrupo: number): Promise<CargaDocente[]> {
    const grupo = await this.grupoRepo.findOne({ where: { id_grupo: idGrupo } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${idGrupo} no encontrado`);
    }

    const result = await this.findAll({ idGrupo });
    return Array.isArray(result) ? result : result.data;
  }

  async getCargasActivasByDocente(idDocente: number): Promise<CargaDocente[]> {
    const docente = await this.docenteRepo.findOne({
      where: { id_docente: idDocente },
    });
    if (!docente) {
      throw new NotFoundException(`Docente con ID ${idDocente} no encontrado`);
    }

    return await this.cargaDocenteRepo.find({
      where: {
        docente: { id_docente: idDocente },
        estado: 'asignada',
      },
      relations: [
        'docente',
        'grupo',
        'grupo.asignatura',
        'grupo.asignatura.carrera',
      ],
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async countCargasActivasByDocente(idDocente: number): Promise<number> {
    return await this.cargaDocenteRepo.count({
      where: {
        docente: { id_docente: idDocente },
        estado: 'asignada',
      },
    });
  }

  async canAssignDocenteToGrupo(
    idDocente: number,
    idGrupo: number,
  ): Promise<{ canAssign: boolean; reason?: string }> {
    const docente = await this.docenteRepo.findOne({
      where: { id_docente: idDocente },
    });
    if (!docente) {
      return { canAssign: false, reason: 'Docente no encontrado' };
    }

    const grupo = await this.grupoRepo.findOne({
      where: { id_grupo: idGrupo },
    });
    if (!grupo) {
      return { canAssign: false, reason: 'Grupo no encontrado' };
    }

    const cargaExistente = await this.cargaDocenteRepo.findOne({
      where: {
        docente: { id_docente: idDocente },
        grupo: { id_grupo: idGrupo },
        estado: 'asignada',
      },
    });

    if (cargaExistente) {
      return {
        canAssign: false,
        reason: 'El docente ya tiene una carga activa en este grupo',
      };
    }

    return { canAssign: true };
  }

  // FIX APLICADO: TABLA CON MAYÚSCULAS → "Tbl_Grupos"
  async finalizarCargasByPeriodo(periodoAcademico: string): Promise<number> {
    const result = await this.cargaDocenteRepo
      .createQueryBuilder('carga')
      .update(CargaDocente)
      .set({ estado: 'finalizada' })
      .where('carga.estado = :estado', { estado: 'asignada' })
      .andWhere(
        'carga.id_grupo IN (SELECT id_grupo FROM "Tbl_Grupos" WHERE periodo_academico = :periodo)',
        { periodo: periodoAcademico },
      )
      .execute();

    return result.affected || 0;
  }
}
