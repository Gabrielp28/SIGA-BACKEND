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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocenteService } from './docente.service';
import { EvidenciasDocenteService } from './evidencias-docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { QueryDocenteDto } from './dto/query-docente.dto';
import { CreateFormacionAcademicaDto } from './dto/create-formacion-academica.dto';
import { UpdateFormacionAcademicaDto } from './dto/update-formacion-academica.dto';
import { CreateExperienciaLaboralDto } from './dto/create-experiencia-laboral.dto';
import { UpdateExperienciaLaboralDto } from './dto/update-experiencia-laboral.dto';
import { CreateEvidenciaDocenteDto } from './dto/create-evidencia-docente.dto';
import { UpdateEvidenciaDocenteDto } from './dto/update-evidencia-docente.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DocenteResponseDto } from './dto/docente-response.dto';

@ApiTags('Docentes')
@Controller('docentes')
@ApiBearerAuth()
export class DocenteController {
  constructor(
    private readonly docenteService: DocenteService,
    private readonly evidenciasDocenteService: EvidenciasDocenteService,
  ) {}

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

  // ========== ENDPOINTS PARA FOTO DE PERFIL ==========

  @Post(':id/foto-perfil')
  @UseInterceptors(FileInterceptor('foto'))
  @ApiOperation({ summary: 'Subir foto de perfil del docente' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del docente', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de perfil (jpg, png, gif, webp, máx 10MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Docente no encontrado' })
  async uploadFotoPerfil(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(image\/(jpeg|jpg|png|gif|webp))/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const docente = await this.docenteService.uploadFotoPerfil(id, file);
    return DocenteResponseDto.fromEntity(docente);
  }

  @Delete(':id/foto-perfil')
  @ApiOperation({ summary: 'Eliminar foto de perfil del docente' })
  @ApiParam({ name: 'id', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Foto de perfil eliminada exitosamente' })
  async removeFotoPerfil(@Param('id', ParseIntPipe) id: number) {
    const docente = await this.docenteService.removeFotoPerfil(id);
    return DocenteResponseDto.fromEntity(docente);
  }

  // ========== ENDPOINTS PARA EVIDENCIAS DOCENTES ==========

  @Post(':id/evidencias')
  @UseInterceptors(FileInterceptor('archivo'))
  @ApiOperation({ summary: 'Crear una nueva evidencia docente' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del docente', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tipo_evidencia', 'nombre_evidencia'],
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF o Word (opcional si se proporciona archivo_url)',
        },
        tipo_evidencia: {
          type: 'string',
          example: 'plan_clase',
        },
        nombre_evidencia: {
          type: 'string',
          example: 'Plan de Clase - Semana 1',
        },
        descripcion: {
          type: 'string',
        },
        archivo_url: {
          type: 'string',
          description: 'URL del archivo (si no se sube archivo)',
        },
        id_asignatura: {
          type: 'number',
        },
        periodo_academico: {
          type: 'string',
          example: '2024-1',
        },
        estado: {
          type: 'string',
          example: 'pendiente',
        },
        observaciones: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Evidencia creada exitosamente' })
  @ApiResponse({ status: 404, description: 'Docente o asignatura no encontrado' })
  async createEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDto: CreateEvidenciaDocenteDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))/,
          }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.evidenciasDocenteService.create(id, createDto, file);
  }

  @Get(':id/evidencias')
  @ApiOperation({ summary: 'Listar todas las evidencias de un docente' })
  @ApiParam({ name: 'id', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de evidencias' })
  getEvidenciasByDocente(@Param('id', ParseIntPipe) id: number) {
    return this.evidenciasDocenteService.findAll(id);
  }

  @Get('evidencias')
  @ApiOperation({ summary: 'Listar todas las evidencias' })
  @ApiResponse({ status: 200, description: 'Lista de evidencias' })
  getAllEvidencias() {
    return this.evidenciasDocenteService.findAll();
  }

  @Get('evidencias/:id')
  @ApiOperation({ summary: 'Obtener una evidencia por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la evidencia', example: 1 })
  @ApiResponse({ status: 200, description: 'Evidencia encontrada' })
  @ApiResponse({ status: 404, description: 'Evidencia no encontrada' })
  getEvidencia(@Param('id', ParseIntPipe) id: number) {
    return this.evidenciasDocenteService.findOne(id);
  }

  @Put('evidencias/:id')
  @UseInterceptors(FileInterceptor('archivo'))
  @ApiOperation({ summary: 'Actualizar una evidencia docente' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID de la evidencia', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'Nuevo archivo (opcional)',
        },
        tipo_evidencia: { type: 'string' },
        nombre_evidencia: { type: 'string' },
        descripcion: { type: 'string' },
        archivo_url: { type: 'string' },
        id_asignatura: { type: 'number' },
        periodo_academico: { type: 'string' },
        estado: { type: 'string' },
        observaciones: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Evidencia actualizada exitosamente' })
  async updateEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEvidenciaDocenteDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))/,
          }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.evidenciasDocenteService.update(id, updateDto, file);
  }

  @Delete('evidencias/:id')
  @ApiOperation({ summary: 'Eliminar una evidencia docente' })
  @ApiParam({ name: 'id', description: 'ID de la evidencia', example: 1 })
  @ApiResponse({ status: 200, description: 'Evidencia eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Evidencia no encontrada' })
  removeEvidencia(@Param('id', ParseIntPipe) id: number) {
    return this.evidenciasDocenteService.remove(id);
  }
}
