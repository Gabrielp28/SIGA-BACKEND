import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from 'src/common/entities/roles.entity';
import { UsuarioRol } from 'src/common/entities/usuarios_roles.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { QueryRolDto } from './dto/query-rol.dto';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepo: Repository<UsuarioRol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  /**
   * Crea un nuevo rol
   */
  async create(createDto: CreateRolDto): Promise<Rol> {
    // Validar que el nombre del rol no exista
    const rolExistente = await this.rolRepo.findOne({
      where: { nombre_rol: createDto.nombre_rol },
    });

    if (rolExistente) {
      throw new BadRequestException(
        `Ya existe un rol con el nombre ${createDto.nombre_rol}`,
      );
    }

    const nuevoRol = this.rolRepo.create({
      nombre_rol: createDto.nombre_rol,
      descripcion: createDto.descripcion,
      nivel_acceso: createDto.nivel_acceso || 1,
    });

    return await this.rolRepo.save(nuevoRol);
  }

  /**
   * Lista todos los roles con opciones de búsqueda, filtrado y paginación
   */
  async findAll(
    query?: QueryRolDto,
  ): Promise<Rol[] | { data: Rol[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.rolRepo.createQueryBuilder('rol');

    // Búsqueda por nombre o descripción
    if (query?.search) {
      queryBuilder.where(
        '(rol.nombre_rol ILIKE :search OR rol.descripcion ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filtro por nivel de acceso
    if (query?.nivel_acceso) {
      const whereClause = query?.search ? 'andWhere' : 'where';
      queryBuilder[whereClause]('rol.nivel_acceso = :nivel_acceso', {
        nivel_acceso: query.nivel_acceso,
      });
    }

    // Ordenamiento
    const orderBy = query?.orderBy || 'nivel_acceso';
    const orderDirection = query?.orderDirection || 'ASC';
    queryBuilder.orderBy(`rol.${orderBy}`, orderDirection);

    // Si no hay ordenamiento personalizado, agregar ordenamiento secundario
    if (!query?.orderBy) {
      queryBuilder.addOrderBy('rol.nombre_rol', 'ASC');
    }

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

  /**
   * Obtiene un rol por ID
   */
  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepo.findOne({
      where: { id_rol: id },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  /**
   * Obtiene un rol por nombre
   */
  async findByNombre(nombre: string): Promise<Rol> {
    const rol = await this.rolRepo.findOne({
      where: { nombre_rol: nombre },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con nombre ${nombre} no encontrado`);
    }

    return rol;
  }

  /**
   * Actualiza un rol
   */
  async update(id: number, updateDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    // Validar que el nuevo nombre no exista (si se actualiza)
    if (updateDto.nombre_rol && updateDto.nombre_rol !== rol.nombre_rol) {
      const rolExistente = await this.rolRepo.findOne({
        where: { nombre_rol: updateDto.nombre_rol },
      });

      if (rolExistente) {
        throw new BadRequestException(
          `Ya existe un rol con el nombre ${updateDto.nombre_rol}`,
        );
      }

      rol.nombre_rol = updateDto.nombre_rol;
    }

    // Actualizar otros campos
    if (updateDto.descripcion !== undefined) {
      rol.descripcion = updateDto.descripcion;
    }

    if (updateDto.nivel_acceso !== undefined) {
      rol.nivel_acceso = updateDto.nivel_acceso;
    }

    return await this.rolRepo.save(rol);
  }

  /**
   * Elimina un rol
   */
  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);

    // Validar que el rol no esté asignado a ningún usuario
    const usuariosConRol = await this.usuarioRolRepo.count({
      where: { rol: { id_rol: id } },
    });

    if (usuariosConRol > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol. Está asignado a ${usuariosConRol} usuario(s)`,
      );
    }

    await this.rolRepo.remove(rol);
  }
}

