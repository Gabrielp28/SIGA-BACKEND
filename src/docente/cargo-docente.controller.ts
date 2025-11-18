import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { DocenteService } from './docente.service';
import { CreateCargoDocenteDto } from './dto/create-cargo-docente.dto';
import { UpdateCargoDocenteDto } from './dto/update-cargo-docente.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CargoDocenteResponseDto } from './dto/cargo-docente-response.dto';

@ApiTags('Docentes - Cargos')
@ApiBearerAuth()
@Controller('cargos')
export class CargoDocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cargo docente' })
  async create(@Body() createCargoDto: CreateCargoDocenteDto) {
    const cargo = await this.docenteService.createCargo(createCargoDto);
    return CargoDocenteResponseDto.fromEntity(cargo);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los cargos docentes' })
  async findAll() {
    const cargos = await this.docenteService.findAllCargos();
    console.log("cargos:",cargos);
    return CargoDocenteResponseDto.fromEntities(cargos);

  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cargo docente por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cargo = await this.docenteService.findOneCargo(id);
    return CargoDocenteResponseDto.fromEntity(cargo);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un cargo docente existente' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCargoDto: UpdateCargoDocenteDto,
  ) {
    const cargo = await this.docenteService.updateCargo(id, updateCargoDto);
    return CargoDocenteResponseDto.fromEntity(cargo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cargo docente por su ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.removeCargo(id);
  }
}

