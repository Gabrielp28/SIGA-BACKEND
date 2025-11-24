import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GrupoAsignaturaDocenteService } from './grupo-asignatura-docente.service';
import { CreateGrupoAsignaturaDocenteDto } from './dto/create-grupo-asignatura-docente.dto';
import { CreateBulkGrupoAsignaturaDocenteDto } from './dto/create-bulk-grupo-asignatura-docente.dto';
import { UpdateGrupoAsignaturaDocenteDto } from './dto/update-grupo-asignatura-docente.dto';
import { QueryGrupoAsignaturaDocenteDto } from './dto/query-grupo-asignatura-docente.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Grupo-Asignatura-Docente')
@Controller('grupo-asignatura-docente')
@ApiBearerAuth()
export class GrupoAsignaturaDocenteController {
  constructor(
    private readonly grupoAsigDocService: GrupoAsignaturaDocenteService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Asignar una asignatura con docente a un grupo',
    description:
      'Crea una nueva relación entre grupo, asignatura y docente. Valida que no exista duplicado y respeta los límites de asignaturas del grupo.',
  })
  @ApiCreatedResponse({
    description: 'Asignación creada correctamente',
  })
  create(@Body() dto: CreateGrupoAsignaturaDocenteDto) {
    return this.grupoAsigDocService.create(dto);
  }

  @Post('bulk')
  @Public()
  @ApiOperation({
    summary: 'Asignar múltiples asignaturas con docentes a un grupo',
    description:
      'Crea múltiples relaciones entre grupo, asignaturas y docentes en una sola operación. Permite enviar un array de asignaturas con sus respectivos docentes. Retorna un resumen con las creadas exitosamente y los errores si los hay.',
  })
  @ApiCreatedResponse({
    description: 'Asignaciones creadas (puede incluir errores parciales)',
    schema: {
      type: 'object',
      properties: {
        creadas: {
          type: 'array',
          description: 'Asignaciones creadas exitosamente',
        },
        errores: {
          type: 'array',
          description: 'Asignaciones que fallaron con sus errores',
          items: {
            type: 'object',
            properties: {
              asignatura: { type: 'number' },
              docente: { type: 'number' },
              error: { type: 'string' },
            },
          },
        },
        total: { type: 'number', description: 'Total de asignaciones enviadas' },
        exitosas: { type: 'number', description: 'Cantidad de asignaciones creadas exitosamente' },
        fallidas: { type: 'number', description: 'Cantidad de asignaciones que fallaron' },
      },
    },
  })
  createBulk(@Body() dto: CreateBulkGrupoAsignaturaDocenteDto) {
    return this.grupoAsigDocService.createBulk(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todas las asignaciones',
    description:
      'Obtiene la lista de asignaciones grupo-asignatura-docente con opciones de filtrado y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaciones',
  })
  findAll(@Query() query: QueryGrupoAsignaturaDocenteDto) {
    return this.grupoAsigDocService.findAll(query);
  }

  @Get('grupo/:id_grupo')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener asignaciones por grupo',
    description: 'Obtiene todas las asignaturas y docentes asignados a un grupo específico',
  })
  @ApiParam({ name: 'id_grupo', description: 'ID del grupo', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaciones del grupo',
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findByGrupo(@Param('id_grupo') idGrupo: string) {
    return this.grupoAsigDocService.findByGrupo(+idGrupo);
  }

  @Get('asignatura/:id_asignatura')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener asignaciones por asignatura',
    description: 'Obtiene todos los grupos y docentes asignados a una asignatura específica',
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaciones de la asignatura',
  })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  findByAsignatura(@Param('id_asignatura') idAsignatura: string) {
    return this.grupoAsigDocService.findByAsignatura(+idAsignatura);
  }

  @Get('docente/:id_docente')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener asignaciones por docente',
    description:
      'Obtiene todos los grupos y asignaturas asignados a un docente específico',
  })
  @ApiParam({ name: 'id_docente', description: 'ID del docente', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaciones del docente',
  })
  @ApiResponse({ status: 404, description: 'Docente no encontrado' })
  findByDocente(@Param('id_docente') idDocente: string) {
    return this.grupoAsigDocService.findByDocente(+idDocente);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación encontrada',
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.grupoAsigDocService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar asignación',
    description:
      'Permite actualizar el docente, estado u observaciones de una asignación',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGrupoAsignaturaDocenteDto,
  ) {
    return this.grupoAsigDocService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar asignación',
    description:
      'Elimina una asignación. Valida que no se viole el mínimo de asignaturas del grupo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación eliminada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar: violaría el mínimo de asignaturas',
  })
  remove(@Param('id') id: string) {
    return this.grupoAsigDocService.remove(+id);
  }
}

