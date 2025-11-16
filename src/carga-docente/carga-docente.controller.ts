import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CargaDocenteService } from './carga-docente.service';
import { CreateCargaDocenteDto } from './dto/create-carga-docente.dto';
import { UpdateCargaDocenteDto } from './dto/update-carga-docente.dto';
import { QueryCargaDocenteDto } from './dto/query-carga-docente.dto';

@ApiTags('Carga Docente')
@Controller('carga-docente')
@ApiBearerAuth()
export class CargaDocenteController {
  constructor(private readonly cargaDocenteService: CargaDocenteService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asignar un docente a un grupo (crear carga docente)' })
  @ApiCreatedResponse({
    description: 'Carga docente creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error de validación o carga duplicada' })
  @ApiResponse({ status: 404, description: 'Docente o grupo no encontrado' })
  create(@Body() createCargaDto: CreateCargaDocenteDto) {
    return this.cargaDocenteService.create(createCargaDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las cargas docentes' })
  @ApiQuery({ name: 'idDocente', required: false, description: 'Filtrar por ID de docente', example: 1 })
  @ApiQuery({ name: 'idGrupo', required: false, description: 'Filtrar por ID de grupo', example: 1 })
  @ApiQuery({ name: 'tipo_vinculacion', required: false, description: 'Filtrar por tipo de vinculación', example: 'titular' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado', example: 'asignada' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados', example: 10 })
  @ApiResponse({ status: 200, description: 'Listado de cargas docentes obtenido correctamente' })
  findAll(@Query() query: QueryCargaDocenteDto) {
    return this.cargaDocenteService.findAll(query);
  }

  @Get('docente/:idDocente')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las cargas de un docente' })
  @ApiParam({ name: 'idDocente', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cargas del docente obtenidas correctamente' })
  @ApiResponse({ status: 404, description: 'Docente no encontrado' })
  getCargasByDocente(@Param('idDocente', ParseIntPipe) idDocente: number) {
    return this.cargaDocenteService.getCargasByDocente(idDocente);
  }

  @Get('grupo/:idGrupo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los docentes asignados a un grupo' })
  @ApiParam({ name: 'idGrupo', description: 'ID del grupo', example: 1 })
  @ApiResponse({ status: 200, description: 'Docentes del grupo obtenidos correctamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  getDocentesByGrupo(@Param('idGrupo', ParseIntPipe) idGrupo: number) {
    return this.cargaDocenteService.getDocentesByGrupo(idGrupo);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una carga docente por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Carga docente encontrada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carga docente no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cargaDocenteService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una carga docente existente' })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Carga docente actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Carga docente, docente o grupo no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCargaDto: UpdateCargaDocenteDto,
  ) {
    return this.cargaDocenteService.update(id, updateCargaDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una carga docente por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Carga docente eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Carga docente no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cargaDocenteService.remove(id);
  }

  @Get('docente/:idDocente/activas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las cargas activas de un docente' })
  @ApiParam({ name: 'idDocente', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cargas activas del docente obtenidas correctamente' })
  @ApiResponse({ status: 404, description: 'Docente no encontrado' })
  getCargasActivasByDocente(@Param('idDocente', ParseIntPipe) idDocente: number) {
    return this.cargaDocenteService.getCargasActivasByDocente(idDocente);
  }

  @Get('docente/:idDocente/count-activas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar las cargas activas de un docente' })
  @ApiParam({ name: 'idDocente', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cantidad de cargas activas' })
  countCargasActivasByDocente(@Param('idDocente', ParseIntPipe) idDocente: number) {
    return this.cargaDocenteService.countCargasActivasByDocente(idDocente);
  }

  @Get('verificar-asignacion/:idDocente/:idGrupo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar si un docente puede ser asignado a un grupo' })
  @ApiParam({ name: 'idDocente', description: 'ID del docente', example: 1 })
  @ApiParam({ name: 'idGrupo', description: 'ID del grupo', example: 1 })
  @ApiResponse({ status: 200, description: 'Resultado de la verificación' })
  canAssignDocenteToGrupo(
    @Param('idDocente', ParseIntPipe) idDocente: number,
    @Param('idGrupo', ParseIntPipe) idGrupo: number,
  ) {
    return this.cargaDocenteService.canAssignDocenteToGrupo(idDocente, idGrupo);
  }

  @Put('finalizar-periodo/:periodo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalizar todas las cargas activas de un periodo académico' })
  @ApiParam({ name: 'periodo', description: 'Periodo académico', example: '2024-1' })
  @ApiResponse({ status: 200, description: 'Cargas finalizadas correctamente' })
  finalizarCargasByPeriodo(@Param('periodo') periodo: string) {
    return this.cargaDocenteService.finalizarCargasByPeriodo(periodo);
  }
}

