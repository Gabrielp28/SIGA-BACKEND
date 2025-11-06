import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Carreras')
@Controller('carreras')
@ApiBearerAuth()
export class CarreraController { 
  constructor(private readonly carreraService: CarreraService) {}


    //Crear una nueva carrera

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva carrera' })
  @ApiResponse({ status: 201, description: 'Carrera creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación o código duplicado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carreraService.create(createCarreraDto);
  }

  
    //Listar todas las carreras
  
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las carreras' })
  @ApiResponse({ status: 200, description: 'Listado de carreras obtenido correctamente' })
  findAll() {
    return this.carreraService.findAll();
  }

  
    //Buscar una carrera por ID

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una carrera por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la carrera', example: 1 })
  @ApiResponse({ status: 200, description: 'Carrera encontrada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.carreraService.findOne(id);
  }

  
   //Actualizar una carrera

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una carrera existente' })
  @ApiParam({ name: 'id', description: 'ID de la carrera', example: 1 })
  @ApiResponse({ status: 200, description: 'Carrera actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Código duplicado o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Carrera o departamento no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarreraDto: UpdateCarreraDto,
  ) {
    return this.carreraService.update(id, updateCarreraDto);
  }

  
   //Eliminar una carrera
  
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una carrera por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la carrera', example: 1 })
  @ApiResponse({ status: 200, description: 'Carrera eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.carreraService.remove(id);
  }
}
