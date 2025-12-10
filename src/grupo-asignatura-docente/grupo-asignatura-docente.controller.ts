import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
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
import { CrearVersionInicialDto } from './dto/crear-version-inicial.dto';
import { EnviarRevisionDto } from './dto/enviar-revision.dto';
import { RevisarCargaDto } from './dto/revisar-carga.dto';
import { AprobarFinalDto } from './dto/aprobar-final.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolEnum } from 'src/common/enums/roles.enum';

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
    summary: 'Asignar múltiples asignaturas con docentes a un grupo desde un plan',
    description:
      'Crea múltiples relaciones entre grupo, asignaturas y docentes en una sola operación. **IMPORTANTE**: Debes proporcionar el `id_plan` que debe coincidir con el plan del grupo. Las asignaturas deben pertenecer a ese plan y a la carrera del grupo. Este endpoint es ideal cuando se trabaja desde el módulo de Planes: primero obtienes las asignaturas disponibles del plan usando `GET /planes/:id/carrera/:idCarrera/asignaturas`, luego seleccionas las asignaturas que quieres agregar con sus docentes y las envías aquí. El endpoint valida automáticamente que todas las asignaturas estén disponibles en el plan del grupo. Retorna un resumen con las creadas exitosamente y los errores si los hay.',
  })
  @ApiCreatedResponse({
    description: 'Asignaciones creadas (puede incluir errores parciales). Incluye información del grupo, plan y carrera para referencia.',
    schema: {
      type: 'object',
      properties: {
        grupo: {
          type: 'object',
          description: 'Información del grupo, plan y carrera',
          properties: {
            id_grupo: { type: 'number' },
            codigo_grupo: { type: 'string' },
            nombre_grupo: { type: 'string' },
            plan: {
              type: 'object',
              properties: {
                id_plan: { type: 'number' },
                nombre_plan: { type: 'string' },
                codigo_plan: { type: 'string' },
              },
            },
            carrera: {
              type: 'object',
              properties: {
                id_carrera: { type: 'number' },
                nombre_carrera: { type: 'string' },
                codigo_carrera: { type: 'string' },
              },
            },
          },
        },
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

  // ========== ENDPOINTS PARA FLUJO DE APROBACIÓN Y VERSIONAMIENTO ==========

  @Post('version-inicial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.COORDINADOR)
  @ApiOperation({
    summary: 'Crear versión inicial de carga docente',
    description: 'El coordinador de carrera crea una versión inicial de la carga docente',
  })
  @ApiCreatedResponse({
    description: 'Versión inicial creada correctamente',
  })
  crearVersionInicial(
    @Body() dto: CrearVersionInicialDto,
    @CurrentUser() user: any,
  ) {
    return this.grupoAsigDocService.crearVersionInicial(dto, user.id_usuario);
  }

  @Put(':id/enviar-revision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.COORDINADOR)
  @ApiOperation({
    summary: 'Enviar carga docente a revisión',
    description: 'El coordinador envía la carga docente al director de departamento para revisión',
  })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Carga enviada a revisión correctamente',
  })
  enviarRevision(
    @Param('id') id: string,
    @Body() dto: EnviarRevisionDto,
    @CurrentUser() user: any,
  ) {
    return this.grupoAsigDocService.enviarRevision(+id, dto, user.id_usuario);
  }

  @Put(':id/revisar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.DIRECTORES, RolEnum.JEFE_DEPARTAMENTO)
  @ApiOperation({
    summary: 'Revisar carga docente',
    description: 'El director de departamento o jefe de departamento revisa y aprueba/rechaza la carga docente',
  })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Carga revisada correctamente',
  })
  revisarCarga(
    @Param('id') id: string,
    @Body() dto: RevisarCargaDto,
    @CurrentUser() user: any,
  ) {
    return this.grupoAsigDocService.revisarCarga(+id, dto, user.id_usuario);
  }

  @Put(':id/aprobar-final')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.DIRECTORES)
  @ApiOperation({
    summary: 'Aprobar carga docente final',
    description: 'El administrador o director de departamento da la aprobación final a la carga docente',
  })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Carga aprobada final correctamente',
  })
  aprobarFinal(
    @Param('id') id: string,
    @Body() dto: AprobarFinalDto,
    @CurrentUser() user: any,
  ) {
    return this.grupoAsigDocService.aprobarFinal(+id, dto, user.id_usuario);
  }

  @Get(':id/versiones')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener historial de versiones',
    description: 'Obtiene todas las versiones de una carga docente',
  })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Historial de versiones',
  })
  obtenerVersiones(@Param('id') id: string) {
    return this.grupoAsigDocService.obtenerVersiones(+id);
  }

  @Get(':id/versiones/:v1/compare/:v2')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Comparar dos versiones',
    description: 'Compara dos versiones de una carga docente y muestra las diferencias',
  })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', type: Number })
  @ApiParam({ name: 'v1', description: 'Número de versión 1', type: Number })
  @ApiParam({ name: 'v2', description: 'Número de versión 2', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Comparación de versiones',
  })
  compararVersiones(
    @Param('id') id: string,
    @Param('v1') v1: string,
    @Param('v2') v2: string,
  ) {
    return this.grupoAsigDocService.compararVersiones(+id, +v1, +v2);
  }

  @Post(':id/restaurar-version/:versionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.COORDINADOR, RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Restaurar a una versión anterior',
    description: 'Restaura una carga docente a una versión anterior',
  })
  @ApiParam({ name: 'id', description: 'ID de la carga docente', type: Number })
  @ApiParam({ name: 'versionId', description: 'ID de la versión a restaurar', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Versión restaurada correctamente',
  })
  restaurarVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: any,
  ) {
    return this.grupoAsigDocService.restaurarVersion(+id, +versionId, user.id_usuario);
  }
}

