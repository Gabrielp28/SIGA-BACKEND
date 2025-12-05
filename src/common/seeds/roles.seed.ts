import { DataSource } from 'typeorm';
import { Rol } from '../entities/roles.entity';
import { RolEnum } from '../enums/roles.enum';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const rolRepository = dataSource.getRepository(Rol);

  const roles = [
    {
      nombre_rol: RolEnum.ADMINISTRADOR,
      descripcion: 'Rol de administrador del sistema',
      nivel_acceso: 4,
    },
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
    const existingRol = await rolRepository.findOne({
      where: { nombre_rol: rolData.nombre_rol },
    });

    if (!existingRol) {
      const rol = rolRepository.create(rolData);
      await rolRepository.save(rol);
      console.log(`Rol ${rolData.nombre_rol} creado exitosamente`);
    } else {
      console.log(`Rol ${rolData.nombre_rol} ya existe, omitiendo...`);
    }
  }
}

