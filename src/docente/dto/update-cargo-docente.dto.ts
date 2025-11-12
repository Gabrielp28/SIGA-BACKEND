import { PartialType } from '@nestjs/swagger';
import { CreateCargoDocenteDto } from './create-cargo-docente.dto';

export class UpdateCargoDocenteDto extends PartialType(CreateCargoDocenteDto) {}

