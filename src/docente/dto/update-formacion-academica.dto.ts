import { PartialType } from '@nestjs/swagger';
import { CreateFormacionAcademicaDto } from './create-formacion-academica.dto';

export class UpdateFormacionAcademicaDto extends PartialType(CreateFormacionAcademicaDto) {}

