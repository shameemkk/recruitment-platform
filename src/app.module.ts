import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { ClientModule } from './modules/client/client.module';
import { JobTemplateModule } from './modules/job-template/job-template.module';
import { JobVacancyModule } from './modules/job-vacancy/job-vacancy.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './modules/auth/auth.module';
import databaseConfig from './config/database.config';
import adminConfig from './config/admin.config';
import jwtConfig from './config/jwt.config';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, adminConfig, jwtConfig],
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
        ClientModule,
        JobTemplateModule,
        JobVacancyModule,
        CandidateModule,
        SeedModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
