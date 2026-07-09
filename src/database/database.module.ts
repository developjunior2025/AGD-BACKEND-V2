import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'mysql',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          synchronize: db.synchronize,
          logging: db.logging,
          autoLoadEntities: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
