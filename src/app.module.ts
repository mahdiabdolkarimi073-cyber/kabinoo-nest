import { Module } from '@nestjs/common';
import { RoutesModule } from '@/core/FsRouter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        RoutesModule.forRoot()
    ],
})
export class AppModule {
}
