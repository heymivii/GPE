import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const host = configService.get<string>('DB_HOST') || 'localhost';
    const useSsl =
      configService.get<string>('DB_SSL') === 'true' || host.includes('supabase.co');

    return {
      type: 'postgres',

      host,
      port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
      username: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASS'),
      database: configService.get<string>('DB_NAME'),

      // ✅ Auto-charge toutes les entités du projet
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      autoLoadEntities: true,

      // ⚙️ IMPORTANT: Désactivé car on utilise les migrations
      synchronize: false,

      // ✅ Afficher les requêtes SQL (utile pour debug)
      logging: true,

      // ✅ SSL conditionnel (activé pour Supabase ou si DB_SSL=true)
      ssl: useSsl ? { require: true, rejectUnauthorized: false } : false,

      // ✅ Option de stabilité pour éviter les erreurs IPv6 sous WSL
      extra: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
    };
  },
};