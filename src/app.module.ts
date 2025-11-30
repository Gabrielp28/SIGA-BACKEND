// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CarreraModule } from './carrera/carrera.module';
import { DepartamentoModule } from './departamento/departamento.module';
import { GrupoModule } from './grupo/grupo.module';
import { AsignaturasModule } from './asignaturas/asignaturas.module';
import { DocenteModule } from './docente/docente.module';
import { GrupoAsignaturaDocenteModule } from './grupo-asignatura-docente/grupo-asignatura-docente.module';
import { PlanModule } from './plan/plan.module';
import { RolModule } from './rol/rol.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,

        // 👇 ESTA ES LA PARTE CLAVE
        ssl: {
          rejectUnauthorized: false, // Acepta conexiones SSL sin validar el certificado
        },
      }),
    }),
    UsuarioModule,
    AuthModule,
    CarreraModule,
    DepartamentoModule,
    GrupoModule,
    AsignaturasModule,
    DocenteModule,
    GrupoAsignaturaDocenteModule,
    PlanModule,
    RolModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}