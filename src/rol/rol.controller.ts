import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RolService } from './rol.service';
import { ResponseRolDto } from './dto/response-rol.dto';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { QueryRolDto } from './dto/query-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description: 'Crea un nuevo rol en el sistema. El nombre del rol debe ser único.',
  })
  @ApiCreatedResponse({
    description: 'Rol creado correctamente',
    type: ResponseRolDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación o rol duplicado',
  })
  create(@Body() createDto: CreateRolDto) {
    return this.rolService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los roles',
    description:
      'Obtiene la lista de roles con opciones de búsqueda, filtrado, ordenamiento y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida correctamente',
    type: [ResponseRolDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de roles',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ResponseRolDto' } },
        total: { type: 'number', example: 10 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() query?: QueryRolDto) {
    return this.rolService.findAll(query);
  }

  @Get('nombre/:nombre')
  @ApiOperation({
    summary: 'Obtener rol por nombre',
    description: 'Obtiene un rol específico por su nombre',
  })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del rol',
    example: 'Administrador',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado',
    type: ResponseRolDto,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findByNombre(@Param('nombre') nombre: string) {
    return this.rolService.findByNombre(nombre);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Obtiene un rol específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado',
    type: ResponseRolDto,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id') id: string) {
    return this.rolService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Actualiza los datos de un rol existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado correctamente',
    type: ResponseRolDto,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Error de validación o rol duplicado',
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateRolDto) {
    return this.rolService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar rol',
    description:
      'Elimina un rol. No se puede eliminar si está asignado a algún usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar: el rol está asignado a usuarios',
  })
  remove(@Param('id') id: string) {
    return this.rolService.remove(+id);
  }
}

