import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import databaseConfig from './config/database.config';


@Module({
  imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
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
    
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}
