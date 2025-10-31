import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Usuario } from '../common/entities/usuarios.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioRol } from '../common/entities/usuarios_roles.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usuarioService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Obtener roles del usuario
    const usuarioRoles = await this.usuarioRolRepository.find({
      where: { id_usuario: user.id_usuario, estado: 'activo' },
      relations: ['rol'],
    });

    const roles = usuarioRoles.map((ur) => ur.rol?.nombre_rol).filter(Boolean);

    const { password: _, ...result } = user;
    return { ...result, roles };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    // Actualizar último acceso
    await this.usuarioService.updateLastAccess(user.id_usuario);

    const payload = {
      sub: user.id_usuario,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id_usuario: user.id_usuario,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el username ya existe
    const existingUser = await this.usuarioService.findByUsername(
      registerDto.username,
    );

    if (existingUser) {
      throw new ConflictException('El username ya está en uso');
    }

    // Verificar si el email ya existe
    const existingEmail = await this.usuarioService.findByEmail(
      registerDto.email,
    );

    if (existingEmail) {
      throw new ConflictException('El email ya está en uso');
    }

    // Crear usuario
    const user = await this.usuarioService.create(registerDto);

    // Obtener roles (vacío por defecto)
    const roles: string[] = [];

    const payload = {
      sub: user.id_usuario,
      username: user.username,
      email: user.email,
      roles,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id_usuario: user.id_usuario,
        username: user.username,
        email: user.email,
        roles,
      },
    };
  }

  async validateJwtPayload(payload: any): Promise<Usuario | null> {
    const user = await this.usuarioService.findOne(payload.sub);

    if (!user || user.estado !== 'activo') {
      return null;
    }

    return user;
  }
}

