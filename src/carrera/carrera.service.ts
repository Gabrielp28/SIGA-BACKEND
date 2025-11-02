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

@Injectable()
export class CarreraService {
  constructor(
    @InjectRepository(Carrera)
    private readonly carreraRepository: Repository<Carrera>,

    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}


  //Crear una nueva carrera

  async create(createCarreraDto: CreateCarreraDto) {
    const { codigo_carrera, id_departamento } = createCarreraDto;

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

    // Crear nueva carrera

    const carrera = this.carreraRepository.create({
      ...createCarreraDto,
      departamento,
    });

    const nuevaCarrera = await this.carreraRepository.save(carrera);
    return {
      message: 'Carrera creada exitosamente',
      data: nuevaCarrera,
    };
  }


  //Obtener todas las carreras con su departamento

  async findAll() {
    const carreras = await this.carreraRepository.find({
      relations: ['departamento'],
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
      relations: ['departamento', 'asignaturas'],
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
      relations: ['departamento'],
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

    const carreraActualizada = await this.carreraRepository.save({
      ...carrera,
      ...updateCarreraDto,
      departamento,
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
