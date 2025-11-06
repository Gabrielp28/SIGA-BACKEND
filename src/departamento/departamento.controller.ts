import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiResponse, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DepartamentoService } from './departamento.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { QueryDepartamentoDto } from './dto/query-departamento.dto';
import { ResponseDepartamentoDto } from './dto/response-departamento.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Departamentos')
@Controller('departamentos')
@ApiBearerAuth()
export class DepartamentoController {
  constructor(private readonly deptoService: DepartamentoService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiCreatedResponse({
    type: ResponseDepartamentoDto,
    description: 'Departamento creado correctamente',
  })
  create(@Body() dto: CreateDepartamentoDto) {
    return this.deptoService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener todos los departamentos',
    description: 'Obtiene la lista de departamentos con opciones de búsqueda, filtrado, ordenamiento y paginación'
  })
  @ApiResponse({
    type: [ResponseDepartamentoDto],
    description: 'Listado de departamentos',
    status: 200,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de departamentos',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ResponseDepartamentoDto' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  findAll(@Query() query: QueryDepartamentoDto) {
    return this.deptoService.findAll(query);
  }

  @Get('codigo/:codigo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener departamento por código' })
  @ApiParam({ name: 'codigo', description: 'Código del departamento', example: 'INF01' })
  @ApiResponse({
    type: ResponseDepartamentoDto,
    description: 'Departamento encontrado',
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.deptoService.findByCodigo(codigo);
  }

  @Get('estado/:estado')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener departamentos por estado' })
  @ApiParam({ name: 'estado', description: 'Estado del departamento', example: 'activo' })
  @ApiResponse({
    type: [ResponseDepartamentoDto],
    description: 'Listado de departamentos filtrados por estado',
    status: 200,
  })
  findByEstado(@Param('estado') estado: string) {
    return this.deptoService.findByEstado(estado);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener departamento por ID' })
  @ApiParam({ name: 'id', description: 'ID del departamento', type: Number })
  @ApiResponse({
    type: ResponseDepartamentoDto,
    description: 'Departamento encontrado',
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  findOne(@Param('id') id: string) {
    return this.deptoService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar departamento' })
  @ApiParam({ name: 'id', description: 'ID del departamento', type: Number })
  @ApiResponse({
    type: ResponseDepartamentoDto,
    description: 'Departamento actualizado correctamente',
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  update(@Param('id') id: string, @Body() updateDto: UpdateDepartamentoDto) {
    return this.deptoService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar departamento' })
  @ApiParam({ name: 'id', description: 'ID del departamento', type: Number })
  @ApiResponse({ status: 200, description: 'Departamento eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  remove(@Param('id') id: string) {
    return this.deptoService.remove(+id);
  }
}