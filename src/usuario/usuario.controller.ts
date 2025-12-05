import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';
import { UsuarioResponseDto } from './dto/response-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Usuarios')
@Controller('usuario')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description: 'Obtiene la lista de usuarios. Puede incluir roles si se especifica el parámetro includeRoles=true',
  })
  @ApiQuery({
    name: 'includeRoles',
    required: false,
    type: Boolean,
    description: 'Incluir roles en la respuesta',
    example: true,
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query('includeRoles') includeRoles?: string) {
    const include = includeRoles === 'true';
    return this.usuarioService.findAll(include);
  }

  @Get('with-roles')
  @ApiOperation({
    summary: 'Obtener todos los usuarios con sus roles',
    description: 'Obtiene la lista completa de usuarios incluyendo sus roles asignados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios con roles',
    type: [UsuarioResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAllWithRoles() {
    return this.usuarioService.findAllWithRoles();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene un usuario específico. Puede incluir roles si se especifica el parámetro includeRoles=true',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiQuery({
    name: 'includeRoles',
    required: false,
    type: Boolean,
    description: 'Incluir roles en la respuesta',
    example: true,
  })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findOne(
    @Param('id') id: string,
    @Query('includeRoles') includeRoles?: string,
  ) {
    const include = includeRoles === 'true';
    return this.usuarioService.findOne(+id, include);
  }

  @Get(':id/with-roles')
  @ApiOperation({
    summary: 'Obtener usuario por ID con sus roles',
    description: 'Obtiene un usuario específico incluyendo todos sus roles asignados',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado con roles',
    type: UsuarioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findOneWithRoles(@Param('id') id: string) {
    return this.usuarioService.findOneWithRoles(+id);
  }

  @Get(':id/roles')
  @ApiOperation({
    summary: 'Obtener roles de un usuario',
    description: 'Obtiene todos los roles asignados a un usuario específico',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de roles del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getRolesByUsuario(@Param('id') id: string) {
    return this.usuarioService.getRolesByUsuario(+id);
  }

  @Post(':id/roles')
  @Public()
  @ApiOperation({
    summary: 'Asignar rol a usuario',
    description: 'Asigna un rol a un usuario. Si el usuario ya tiene un rol activo, se desactiva automáticamente. Solo un rol activo por usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiCreatedResponse({
    description: 'Rol asignado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene este rol asignado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  asignarRol(@Param('id') id: string, @Body() asignarRolDto: AsignarRolDto) {
    return this.usuarioService.asignarRol(+id, asignarRolDto);
  }

  @Patch(':id/roles/:idUsuarioRol')
  @ApiOperation({
    summary: 'Actualizar rol de usuario',
    description: 'Actualiza un rol asignado a un usuario. Puede cambiar el rol o el estado de la asignación.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiParam({
    name: 'idUsuarioRol',
    description: 'ID de la asignación de rol (UsuarioRol)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Rol actualizado correctamente' })
  @ApiResponse({
    status: 404,
    description: 'Usuario, rol o asignación no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene el nuevo rol asignado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  actualizarRol(
    @Param('id') id: string,
    @Param('idUsuarioRol') idUsuarioRol: string,
    @Body() actualizarRolDto: ActualizarRolDto,
  ) {
    return this.usuarioService.actualizarRol(+id, +idUsuarioRol, actualizarRolDto);
  }

  @Delete(':id/roles/:idUsuarioRol')
  @ApiOperation({
    summary: 'Remover rol de usuario',
    description: 'Elimina la asignación de un rol específico de un usuario',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiParam({
    name: 'idUsuarioRol',
    description: 'ID de la asignación de rol (UsuarioRol)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Rol removido correctamente' })
  @ApiResponse({
    status: 404,
    description: 'Usuario o asignación no encontrada',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  removerRol(@Param('id') id: string, @Param('idUsuarioRol') idUsuarioRol: string) {
    return this.usuarioService.removerRol(+id, +idUsuarioRol);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}
