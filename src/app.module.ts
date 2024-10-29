import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MarksModule } from './marks/marks.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { DB_CONNECTION_CONFIG } from './typeOrm-config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MarksModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => DB_CONNECTION_CONFIG as TypeOrmModuleOptions,
      inject: [ConfigService],
    }),
    CategoriesModule,
  ],
})
export class AppModule {}
