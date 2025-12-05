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
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryPlanDto } from './dto/query-plan.dto';
import { CreatePlanCarreraDto } from './dto/create-plan-carrera.dto';
import { CreatePlanCarreraAsignaturaDto } from './dto/create-plan-carrera-asignatura.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Planes')
@Controller('planes')
@ApiBearerAuth()
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Crear un nuevo plan',
    description: 'Crea un nuevo plan de estudios. El código del plan debe ser único.',
  })
  @ApiCreatedResponse({
    description: 'Plan creado correctamente',
  })
  create(@Body() createDto: CreatePlanDto) {
    return this.planService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los planes',
    description:
      'Obtiene la lista de planes con opciones de búsqueda, filtrado y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de planes',
  })
  findAll(@Query() query?: QueryPlanDto) {
    return this.planService.findAll(query);
  }

  @Get('carreras/:idCarrera/asignaturas')
  @Public()
  @ApiOperation({
    summary: 'Obtener asignaturas de una carrera',
    description: 'Obtiene todas las asignaturas asociadas a una carrera específica',
  })
  @ApiParam({ name: 'idCarrera', description: 'ID de la carrera', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaturas de la carrera',
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  obtenerAsignaturasPorCarrera(@Param('idCarrera') idCarrera: string) {
    return this.planService.obtenerAsignaturasPorCarrera(+idCarrera);
  }

  @Get(':id/details')
  @Public()
  @ApiOperation({
    summary: 'Obtener plan completo con detalles',
    description:
      'Obtiene un plan con todas sus carreras y asignaturas en una sola petición. Optimizado para evitar múltiples llamadas HTTP.',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Plan con todas sus relaciones',
    schema: {
      type: 'object',
      properties: {
        id_plan: { type: 'number' },
        nombre_plan: { type: 'string' },
        codigo_plan: { type: 'string' },
        año: { type: 'number' },
        fecha_inicio: { type: 'string', format: 'date' },
        fecha_fin: { type: 'string', format: 'date' },
        descripcion: { type: 'string' },
        estado: { type: 'string' },
        carreras: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id_plan_carrera: { type: 'number' },
              id_plan: { type: 'number' },
              id_carrera: { type: 'number' },
              carrera: {
                type: 'object',
                properties: {
                  id_carrera: { type: 'number' },
                  nombre_carrera: { type: 'string' },
                  codigo_carrera: { type: 'string' },
                  id_departamento: { type: 'number' },
                },
              },
              asignaturas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id_plan_carrera_asignatura: { type: 'number' },
                    id_plan_carrera: { type: 'number' },
                    id_asignatura: { type: 'number' },
                    asignatura: {
                      type: 'object',
                      properties: {
                        id_asignatura: { type: 'number' },
                        nombre_asignatura: { type: 'string' },
                        codigo_asignatura: { type: 'string' },
                        id_carrera: { type: 'number' },
                        creditos: { type: 'number' },
                        horas_semanales: { type: 'number' },
                        semestre: { type: 'number' },
                        tipo: { type: 'string' },
                        estado: { type: 'string' },
                        prerequisitos: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  obtenerPlanConDetalles(@Param('id') id: string) {
    return this.planService.obtenerPlanConDetalles(+id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener plan por ID',
    description: 'Obtiene un plan específico con todas sus carreras y asignaturas',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Plan encontrado',
  })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  findOne(@Param('id') id: string) {
    return this.planService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar plan',
    description: 'Actualiza los datos de un plan existente',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Plan actualizado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePlanDto) {
    return this.planService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar plan',
    description: 'Elimina un plan. No se puede eliminar si está siendo usado por grupos.',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Plan eliminado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar: el plan está siendo usado por grupos',
  })
  remove(@Param('id') id: string) {
    return this.planService.remove(+id);
  }

  // ========== ENDPOINTS PARA CARRERAS ==========

  @Post(':id/carreras')
  @Public()
  @ApiOperation({
    summary: 'Agregar carreras a un plan',
    description: 'Agrega múltiples carreras a un plan en una sola operación',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiCreatedResponse({
    description: 'Carreras agregadas (puede incluir errores parciales)',
  })
  agregarCarreras(@Param('id') id: string, @Body() createDto: CreatePlanCarreraDto) {
    return this.planService.agregarCarreras(+id, createDto);
  }

  @Get(':id/carreras')
  @ApiOperation({
    summary: 'Obtener carreras de un plan',
    description: 'Obtiene todas las carreras asociadas a un plan',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado de carreras del plan',
  })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  obtenerCarreras(@Param('id') id: string) {
    return this.planService.obtenerCarreras(+id);
  }

  @Delete(':id/carreras/:idPlanCarrera')
  @ApiOperation({
    summary: 'Remover carrera de un plan',
    description: 'Elimina una carrera del plan. También eliminará todas sus asignaturas asociadas.',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiParam({
    name: 'idPlanCarrera',
    description: 'ID de la relación plan-carrera',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Carrera removida correctamente',
  })
  @ApiResponse({ status: 404, description: 'Plan o relación no encontrada' })
  removerCarrera(@Param('id') id: string, @Param('idPlanCarrera') idPlanCarrera: string) {
    return this.planService.removerCarrera(+id, +idPlanCarrera);
  }

  // ========== ENDPOINTS PARA ASIGNATURAS ==========

  @Get(':id/carreras/:idPlanCarrera/asignaturas')
  @Public()
  @ApiOperation({
    summary: 'Obtener asignaturas de una carrera en un plan',
    description: 'Obtiene todas las asignaturas asociadas a una carrera específica en un plan',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiParam({
    name: 'idPlanCarrera',
    description: 'ID de la relación plan-carrera',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaturas del plan-carrera',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id_plan_carrera_asignatura: { type: 'number' },
          id_plan_carrera: { type: 'number' },
          id_asignatura: { type: 'number' },
          asignatura: {
            type: 'object',
            properties: {
              id_asignatura: { type: 'number' },
              nombre_asignatura: { type: 'string' },
              codigo_asignatura: { type: 'string' },
              id_carrera: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Plan o plan-carrera no encontrado' })
  obtenerAsignaturas(
    @Param('id') id: string,
    @Param('idPlanCarrera') idPlanCarrera: string,
  ) {
    return this.planService.obtenerAsignaturas(+id, +idPlanCarrera);
  }

  @Post(':id/carreras/:idPlanCarrera/asignaturas')
  @Public()
  @ApiOperation({
    summary: 'Agregar una o múltiples asignaturas a una carrera en un plan',
    description:
      'Agrega asignaturas a un plan-carrera. Puede agregar una (id_asignatura) o múltiples (id_asignaturas). Las asignaturas deben pertenecer a la carrera del plan-carrera.',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiParam({
    name: 'idPlanCarrera',
    description: 'ID de la relación plan-carrera',
    type: Number,
  })
  @ApiCreatedResponse({
    description: 'Asignatura(s) agregada(s) correctamente',
  })
  @ApiResponse({ status: 404, description: 'Plan, plan-carrera o asignatura no encontrada' })
  @ApiResponse({ status: 400, description: 'Asignatura ya existe o no pertenece a la carrera' })
  agregarAsignaturas(
    @Param('id') id: string,
    @Param('idPlanCarrera') idPlanCarrera: string,
    @Body() createDto: CreatePlanCarreraAsignaturaDto,
  ) {
    return this.planService.agregarAsignaturas(+id, +idPlanCarrera, createDto);
  }

  @Get(':id/carrera/:idCarrera/asignaturas')
  @ApiOperation({
    summary: 'Obtener asignaturas de un plan por carrera',
    description:
      'Obtiene todas las asignaturas de un plan para una carrera específica. Útil para cuando se crea un grupo.',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiParam({ name: 'idCarrera', description: 'ID de la carrera', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaturas del plan para la carrera',
  })
  @ApiResponse({ status: 404, description: 'Plan o carrera no encontrada' })
  obtenerAsignaturasPorPlanYCarrera(
    @Param('id') id: string,
    @Param('idCarrera') idCarrera: string,
  ) {
    return this.planService.obtenerAsignaturasPorPlanYCarrera(+id, +idCarrera);
  }

  @Delete(':id/carreras/:idPlanCarrera/asignaturas/:idPlanCarreraAsignatura')
  @Public()
  @ApiOperation({
    summary: 'Eliminar una asignatura de una carrera en un plan',
    description: 'Elimina una asignatura específica de un plan-carrera',
  })
  @ApiParam({ name: 'id', description: 'ID del plan', type: Number })
  @ApiParam({
    name: 'idPlanCarrera',
    description: 'ID de la relación plan-carrera',
    type: Number,
  })
  @ApiParam({
    name: 'idPlanCarreraAsignatura',
    description: 'ID de la relación plan-carrera-asignatura',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Asignatura eliminada correctamente',
  })
  @ApiResponse({ status: 204, description: 'Asignatura eliminada (No Content)' })
  @ApiResponse({ status: 404, description: 'Plan, plan-carrera o relación no encontrada' })
  async removerAsignatura(
    @Param('id') id: string,
    @Param('idPlanCarrera') idPlanCarrera: string,
    @Param('idPlanCarreraAsignatura') idPlanCarreraAsignatura: string,
  ) {
    await this.planService.removerAsignatura(+id, +idPlanCarrera, +idPlanCarreraAsignatura);
    return { message: 'Asignatura eliminada correctamente' };
  }
}

