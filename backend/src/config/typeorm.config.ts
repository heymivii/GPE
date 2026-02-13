import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const host = configService.get<string>('DB_HOST') || 'localhost';
    const useSsl =
      configService.get<string>('DB_SSL') === 'true' ||
      host.includes('supabase.co');

    return {
      type: 'postgres',

      host,
      port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
      username: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASS'),
      database: configService.get<string>('DB_NAME'),

      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      autoLoadEntities: true,

      synchronize: configService.get<string>('TYPEORM_SYNC') === 'true',

      logging: true,

      ssl: useSsl ? { require: true, rejectUnauthorized: false } : false,

      extra: useSsl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined,
    };
  },
};
