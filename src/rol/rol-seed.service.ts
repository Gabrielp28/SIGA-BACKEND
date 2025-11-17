import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from 'src/common/entities/roles.entity';
import { RolEnum } from 'src/common/enums/roles.enum';

@Injectable()
export class RolSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles(): Promise<void> {
    const roles = [
      {
        nombre_rol: RolEnum.COORDINADOR,
        descripcion: 'Rol de coordinador académico',
        nivel_acceso: 3,
      },
      {
        nombre_rol: RolEnum.DIRECTORES,
        descripcion: 'Rol de director académico',
        nivel_acceso: 2,
      },
      {
        nombre_rol: RolEnum.DOCENTES,
        descripcion: 'Rol de docente',
        nivel_acceso: 1,
      },
    ];

    for (const rolData of roles) {
      const existingRol = await this.rolRepository.findOne({
        where: { nombre_rol: rolData.nombre_rol },
      });

      if (!existingRol) {
        const rol = this.rolRepository.create(rolData);
        await this.rolRepository.save(rol);
        console.log(`✅ Rol ${rolData.nombre_rol} creado exitosamente`);
      } else {
        console.log(`ℹ️  Rol ${rolData.nombre_rol} ya existe, omitiendo...`);
      }
    }
  }
}

