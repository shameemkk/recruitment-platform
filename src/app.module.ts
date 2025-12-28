import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { SeedModule } from './seed/seed.module';
import databaseConfig from './config/database.config';
import adminConfig from './config/admin.config';


@Module({
  imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig,adminConfig],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('database.uri'),
            }),
            inject: [ConfigService],
        }),
        UserModule,
        PermissionModule,
        RoleModule,
        SeedModule,
    
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}
