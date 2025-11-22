import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvidenciaDocente } from 'src/common/entities/evidencias_docentes.entity';
import { Docente } from 'src/common/entities/docentes.entity';
import { Asignatura } from 'src/common/entities/asignaturas.entity';
import { StorageService } from 'src/storage/storage.service';
import { CreateEvidenciaDocenteDto } from './dto/create-evidencia-docente.dto';
import { UpdateEvidenciaDocenteDto } from './dto/update-evidencia-docente.dto';

@Injectable()
export class EvidenciasDocenteService {
  constructor(
    @InjectRepository(EvidenciaDocente)
    private readonly evidenciaRepo: Repository<EvidenciaDocente>,
    @InjectRepository(Docente)
    private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepo: Repository<Asignatura>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    idDocente: number,
    createDto: CreateEvidenciaDocenteDto,
    file?: Express.Multer.File,
  ): Promise<EvidenciaDocente> {
    // Validar que el docente existe
    const docente = await this.docenteRepo.findOne({
      where: { id_docente: idDocente },
    });
    if (!docente) {
      throw new NotFoundException(`Docente con ID ${idDocente} no encontrado`);
    }

    // Validar asignatura si se proporciona
    let asignatura: Asignatura | null = null;
    if (createDto.id_asignatura) {
      asignatura = await this.asignaturaRepo.findOne({
        where: { id_asignatura: createDto.id_asignatura },
      });
      if (!asignatura) {
        throw new NotFoundException(
          `Asignatura con ID ${createDto.id_asignatura} no encontrada`,
        );
      }
    }

    let archivoUrl: string | undefined = undefined;

    // Si se proporciona un archivo, subirlo a Supabase
    if (file) {
      const folder = `evidencias/docente-${idDocente}`;
      const uploadResult = await this.storageService.uploadFile(file, folder);
      archivoUrl = uploadResult.url;
    } else if (createDto.archivo_url) {
      // Si se proporciona una URL directamente
      archivoUrl = createDto.archivo_url;
    }

    const newEvidencia = this.evidenciaRepo.create({
      docente: docente as any,
      asignatura: asignatura as any,
      tipo_evidencia: createDto.tipo_evidencia,
      nombre_evidencia: createDto.nombre_evidencia,
      descripcion: createDto.descripcion,
      archivo_url: archivoUrl,
      periodo_academico: createDto.periodo_academico,
      estado: createDto.estado || 'pendiente',
      observaciones: createDto.observaciones,
    });

    const savedEvidencia = await this.evidenciaRepo.save(newEvidencia);
    return savedEvidencia;
  }

  async findAll(idDocente?: number): Promise<EvidenciaDocente[]> {
    const queryBuilder = this.evidenciaRepo
      .createQueryBuilder('evidencia')
      .leftJoinAndSelect('evidencia.docente', 'docente')
      .leftJoinAndSelect('evidencia.asignatura', 'asignatura');

    if (idDocente) {
      queryBuilder.where('evidencia.id_docente = :idDocente', { idDocente });
    }

    queryBuilder.orderBy('evidencia.id_evidencia', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<EvidenciaDocente> {
    const evidencia = await this.evidenciaRepo.findOne({
      where: { id_evidencia: id },
      relations: ['docente', 'asignatura'],
    });

    if (!evidencia) {
      throw new NotFoundException(`Evidencia con ID ${id} no encontrada`);
    }

    return evidencia;
  }

  async update(
    id: number,
    updateDto: UpdateEvidenciaDocenteDto,
    file?: Express.Multer.File,
  ): Promise<EvidenciaDocente> {
    const evidencia = await this.findOne(id);

    // Validar asignatura si se actualiza
    if (updateDto.id_asignatura !== undefined) {
      if (updateDto.id_asignatura) {
        const asignatura = await this.asignaturaRepo.findOne({
          where: { id_asignatura: updateDto.id_asignatura },
        });
        if (!asignatura) {
          throw new NotFoundException(
            `Asignatura con ID ${updateDto.id_asignatura} no encontrada`,
          );
        }
        evidencia.asignatura = asignatura;
      } else {
        evidencia.asignatura = null as any;
      }
    }

    // Si se proporciona un nuevo archivo, subirlo
    if (file) {
      // Eliminar archivo anterior si existe
      if (evidencia.archivo_url) {
        try {
          // Extraer el path del archivo de la URL de Supabase
          // Formato: https://...supabase.co/storage/v1/object/public/bucket/path/to/file
          const urlParts = evidencia.archivo_url.split('/');
          const publicIndex = urlParts.indexOf('public');
          if (publicIndex !== -1 && publicIndex < urlParts.length - 1) {
            const filePath = urlParts.slice(publicIndex + 1).join('/');
            await this.storageService.deleteFile(filePath);
          }
        } catch (error) {
          // Si falla la eliminación, continuar con la subida del nuevo archivo
          console.warn('No se pudo eliminar el archivo anterior:', error);
        }
      }

      const folder = `evidencias/docente-${evidencia.docente.id_docente}`;
      const uploadResult = await this.storageService.uploadFile(file, folder);
      evidencia.archivo_url = uploadResult.url;
    } else if (updateDto.archivo_url !== undefined) {
      evidencia.archivo_url = updateDto.archivo_url;
    }

    Object.assign(evidencia, {
      ...updateDto,
      id_asignatura: undefined,
      archivo_url: undefined,
    });

    return await this.evidenciaRepo.save(evidencia);
  }

  async remove(id: number): Promise<void> {
    const evidencia = await this.findOne(id);

    // Eliminar archivo de Supabase si existe
    if (evidencia.archivo_url) {
      try {
        // Extraer el path del archivo de la URL de Supabase
        const urlParts = evidencia.archivo_url.split('/');
        const publicIndex = urlParts.indexOf('public');
        if (publicIndex !== -1 && publicIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(publicIndex + 1).join('/');
          await this.storageService.deleteFile(filePath);
        }
      } catch (error) {
        console.warn('No se pudo eliminar el archivo:', error);
      }
    }

    await this.evidenciaRepo.remove(evidencia);
  }
}

