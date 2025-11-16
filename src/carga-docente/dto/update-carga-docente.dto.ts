import { PartialType } from '@nestjs/swagger';
import { CreateCargaDocenteDto } from './create-carga-docente.dto';

export class UpdateCargaDocenteDto extends PartialType(CreateCargaDocenteDto) {}

