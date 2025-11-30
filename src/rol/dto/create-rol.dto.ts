import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsOptional,
    MaxLength,
    Min,
    Max,
} from 'class-validator';

export class CreateRolDto {
    @ApiProperty({
        description: 'Nombre del rol',
        example: 'Administrador',
        maxLength: 50,
    })
    @IsString()
    @MaxLength(50)
    nombre_rol: string;

    @ApiPropertyOptional({
        description: 'Descripción del rol',
        example: 'Rol con acceso completo al sistema',
    })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional({
        description: 'Nivel de acceso del rol (1-10)',
        example: 5,
        minimum: 1,
        maximum: 10,
        default: 1,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    nivel_acceso?: number;
}
