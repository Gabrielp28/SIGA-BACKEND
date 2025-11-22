import { PartialType } from '@nestjs/swagger';
import { CreateEvidenciaDocenteDto } from './create-evidencia-docente.dto';

export class UpdateEvidenciaDocenteDto extends PartialType(CreateEvidenciaDocenteDto) {}

