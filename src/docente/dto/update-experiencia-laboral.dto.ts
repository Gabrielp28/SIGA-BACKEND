import { PartialType } from '@nestjs/swagger';
import { CreateExperienciaLaboralDto } from './create-experiencia-laboral.dto';

export class UpdateExperienciaLaboralDto extends PartialType(CreateExperienciaLaboralDto) {}

