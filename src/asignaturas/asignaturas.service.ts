import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { Carrera } from 'src/common/entities/carreras.entity';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { AsignaturaResponseDto } from './dto/asignatura-response.dto';

@Injectable()
export class AsignaturasService {
  constructor(
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,

    @InjectRepository(Carrera)
    private readonly carreraRepository: Repository<Carrera>,
  ) {}

  // ✅ Crear una nueva asignatura
  async create(dto: CreateAsignaturaDto): Promise<AsignaturaResponseDto> {
    const carrera = await this.carreraRepository.findOne({ where: { id_carrera: dto.id_carrera } });

    if (!carrera) {
      throw new NotFoundException(`La carrera con ID ${dto.id_carrera} no existe`);
    }

    // Verificar que el código no esté duplicado
    const existing = await this.asignaturaRepository.findOne({ where: { codigo_asignatura: dto.codigo_asignatura } });
    if (existing) {
      throw new BadRequestException(`El código ${dto.codigo_asignatura} ya está en uso`);
    }

    const asignatura = this.asignaturaRepository.create({
    ...dto,
    carrera,
  });

  const saved = await this.asignaturaRepository.save(asignatura);
  return new AsignaturaResponseDto(saved);
}

  // ✅ Obtener todas las asignaturas
  async findAll(): Promise<AsignaturaResponseDto[]> {
    const asignaturas = await this.asignaturaRepository.find({
      relations: ['carrera'],
      order: { id_asignatura: 'ASC' },
    });
    return asignaturas.map(a => new AsignaturaResponseDto(a));
  }

  // ✅ Obtener una asignatura por ID
  async findOne(id: number): Promise<AsignaturaResponseDto> {
    const asignatura = await this.asignaturaRepository.findOne({
      where: { id_asignatura: id },
      relations: ['carrera'],
    });

    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${id} no encontrada`);
    }

    return new AsignaturaResponseDto(asignatura);
  }

  // ✅ Actualizar una asignatura
  async update(id: number, dto: Partial<CreateAsignaturaDto>): Promise<AsignaturaResponseDto> {
    const asignatura = await this.asignaturaRepository.findOne({
      where: { id_asignatura: id },
      relations: ['carrera'],
    });

    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${id} no encontrada`);
    }

    if (dto.id_carrera) {
      const carrera = await this.carreraRepository.findOne({ where: { id_carrera: dto.id_carrera } });
      if (!carrera) {
        throw new NotFoundException(`La carrera con ID ${dto.id_carrera} no existe`);
      }
      asignatura.carrera = carrera;
    }

    Object.assign(asignatura, dto);

    const updated = await this.asignaturaRepository.save(asignatura);
    return new AsignaturaResponseDto(updated);
  }

  // ✅ Eliminar una asignatura
  async remove(id: number): Promise<{ message: string }> {
    const asignatura = await this.asignaturaRepository.findOne({ where: { id_asignatura: id } });
    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${id} no encontrada`);
    }

    await this.asignaturaRepository.remove(asignatura);
    return { message: `Asignatura con ID ${id} eliminada correctamente` };
  }
}
