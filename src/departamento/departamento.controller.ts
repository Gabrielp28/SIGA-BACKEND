import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { DepartamentoService } from './departamento.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { ResponseDepartamentoDto } from './dto/response-departamento.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Departamentos')
@Controller('departamentos')
export class DepartamentoController {
  constructor(private readonly deptoService: DepartamentoService) {}

  @Post()
  @Public()
  @ApiCreatedResponse({
    type: ResponseDepartamentoDto,
    description: 'Departamento creado correctamente',
  })
  create(@Body() dto: CreateDepartamentoDto) {
    return this.deptoService.create(dto);
  }

  @Get()
  @ApiResponse({
    type: [ResponseDepartamentoDto],
    description: 'Listado de departamentos',
  })
  findAll() {
    return this.deptoService.findAll();
  }

  
}