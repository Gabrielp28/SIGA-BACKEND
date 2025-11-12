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
import { CreateCargoDocenteDto } from './dto/create-cargo-docente.dto';
import { UpdateCargoDocenteDto } from './dto/update-cargo-docente.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Docentes')
@Controller('docentes')
@ApiBearerAuth()
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) { }

  // ========== ENDPOINTS PARA DOCENTES ==========

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo docente' })
  @ApiResponse({ status: 201, description: 'Docente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación, código o identificación duplicado' })
  @ApiResponse({ status: 404, description: 'Departamento, cargo o usuario no encontrado' })
  create(@Body() createDocenteDto: CreateDocenteDto) {
    return this.docenteService.create(createDocenteDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los docentes' })
  @ApiResponse({ status: 200, description: 'Listado de docentes obtenido correctamente' })
  findAll(@Query() query: QueryDocenteDto) {
    return this.docenteService.findAll(query);
  }

  @Get('codigo/:codigo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener docente por código' })
  @ApiParam({ name: 'codigo', description: 'Código del docente', example: 'DOC-001' })
  @ApiResponse({ status: 200, description: 'Docente encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Docente no encontrado' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.docenteService.findByCodigo(codigo);
  }

  @Get('estado/:estado')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener docentes por estado' })
  @ApiParam({ name: 'estado', description: 'Estado del docente', example: 'activo' })
  @ApiResponse({ status: 200, description: 'Listado de docentes filtrados por estado' })
  findByEstado(@Param('estado') estado: string) {
    return this.docenteService.findByEstado(estado);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un docente por su ID' })
  @ApiParam({ name: 'id', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Docente encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Docente no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un docente existente' })
  @ApiParam({ name: 'id', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Docente actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Código o identificación duplicado o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Docente, departamento, cargo o usuario no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocenteDto: UpdateDocenteDto,
  ) {
    return this.docenteService.update(id, updateDocenteDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un docente por su ID' })
  @ApiParam({ name: 'id', description: 'ID del docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Docente eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Docente no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.remove(id);
  }

  // ========== ENDPOINTS PARA CARGOS DOCENTES ==========

  @Post('cargos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo cargo docente' })
  @ApiResponse({ status: 201, description: 'Cargo docente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación o nombre duplicado' })
  createCargo(@Body() createCargoDto: CreateCargoDocenteDto) {
    return this.docenteService.createCargo(createCargoDto);
  }

  @Get('cargos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los cargos docentes' })
  @ApiResponse({ status: 200, description: 'Listado de cargos docentes obtenido correctamente' })
  findAllCargos() {
    return this.docenteService.findAllCargos();
  }

  @Get('cargos/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un cargo docente por su ID' })
  @ApiParam({ name: 'id', description: 'ID del cargo docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cargo docente encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cargo docente no encontrado' })
  findOneCargo(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.findOneCargo(id);
  }

  @Put('cargos/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un cargo docente existente' })
  @ApiParam({ name: 'id', description: 'ID del cargo docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cargo docente actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Nombre duplicado o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Cargo docente no encontrado' })
  updateCargo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCargoDto: UpdateCargoDocenteDto,
  ) {
    return this.docenteService.updateCargo(id, updateCargoDto);
  }

  @Delete('cargos/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un cargo docente por su ID' })
  @ApiParam({ name: 'id', description: 'ID del cargo docente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cargo docente eliminado correctamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar porque hay docentes asignados' })
  @ApiResponse({ status: 404, description: 'Cargo docente no encontrado' })
  removeCargo(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.removeCargo(id);
  }
}

