import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiResponse, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { QueryGrupoDto } from './dto/query-grupo.dto';
import { ResponseGrupoDto } from './dto/response-grupo.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Grupos')
@Controller('grupos')
@ApiBearerAuth()
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Crear un nuevo grupo' })
  @ApiCreatedResponse({
    type: ResponseGrupoDto,
    description: 'Grupo creado correctamente',
  })
  create(@Body() dto: CreateGrupoDto) {
    return this.grupoService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los grupos',
    description: 'Obtiene la lista de grupos con opciones de búsqueda, filtrado, ordenamiento y paginación',
  })
  @ApiResponse({
    type: [ResponseGrupoDto],
    description: 'Listado de grupos',
    status: 200,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de grupos',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ResponseGrupoDto' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  findAll(@Query() query: QueryGrupoDto) {
    return this.grupoService.findAll(query);
  }

  @Get('codigo/:codigo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener grupo por código' })
  @ApiParam({ name: 'codigo', description: 'Código del grupo', example: 'GRUPO-001' })
  @ApiResponse({
    type: ResponseGrupoDto,
    description: 'Grupo encontrado',
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.grupoService.findByCodigo(codigo);
  }

  @Get('asignatura/:id_asignatura')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener grupos por asignatura' })
  @ApiParam({ name: 'id_asignatura', description: 'ID de la asignatura', type: Number })
  @ApiResponse({
    type: [ResponseGrupoDto],
    description: 'Listado de grupos de la asignatura',
    status: 200,
  })
  findByAsignatura(@Param('id_asignatura') idAsignatura: string) {
    return this.grupoService.findByAsignatura(+idAsignatura);
  }

  @Get('carrera/:id_carrera')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener grupos por carrera' })
  @ApiParam({ name: 'id_carrera', description: 'ID de la carrera', type: Number })
  @ApiResponse({
    type: [ResponseGrupoDto],
    description: 'Listado de grupos de la carrera',
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  findByCarrera(@Param('id_carrera') idCarrera: string) {
    return this.grupoService.findByCarrera(+idCarrera);
  }

  @Get('docente/:id_docente')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener grupos por docente titular' })
  @ApiParam({ name: 'id_docente', description: 'ID del docente', type: Number })
  @ApiResponse({
    type: [ResponseGrupoDto],
    description: 'Listado de grupos del docente',
    status: 200,
  })
  findByDocente(@Param('id_docente') idDocente: string) {
    return this.grupoService.findByDocente(+idDocente);
  }

  @Get('periodo/:periodo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener grupos por periodo académico' })
  @ApiParam({ name: 'periodo', description: 'Periodo académico', example: '2024-1' })
  @ApiResponse({
    type: [ResponseGrupoDto],
    description: 'Listado de grupos del periodo',
    status: 200,
  })
  findByPeriodo(@Param('periodo') periodo: string) {
    return this.grupoService.findByPeriodo(periodo);
  }

  @Get('estado/:estado')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener grupos por estado' })
  @ApiParam({ name: 'estado', description: 'Estado del grupo', example: 'activo' })
  @ApiResponse({
    type: [ResponseGrupoDto],
    description: 'Listado de grupos filtrados por estado',
    status: 200,
  })
  findByEstado(@Param('estado') estado: string) {
    return this.grupoService.findByEstado(estado);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo', type: Number })
  @ApiResponse({
    type: ResponseGrupoDto,
    description: 'Grupo encontrado',
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.grupoService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo', type: Number })
  @ApiResponse({
    type: ResponseGrupoDto,
    description: 'Grupo actualizado correctamente',
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateGrupoDto) {
    return this.grupoService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo', type: Number })
  @ApiResponse({ status: 200, description: 'Grupo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  remove(@Param('id') id: string) {
    return this.grupoService.remove(+id);
  }

  @Delete('limpiar/todos')
  @Public()
  @ApiOperation({
    summary: 'Limpiar registros de tablas relacionadas',
    description: 'Elimina todos los registros de GrupoAsignaturaDocente, Grupos, Asignaturas y Carreras. Se eliminan en el orden correcto para respetar las foreign keys.',
  })
  @ApiResponse({
    status: 200,
    description: 'Registros eliminados correctamente',
    schema: {
      type: 'object',
      properties: {
        grupoAsignaturaDocente: { type: 'number', example: 10 },
        grupos: { type: 'number', example: 5 },
        asignaturas: { type: 'number', example: 20 },
        carreras: { type: 'number', example: 3 },
      },
    },
  })
  limpiarRegistros() {
    return this.grupoService.limpiarRegistros();
  }
}

