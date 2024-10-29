import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const configService = new ConfigService();

export const DB_CONNECTION_CONFIG = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  schema: configService.get('DB_SCHEMA'),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
};

export default new DataSource(DB_CONNECTION_CONFIG as DataSourceOptions);


//npm run migration:generate src/migrations/migration

//npm run migration:run 

//npm run migration:down

//npm run migration:create src/migrations/init