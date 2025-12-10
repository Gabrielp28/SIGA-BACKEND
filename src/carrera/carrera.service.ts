import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrera } from 'src/common/entities/carreras.entity';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { Departamento } from 'src/common/entities/departamentos.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';
import { UsuarioRol } from 'src/common/entities/usuarios_roles.entity';

@Injectable()
export class CarreraService {
  constructor(
    @InjectRepository(Carrera)
    private readonly carreraRepository: Repository<Carrera>,

    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,
  ) {}


  //Crear una nueva carrera

  async create(createCarreraDto: CreateCarreraDto) {
    const { codigo_carrera, id_departamento, id_coordinador } = createCarreraDto;

    // Validar código único

    const existe = await this.carreraRepository.findOne({
      where: { codigo_carrera },
    });
    if (existe) {
      throw new BadRequestException(
        `El código de carrera '${codigo_carrera}' ya está registrado`,
      );
    }

    // Validar departamento

    const departamento = await this.departamentoRepository.findOne({
      where: { id_departamento },
    });
    if (!departamento) {
      throw new NotFoundException(
        `Departamento con ID ${id_departamento} no encontrado`,
      );
    }

    // Validar y obtener coordinador si se proporciona
    let coordinador: Usuario | null = null;
    if (id_coordinador) {
      coordinador = await this.usuarioRepository.findOne({
        where: { id_usuario: id_coordinador },
        relations: ['usuarioRoles', 'usuarioRoles.rol'],
      });

      if (!coordinador) {
        throw new NotFoundException(
          `Usuario con ID ${id_coordinador} no encontrado`,
        );
      }

      // Validar que el usuario tenga el rol de Coordinador de carrera (id_rol: 2)
      const tieneRolCoordinador = coordinador.usuarioRoles?.some(
        (ur) => ur.rol?.id_rol === 2 && ur.estado === 'activo',
      );

      if (!tieneRolCoordinador) {
        throw new BadRequestException(
          `El usuario con ID ${id_coordinador} no tiene el rol de Coordinador de carrera activo`,
        );
      }
    }

    // Crear nueva carrera

    const carrera = this.carreraRepository.create({
      ...createCarreraDto,
      departamento,
      coordinador,
    });

    const nuevaCarrera = await this.carreraRepository.save(carrera);
    return {
      message: 'Carrera creada exitosamente',
      data: nuevaCarrera,
    };
  }


  //Obtener todas las carreras con su departamento y coordinador

  async findAll() {
    const carreras = await this.carreraRepository.find({
      relations: ['departamento', 'coordinador'],
      order: { id_carrera: 'ASC' },
    });
    return {
      message: 'Listado de carreras',
      data: carreras,
    };
  }

  //Buscar una carrera por ID

  async findOne(id: number) {
    const carrera = await this.carreraRepository.findOne({
      where: { id_carrera: id },
      relations: ['departamento', 'coordinador', 'asignaturas'],
    });

    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    return {
      message: 'Carrera encontrada',
      data: carrera,
    };
  }

  //Actualizar carrera

  async update(id: number, updateCarreraDto: UpdateCarreraDto) {
    const carrera = await this.carreraRepository.findOne({
      where: { id_carrera: id },
      relations: ['departamento', 'coordinador'],
    });

    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    // Validar código único si se cambia

    if (updateCarreraDto.codigo_carrera) {
      const duplicado = await this.carreraRepository.findOne({
        where: { codigo_carrera: updateCarreraDto.codigo_carrera },
      });
      if (duplicado && duplicado.id_carrera !== id) {
        throw new BadRequestException(
          `El código '${updateCarreraDto.codigo_carrera}' ya está en uso`,
        );
      }
    }

    // Validar nuevo departamento si se actualiza

    let departamento: Departamento | null = carrera.departamento;
    if (updateCarreraDto.id_departamento) {
      const nuevoDepartamento = await this.departamentoRepository.findOne({
        where: { id_departamento: updateCarreraDto.id_departamento },
      });
      if (!nuevoDepartamento) {
        throw new NotFoundException(
          `Departamento con ID ${updateCarreraDto.id_departamento} no encontrado`,
        );
      }
      departamento = nuevoDepartamento;
    }

    // Validar y actualizar coordinador si se proporciona
    let coordinador: Usuario | null = carrera.coordinador;
    if (updateCarreraDto.id_coordinador !== undefined) {
      if (updateCarreraDto.id_coordinador === null) {
        coordinador = null;
      } else {
        coordinador = await this.usuarioRepository.findOne({
          where: { id_usuario: updateCarreraDto.id_coordinador },
          relations: ['usuarioRoles', 'usuarioRoles.rol'],
        });

        if (!coordinador) {
          throw new NotFoundException(
            `Usuario con ID ${updateCarreraDto.id_coordinador} no encontrado`,
          );
        }

        // Validar que el usuario tenga el rol de Coordinador de carrera (id_rol: 2)
        const tieneRolCoordinador = coordinador.usuarioRoles?.some(
          (ur) => ur.rol?.id_rol === 2 && ur.estado === 'activo',
        );

        if (!tieneRolCoordinador) {
          throw new BadRequestException(
            `El usuario con ID ${updateCarreraDto.id_coordinador} no tiene el rol de Coordinador de carrera activo`,
          );
        }
      }
    }

    const carreraActualizada = await this.carreraRepository.save({
      ...carrera,
      ...updateCarreraDto,
      departamento,
      coordinador,
    });

    return {
      message: 'Carrera actualizada correctamente',
      data: carreraActualizada,
    };
  }


  //Eliminar carrera
  
  async remove(id: number) {
    const carrera = await this.carreraRepository.findOne({
      where: { id_carrera: id },
    });

    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    await this.carreraRepository.remove(carrera);
    return {
      message: 'Carrera eliminada correctamente',
      data: carrera,
    };
  }
}
