import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from 'src/common/entities/roles.entity';
import { UsuarioRol } from 'src/common/entities/usuarios_roles.entity';
import { Usuario } from 'src/common/entities/usuarios.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepo: Repository<UsuarioRol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  /**
   * Lista todos los roles disponibles
   */
  async findAll(): Promise<Rol[]> {
    return await this.rolRepo.find({
      order: { nivel_acceso: 'ASC', nombre_rol: 'ASC' },
    });
  }
}

