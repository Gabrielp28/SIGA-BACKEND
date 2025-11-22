import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';

@ApiTags('Storage')
@Controller('storage')
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir un archivo (imagen, PDF o Word)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (imagen, PDF o Word, máx 10MB)',
        },
        folder: {
          type: 'string',
          description: 'Carpeta donde guardar el archivo (opcional)',
          example: 'documentos',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://...' },
        path: { type: 'string', example: 'documentos/1234567890-abc123.pdf' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Error de validación o tipo de archivo no permitido' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.storageService.uploadFile(file, folder);
  }

  @Post('upload/:folder')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir un archivo a una carpeta específica' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'folder', description: 'Nombre de la carpeta', example: 'documentos' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo subido exitosamente' })
  async uploadFileToFolder(
    @Param('folder') folder: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.storageService.uploadFile(file, folder);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Subir múltiples archivos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          description: 'Carpeta donde guardar los archivos (opcional)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivos subidos exitosamente' })
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))/,
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }
    return this.storageService.uploadFiles(files, folder);
  }

  @Delete('file')
  @ApiOperation({ summary: 'Eliminar un archivo' })
  @ApiQuery({
    name: 'path',
    description: 'Ruta del archivo a eliminar',
    example: 'documentos/1234567890-abc123.pdf',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Archivo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async deleteFile(@Query('path') path: string) {
    if (!path) {
      throw new BadRequestException('El parámetro path es requerido');
    }
    return this.storageService.deleteFile(path);
  }

  @Get('url')
  @ApiOperation({ summary: 'Obtener URL pública de un archivo' })
  @ApiQuery({
    name: 'path',
    description: 'Ruta del archivo',
    example: 'documentos/1234567890-abc123.pdf',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'URL del archivo' })
  getPublicUrl(@Query('path') path: string) {
    if (!path) {
      throw new BadRequestException('El parámetro path es requerido');
    }
    return {
      url: this.storageService.getPublicUrl(path),
    };
  }

  @Get('signed-url')
  @ApiOperation({ summary: 'Obtener URL firmada (temporal) de un archivo' })
  @ApiQuery({
    name: 'path',
    description: 'Ruta del archivo',
    example: 'documentos/1234567890-abc123.pdf',
    required: true,
  })
  @ApiQuery({
    name: 'expiresIn',
    description: 'Tiempo de expiración en segundos (opcional, default: 3600)',
    required: false,
    example: 3600,
  })
  @ApiResponse({ status: 200, description: 'URL firmada del archivo' })
  async getSignedUrl(
    @Query('path') path: string,
    @Query('expiresIn') expiresIn?: number,
  ) {
    if (!path) {
      throw new BadRequestException('El parámetro path es requerido');
    }
    const expires = expiresIn ? parseInt(expiresIn.toString(), 10) : 3600;
    const signedUrl = await this.storageService.getSignedUrl(path, expires);
    return { url: signedUrl, expiresIn: expires };
  }

  @Get('list')
  @ApiOperation({ summary: 'Listar archivos en el bucket' })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Carpeta a listar (opcional)',
  })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  async listFiles(@Query('folder') folder?: string) {
    return this.storageService.listFiles(folder);
  }
}

