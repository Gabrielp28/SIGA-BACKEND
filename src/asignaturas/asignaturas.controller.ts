import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AsignaturasService } from './asignaturas.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { AsignaturaResponseDto } from './dto/asignatura-response.dto';
@ApiTags('Asignaturas') // 🔖 Agrupa las rutas en Swagger
@Controller('asignaturas')
export class AsignaturasController {
  constructor(private readonly asignaturasService: AsignaturasService) {}

  // ✅ Crear una nueva asignatura
  @Post()
  @ApiOperation({ summary: 'Crear una nueva asignatura' })
  @ApiBody({ type: CreateAsignaturaDto })
  @ApiResponse({
    status: 201,
    description: 'Asignatura creada exitosamente',
    type: AsignaturaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Código duplicado o datos inválidos' })
  async create(@Body() dto: CreateAsignaturaDto): Promise<AsignaturaResponseDto> {
    return this.asignaturasService.create(dto);
  }

  // ✅ Obtener todas las asignaturas
  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaturas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaturas obtenida correctamente',
    type: [AsignaturaResponseDto],
  })
  async findAll(): Promise<AsignaturaResponseDto[]> {
    return this.asignaturasService.findAll();
  }

  // ✅ Obtener una asignatura por ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignatura por su ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID de la asignatura' })
  @ApiResponse({
    status: 200,
    description: 'Asignatura encontrada',
    type: AsignaturaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AsignaturaResponseDto> {
    return this.asignaturasService.findOne(id);
  }

  // ✅ Actualizar una asignatura
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignatura existente' })
  @ApiParam({ name: 'id', example: 1, description: 'ID de la asignatura a actualizar' })
  @ApiBody({ type: CreateAsignaturaDto })
  @ApiResponse({
    status: 200,
    description: 'Asignatura actualizada correctamente',
    type: AsignaturaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateAsignaturaDto>,
  ): Promise<AsignaturaResponseDto> {
    return this.asignaturasService.update(id, dto);
  }

  // ✅ Eliminar una asignatura
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignatura por su ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID de la asignatura a eliminar' })
  @ApiResponse({ status: 200, description: 'Asignatura eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.asignaturasService.remove(id);
  }
}
