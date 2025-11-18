import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { QueryDocenteDto } from './dto/query-docente.dto';
import { CreateFormacionAcademicaDto } from './dto/create-formacion-academica.dto';
import { UpdateFormacionAcademicaDto } from './dto/update-formacion-academica.dto';
import { CreateExperienciaLaboralDto } from './dto/create-experiencia-laboral.dto';
import { UpdateExperienciaLaboralDto } from './dto/update-experiencia-laboral.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocenteResponseDto } from './dto/docente-response.dto';

@ApiTags('Docentes')
@Controller('docentes')
@ApiBearerAuth()
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  // ========== ENDPOINTS PARA DOCENTES ==========

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo docente' })
  async create(@Body() createDocenteDto: CreateDocenteDto) {
    const docente = await this.docenteService.create(createDocenteDto);
    return DocenteResponseDto.fromEntity(docente);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los docentes' })
  async findAll(@Query() query: QueryDocenteDto) {
    const docentes = await this.docenteService.findAll(query);
    if (Array.isArray(docentes)) {
      return DocenteResponseDto.fromEntities(docentes);
    }

    return {
      ...docentes,
      data: DocenteResponseDto.fromEntities(docentes.data),
    };
  }

  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Obtener docente por código' })
  async findByCodigo(@Param('codigo') codigo: string) {
    const docente = await this.docenteService.findByCodigo(codigo);
    return DocenteResponseDto.fromEntity(docente);
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener docentes por estado' })
  async findByEstado(@Param('estado') estado: string) {
    const docentes = await this.docenteService.findByEstado(estado);
    return DocenteResponseDto.fromEntities(docentes);
  }

  // ========== ENDPOINTS PARA FORMACIÓN ACADÉMICA ==========

  @Post('formaciones')
  @ApiOperation({ summary: 'Crear una nueva formación académica' })
  createFormacion(@Body() createFormacionDto: CreateFormacionAcademicaDto) {
    return this.docenteService.createFormacion(createFormacionDto);
  }

  @Get('formaciones')
  @ApiOperation({ summary: 'Listar todas las formaciones académicas' })
  findAllFormaciones(@Query('idDocente') idDocente?: number) {
    const id = idDocente ? parseInt(idDocente.toString(), 10) : undefined;
    return this.docenteService.findAllFormaciones(id);
  }

  @Get('formaciones/:id')
  @ApiOperation({ summary: 'Obtener una formación académica por su ID' })
  findOneFormacion(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.findOneFormacion(id);
  }

  @Put('formaciones/:id')
  @ApiOperation({ summary: 'Actualizar una formación académica existente' })
  updateFormacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormacionDto: UpdateFormacionAcademicaDto,
  ) {
    return this.docenteService.updateFormacion(id, updateFormacionDto);
  }

  @Delete('formaciones/:id')
  @ApiOperation({ summary: 'Eliminar una formación académica por su ID' })
  removeFormacion(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.removeFormacion(id);
  }

  // ========== ENDPOINTS PARA EXPERIENCIA LABORAL ==========

  @Post('experiencias')
  @ApiOperation({ summary: 'Crear una nueva experiencia laboral' })
  createExperiencia(@Body() createExperienciaDto: CreateExperienciaLaboralDto) {
    return this.docenteService.createExperiencia(createExperienciaDto);
  }

  @Get('experiencias')
  @ApiOperation({ summary: 'Listar todas las experiencias laborales' })
  findAllExperiencias(@Query('idDocente') idDocente?: number) {
    const id = idDocente ? parseInt(idDocente.toString(), 10) : undefined;
    return this.docenteService.findAllExperiencias(id);
  }

  @Get('experiencias/:id')
  @ApiOperation({ summary: 'Obtener una experiencia laboral por su ID' })
  findOneExperiencia(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.findOneExperiencia(id);
  }

  @Put('experiencias/:id')
  @ApiOperation({ summary: 'Actualizar una experiencia laboral existente' })
  updateExperiencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExperienciaDto: UpdateExperienciaLaboralDto,
  ) {
    return this.docenteService.updateExperiencia(id, updateExperienciaDto);
  }

  @Delete('experiencias/:id')
  @ApiOperation({ summary: 'Eliminar una experiencia laboral por su ID' })
  removeExperiencia(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.removeExperiencia(id);
  }

  // ---------- RUTAS DINÁMICAS (AL FINAL) ----------
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un docente por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const docente = await this.docenteService.findOne(id);
    return DocenteResponseDto.fromEntity(docente);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un docente existente' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocenteDto: UpdateDocenteDto,
  ) {
    const docente = await this.docenteService.update(id, updateDocenteDto);
    return DocenteResponseDto.fromEntity(docente);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un docente por su ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.remove(id);
  }
}
