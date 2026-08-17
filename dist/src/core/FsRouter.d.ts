import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
export declare class RoutesModule implements NestModule {
    private static middlewareConfigs;
    static forRoot(dir?: string): DynamicModule;
    private static discoverControllersAndMiddleware;
    configure(consumer: MiddlewareConsumer): void;
}
