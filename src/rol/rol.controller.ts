import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolService } from './rol.service';
import { ResponseRolDto } from './dto/response-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida correctamente',
    type: [ResponseRolDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll() {
    return await this.rolService.findAll();
  }
}

