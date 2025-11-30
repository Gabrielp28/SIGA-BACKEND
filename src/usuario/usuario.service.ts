import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';
import { UsuarioResponseDto } from './dto/response-usuario.dto';
import { Usuario } from '../common/entities/usuarios.entity';
import { UsuarioRol } from '../common/entities/usuarios_roles.entity';
import { Rol } from '../common/entities/roles.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
    
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
      estado: createUsuarioDto.estado || 'activo',
    });

    return await this.usuarioRepository.save(usuario);
  }

  async findAll(includeRoles: boolean = false): Promise<Usuario[]> {
    if (includeRoles) {
      return await this.usuarioRepository.find({
        select: [
          'id_usuario',
          'username',
          'email',
          'estado',
          'fecha_creacion',
          'fecha_ultimo_acceso',
        ],
        relations: ['usuarioRoles', 'usuarioRoles.rol'],
      });
    }

    return await this.usuarioRepository.find({
      select: [
        'id_usuario',
        'username',
        'email',
        'estado',
        'fecha_creacion',
        'fecha_ultimo_acceso',
      ],
    });
  }

  async findOne(id: number, includeRoles: boolean = false): Promise<Usuario> {
    const options: any = {
      where: { id_usuario: id },
      select: [
        'id_usuario',
        'username',
        'email',
        'estado',
        'fecha_creacion',
        'fecha_ultimo_acceso',
      ],
    };

    if (includeRoles) {
      options.relations = ['usuarioRoles', 'usuarioRoles.rol'];
    }

    const usuario = await this.usuarioRepository.findOne(options);

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { email },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    Object.assign(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }

  async updateLastAccess(id: number): Promise<void> {
    await this.usuarioRepository.update(id, {
      fecha_ultimo_acceso: new Date(),
    });
  }

  /**
   * Transforma un usuario con roles a formato de respuesta limpio
   */
  private transformUsuarioWithRoles(usuario: Usuario): UsuarioResponseDto {
    return {
      id_usuario: usuario.id_usuario,
      username: usuario.username,
      email: usuario.email,
      estado: usuario.estado,
      fecha_creacion: usuario.fecha_creacion,
      fecha_ultimo_acceso: usuario.fecha_ultimo_acceso,
      roles: usuario.usuarioRoles?.map((ur) => ({
        id_usuario_rol: ur.id_usuario_rol,
        estado: ur.estado,
        rol: {
          id_rol: ur.rol.id_rol,
          nombre_rol: ur.rol.nombre_rol,
          descripcion: ur.rol.descripcion,
          nivel_acceso: ur.rol.nivel_acceso,
        },
      })) || [],
    };
  }

  /**
   * Obtiene todos los usuarios con sus roles
   */
  async findAllWithRoles(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.findAll(true);
    return usuarios.map((usuario) => this.transformUsuarioWithRoles(usuario));
  }

  /**
   * Obtiene un usuario con sus roles por ID
   */
  async findOneWithRoles(id: number): Promise<UsuarioResponseDto> {
    const usuario = await this.findOne(id, true);
    return this.transformUsuarioWithRoles(usuario);
  }

  /**
   * Asigna un rol a un usuario
   */
  async asignarRol(idUsuario: number, asignarRolDto: AsignarRolDto): Promise<UsuarioRol> {
    // Validar que el usuario existe
    const usuario = await this.findOne(idUsuario);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    // Validar que el rol existe
    const rol = await this.rolRepository.findOne({
      where: { id_rol: asignarRolDto.id_rol },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${asignarRolDto.id_rol} no encontrado`);
    }

    // Validar que el usuario no tenga ya este rol asignado
    const rolExistente = await this.usuarioRolRepository.findOne({
      where: {
        id_usuario: idUsuario,
        id_rol: asignarRolDto.id_rol,
      },
    });

    if (rolExistente) {
      throw new ConflictException(
        `El usuario ya tiene asignado el rol ${rol.nombre_rol}`,
      );
    }

    // Crear la asignación
    const usuarioRol = this.usuarioRolRepository.create({
      id_usuario: idUsuario,
      id_rol: asignarRolDto.id_rol,
      estado: asignarRolDto.estado || 'activo',
    });

    return await this.usuarioRolRepository.save(usuarioRol);
  }

  /**
   * Actualiza un rol asignado a un usuario
   */
  async actualizarRol(
    idUsuario: number,
    idUsuarioRol: number,
    actualizarRolDto: ActualizarRolDto,
  ): Promise<UsuarioRol> {
    // Validar que el usuario existe
    const usuario = await this.findOne(idUsuario);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    // Validar que la asignación existe y pertenece al usuario
    const usuarioRol = await this.usuarioRolRepository.findOne({
      where: {
        id_usuario_rol: idUsuarioRol,
        id_usuario: idUsuario,
      },
      relations: ['rol'],
    });

    if (!usuarioRol) {
      throw new NotFoundException(
        `No se encontró la asignación de rol con ID ${idUsuarioRol} para el usuario ${idUsuario}`,
      );
    }

    // Si se actualiza el rol, validar que existe
    if (actualizarRolDto.id_rol) {
      const nuevoRol = await this.rolRepository.findOne({
        where: { id_rol: actualizarRolDto.id_rol },
      });

      if (!nuevoRol) {
        throw new NotFoundException(`Rol con ID ${actualizarRolDto.id_rol} no encontrado`);
      }

      // Validar que el usuario no tenga ya este nuevo rol asignado
      const rolExistente = await this.usuarioRolRepository.findOne({
        where: {
          id_usuario: idUsuario,
          id_rol: actualizarRolDto.id_rol,
        },
      });

      if (rolExistente && rolExistente.id_usuario_rol !== idUsuarioRol) {
        throw new ConflictException(
          `El usuario ya tiene asignado el rol ${nuevoRol.nombre_rol}`,
        );
      }

      usuarioRol.id_rol = actualizarRolDto.id_rol;
    }

    // Actualizar estado si se proporciona
    if (actualizarRolDto.estado !== undefined) {
      usuarioRol.estado = actualizarRolDto.estado;
    }

    return await this.usuarioRolRepository.save(usuarioRol);
  }

  /**
   * Remueve un rol de un usuario
   */
  async removerRol(idUsuario: number, idUsuarioRol: number): Promise<void> {
    // Validar que el usuario existe
    const usuario = await this.findOne(idUsuario);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    // Validar que la asignación existe y pertenece al usuario
    const usuarioRol = await this.usuarioRolRepository.findOne({
      where: {
        id_usuario_rol: idUsuarioRol,
        id_usuario: idUsuario,
      },
    });

    if (!usuarioRol) {
      throw new NotFoundException(
        `No se encontró la asignación de rol con ID ${idUsuarioRol} para el usuario ${idUsuario}`,
      );
    }

    await this.usuarioRolRepository.remove(usuarioRol);
  }

  /**
   * Obtiene todos los roles de un usuario
   */
  async getRolesByUsuario(idUsuario: number) {
    // Validar que el usuario existe
    const usuario = await this.findOne(idUsuario);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const usuarioRoles = await this.usuarioRolRepository.find({
      where: { id_usuario: idUsuario },
      relations: ['rol'],
      order: { id_usuario_rol: 'ASC' },
    });

    // Transformar para eliminar datos repetidos
    return usuarioRoles.map((ur) => ({
      id_usuario_rol: ur.id_usuario_rol,
      estado: ur.estado,
      rol: {
        id_rol: ur.rol.id_rol,
        nombre_rol: ur.rol.nombre_rol,
        descripcion: ur.rol.descripcion,
        nivel_acceso: ur.rol.nivel_acceso,
      },
    }));
  }
}
